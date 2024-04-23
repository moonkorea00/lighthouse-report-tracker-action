const formatTrackerReports = (context, reports) => {
  const trackerReports = reports.map(report => ({
    url: report.url,
    summary: {
      performance: report.summary.performance,
      accessibility: report.summary.accessibility,
      'best-practices': report.summary['best-practices'],
      seo: report.summary.seo,
      pwa: report.summary.pwa,
    },
  }));

  return {
    pr: context.payload.pull_request.number,
    auditedAt: new Date().toISOString(),
    reports: trackerReports,
  };
};

const formatMetricValueDifference = (curr, prev) => {
  if (prev === '➖') return '➖';

  const diff = Math.trunc(prev) - Math.trunc(curr);
  const absoluteDiff = Math.abs(diff);

  return `${
    diff === 0 ? '➖' : diff > 0 ? `🔻${absoluteDiff}` : `🔺${absoluteDiff}`
  }`;
};

const scoreIndicator = score => {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟠';
  return '🔴';
};

module.exports = {
  formatTrackerReports,
  formatMetricValueDifference,
  scoreIndicator,
};
