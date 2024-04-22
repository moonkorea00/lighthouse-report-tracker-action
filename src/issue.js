const issueTitle = 'Lighthouse Report Log';

const getLightHouseIssue = async (octokit, context) => {
  const issues = await octokit.rest.issues.listForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    labels: ['lighthouse'],
  });
  const issue = issues.data?.find(issue => issue.title === issueTitle);

  return {
    issue,
    body: issue ? JSON.parse(issue.body) : [],
  };
};

const mutateLighthouseIssue = async ({ octokit, context, reports }) => {
  const { issue, body } = await getLightHouseIssue(octokit, context);

  const issueBody = JSON.stringify([reports, ...body]);

  if (issue) {
    return await octokit.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: issueBody,
    });
  }
  await octokit.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: issueTitle,
    body: issueBody,
    labels: ['lighthouse'],
  });
};

module.exports = { getLightHouseIssue, mutateLighthouseIssue };
