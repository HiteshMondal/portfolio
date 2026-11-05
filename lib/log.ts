// stdout is shipped to CloudWatch Logs by the ECS awslogs driver.
export const log = (level: 'info' | 'warn' | 'error', msg: string, extra: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ level, msg, ...extra }));

// CloudWatch Embedded Metric Format: this log line becomes a custom metric automatically.
export function metric(name: string, value = 1) {
  console.log(JSON.stringify({
    _aws: { Timestamp: Date.now(), CloudWatchMetrics: [{ Namespace: 'Portfolio', Dimensions: [[]], Metrics: [{ Name: name, Unit: 'Count' }] }] },
    [name]: value,
  }));
}
