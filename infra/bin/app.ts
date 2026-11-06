import * as cdk from 'aws-cdk-lib';
import { PortfolioStack } from '../lib/stack';
import 'dotenv/config';

const need = (k: string) => { const v = process.env[k]; if (!v) throw new Error(`Set ${k} before deploying`); return v; };
new PortfolioStack(new cdk.App(), 'PortfolioStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? 'ap-south-1' },
  domain: need('DOMAIN'), alarmEmail: need('ALARM_EMAIL'), adminEmail: need('ADMIN_EMAIL'), adminPasswordHash: need('ADMIN_PASSWORD_HASH'),
});
