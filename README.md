# Technical portfolio (Next.js + TypeScript on AWS)

Public site at your domain. Only you can edit, via `/admin` (single admin, bcrypt password, signed httpOnly session cookie).

| Concern | AWS service |
|---|---|
| Site content (one document) | DynamoDB |
| Images | S3 (private) + CloudFront |
| Contact messages | RDS PostgreSQL (isolated subnet) |
| Hosting | ECS Fargate x2 behind an HTTPS ALB (ACM cert) |
| DNS | Route 53 alias record |
| Logs, metrics, alarms | CloudWatch (JSON logs, EMF custom metrics, 4 alarms -> email) |

## Deploy
Prerequisites: AWS CLI configured, Docker running, Node 20+, and a Route 53 hosted zone for your domain.

```bash
npm install
HASH=$(node -e "console.log(require('bcryptjs').hashSync(process.argv[1],12))" 'choose-a-long-password')

cd infra && npm install
npx cdk bootstrap            # first time per account/region
export DOMAIN=yourdomain.com ALARM_EMAIL=you@example.com ADMIN_EMAIL=you@example.com
export ADMIN_PASSWORD_HASH="$HASH"
npx cdk deploy
```
Confirm the SNS subscription email, then open `https://yourdomain.com` and sign in at `/admin`.
Default region is `ap-south-1`; set `CDK_DEFAULT_REGION` to change it.

## Local development
`cp .env.example .env.local`, fill in values (AWS credentials come from your CLI profile), `npm run dev`.
Without `TABLE_NAME` the site shows placeholder content.

## Notes
- Cost is roughly USD 60-70/month (ALB, 2 Fargate tasks, RDS t4g.micro, public IPv4 addresses). Set `desiredCount: 1` to trim it.
- Content edits appear within 60 seconds (ISR; each task refreshes independently).
- Rate limiting is in-memory per task. Add AWS WAF on the ALB if you want a hard limit.
- DynamoDB, S3 and RDS are set to RETAIN, so `cdk destroy` will not delete your data.
