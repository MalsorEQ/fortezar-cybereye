const icon = { high: 'HIGH', medium: 'MED ', low: 'LOW ', info: 'INFO' };

export function toText(report) {
  const lines = [
    'ForteZar CyberEye',
    `Target: ${report.target}`,
    `Final:  ${report.finalUrl}`,
    `HTTP:   ${report.status}`,
    `Score:  ${report.score}/100`,
    `Findings: ${report.summary.high} high, ${report.summary.medium} medium, ${report.summary.low} low, ${report.summary.info} info`,
    ''
  ];
  if (report.findings.length === 0) lines.push('No findings from the current passive rule set.');
  for (const f of report.findings) {
    lines.push(`[${icon[f.severity] ?? f.severity}] ${f.id} — ${f.title}`);
    lines.push(`  ${f.message}`);
    lines.push(`  Fix: ${f.remediation}`);
    lines.push('');
  }
  lines.push('Passive checks only. A clean report does not prove a site is secure.');
  return lines.join('\n');
}
