import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cf from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as r53 from 'aws-cdk-lib/aws-route53';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import * as cwa from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';

interface Props extends cdk.StackProps { domain: string; alarmEmail: string; adminEmail: string; adminPasswordHash: string }

export class PortfolioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, p: Props) {
    super(scope, id, p);

    // Route 53: the hosted zone for your domain must already exist (created automatically when you register in Route 53).
    const zone = r53.HostedZone.fromLookup(this, 'Zone', { domainName: p.domain });

    // Site content (DynamoDB)
    const table = new ddb.Table(this, 'Content', {
      partitionKey: { name: 'pk', type: ddb.AttributeType.STRING }, sortKey: { name: 'sk', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Images (S3, private, served through CloudFront)
    const bucket = new s3.Bucket(this, 'Assets', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, encryption: s3.BucketEncryption.S3_MANAGED, enforceSSL: true, versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [{ allowedMethods: [s3.HttpMethods.PUT], allowedOrigins: [`https://${p.domain}`], allowedHeaders: ['*'] }],
    });
    const cdn = new cf.Distribution(this, 'Cdn', {
      defaultBehavior: { origin: origins.S3BucketOrigin.withOriginAccessControl(bucket), viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS },
    });

    // Network: app in public subnets (no NAT cost), database in isolated subnets.
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2, natGateways: 0,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'db', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });

    // Contact messages (RDS PostgreSQL)
    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc, vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED }, databaseName: 'portfolio',
      credentials: rds.Credentials.fromGeneratedSecret('portfolio'), allocatedStorage: 20, storageEncrypted: true,
      backupRetention: cdk.Duration.days(7), deletionProtection: true, removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const sessionSecret = new sm.Secret(this, 'Session', { generateSecretString: { passwordLength: 48, excludePunctuation: true } });

    // App: ECS Fargate behind an HTTPS ALB with an ACM cert and a Route 53 alias record (all created by this pattern).
    const svc = new ecsp.ApplicationLoadBalancedFargateService(this, 'Web', {
      vpc, cpu: 512, memoryLimitMiB: 1024, desiredCount: 2, assignPublicIp: true, taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      domainName: p.domain, domainZone: zone, protocol: elbv2.ApplicationProtocol.HTTPS, redirectHTTP: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../..'), { platform: ecrAssets.Platform.LINUX_AMD64 }),
        containerPort: 3000,
        environment: {
          TABLE_NAME: table.tableName, BUCKET_NAME: bucket.bucketName, ASSET_BASE_URL: `https://${cdn.distributionDomainName}`,
          DB_HOST: db.dbInstanceEndpointAddress, DB_PORT: db.dbInstanceEndpointPort, DB_NAME: 'portfolio',
          ADMIN_EMAIL: p.adminEmail, ADMIN_PASSWORD_HASH: p.adminPasswordHash,
        },
        secrets: {
          DB_USER: ecs.Secret.fromSecretsManager(db.secret!, 'username'), DB_PASSWORD: ecs.Secret.fromSecretsManager(db.secret!, 'password'),
          SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret),
        },
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'web', logRetention: logs.RetentionDays.ONE_MONTH }),
      },
    });
    svc.targetGroup.configureHealthCheck({ path: '/api/health' });
    table.grantReadWriteData(svc.taskDefinition.taskRole);
    bucket.grantReadWrite(svc.taskDefinition.taskRole);
    db.connections.allowDefaultPortFrom(svc.service);

    // CloudWatch: alarms -> email
    const topic = new sns.Topic(this, 'Alerts');
    topic.addSubscription(new subs.EmailSubscription(p.alarmEmail));
    const act = new cwa.SnsAction(topic);
    const alarms = [
      new cw.Alarm(this, 'Http5xx', { metric: svc.targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT, { period: cdk.Duration.minutes(5) }), threshold: 10, evaluationPeriods: 1, treatMissingData: cw.TreatMissingData.NOT_BREACHING }),
      new cw.Alarm(this, 'Unhealthy', { metric: svc.targetGroup.metrics.unhealthyHostCount(), threshold: 1, evaluationPeriods: 2, treatMissingData: cw.TreatMissingData.NOT_BREACHING }),
      new cw.Alarm(this, 'DbCpu', { metric: db.metricCPUUtilization(), threshold: 80, evaluationPeriods: 3 }),
      new cw.Alarm(this, 'LoginFailures', { metric: new cw.Metric({ namespace: 'Portfolio', metricName: 'LoginFailed', statistic: 'Sum', period: cdk.Duration.minutes(5) }), threshold: 10, evaluationPeriods: 1, treatMissingData: cw.TreatMissingData.NOT_BREACHING }),
    ];
    alarms.forEach((a) => a.addAlarmAction(act));

    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${p.domain}` });
  }
}
