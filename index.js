const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const githubToken = core.getInput('github_token');
    const types = core.getInput('types').split(',');
    if (github.context.eventName === 'pull_request') {
      const octokit = github.getOctokit(githubToken);
      const eventPayload = github.context.payload;
      const { data: commits } = await octokit.rest.pulls.listCommits({
        owner: eventPayload.repository.owner.login,
        repo: eventPayload.repository.name,
        pull_number: eventPayload.number
      });
      if (!commits.some((c) => isConventional(c.commit.message, types))) {
        core.setFailed("Pull request requires a conventional commit message");
      }

    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function isConventional(message, types) {
  return types.some(t => message.startsWith(`${t}: `));

}

run();
