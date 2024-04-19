const { getLightHouseIssue } = require('./issue');

const createPullRequestComment = async ({ octokit, context, body }) => {
  const comments = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
  });
  const lighthouseReportTrackerComment = comments.data.find(
    comment => comment.user.login === 'github-actions[bot]'
  );

  if (lighthouseReportTrackerComment) {
    return await octokit.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      comment_id: lighthouseReportTrackerComment.id,
      body,
    });
  }
  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
    body,
  });
};

const formatMetricValueDifference = (curr, prev) => {
  if (prev === '➖') return '➖';
  const diff = prev - curr;
  return `${
    diff === 0 ? '➖' : diff > 0 ? '🔻' + -diff : '🔺' + Math.abs(diff)
  }`;
};

const createReportComparisonTable = async ({
  octokit,
  context,
  currentReports,
}) => {
  const lighthouseIssue = await getLightHouseIssue(octokit, context);
  const previousReports = lighthouseIssue
    ? JSON.parse(JSON.stringify(lighthouseIssue.body))
    : [];

  let commentBody = `### Lighthouse Report\n\n`;

  currentReports.forEach(currReport => {
    const prevReport = previousReports?.find(
      prevReport => prevReport.url === currReport.url
    );

    const tableHeading = `#### ${currReport.url} \n`;
    const rowHeader = `| Metric | Previous Score ${
      prevReport ? `(#${prevReport.pr})` : ''
    } | Current Score(#${
      context.payload.pull_request.number
    }) | Difference |\n`;
    const seperator = `|:------:|:----------------:|:-----------------:|:----------:|\n`;

    let baseTable = tableHeading + rowHeader + seperator;

    Object.keys(currReport.summary).forEach(metric => {
      const currValue = currReport.summary[metric] * 100;
      const prevValue = prevReport ? prevReport.summary[metric] * 100 : '➖';
      const difference = formatMetricValueDifference(currValue, prevValue);

      baseTable += `| ${metric} | ${prevValue} | ${currValue} | ${difference} |\n`;
    });

    commentBody += baseTable + '\n\n';
  });

  return commentBody;
};

module.exports = { createPullRequestComment, createReportComparisonTable };
