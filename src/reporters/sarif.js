const level = { high: 'error', medium: 'warning', low: 'note', info: 'note' };

export function toSarif(report) {
  const rules = [...new Map(report.findings.map((f) => [f.id, f])).values()].map((f) => ({
    id: f.id,
    name: f.title.replace(/[^A-Za-z0-9]+/g, ''),
    shortDescription: { text: f.title },
    help: { text: f.remediation },
    properties: { severity: f.severity }
  }));

  return {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: {
        driver: {
          name: 'ForteZar CyberEye',
          version: report.tool.version,
          informationUri: 'https://github.com/MalsorEQ/fortezar-cybereye',
          rules
        }
      },
      results: report.findings.map((f) => ({
        ruleId: f.id,
        level: level[f.severity] ?? 'note',
        message: { text: `${f.message} Remediation: ${f.remediation}` },
        locations: [{ physicalLocation: { artifactLocation: { uri: report.finalUrl } } }]
      }))
    }]
  };
}
