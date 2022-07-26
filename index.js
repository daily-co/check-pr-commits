const format = require('@commitlint/format').format;
const lint = require('@commitlint/lint').default;
const load = require('@commitlint/load').load;
const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const githubToken = core.getInput('github_token');
    const commitlintConfigPath = core.getInput('commitlint_config_path');
    if (github.context.eventName === 'pull_request') {
      const octokit = github.getOctokit(githubToken);
      const eventPayload = github.context.payload;
      const { data: commits } = await octokit.rest.pulls.listCommits({
        owner: eventPayload.repository.owner.login,
        repo: eventPayload.repository.name,
        pull_number: eventPayload.number
      });
      const commitlintConfig = load({}, { file: commitlintConfigPath });
      const commitlintOpts = getOptsFromConfig(commitlintConfig);
      if (!commits.some((c) => isConventional(c.commit.message, commitlintConfig.rules, commitlintOpts))) {
        core.setFailed("Pull request requires at least one conventional commit message");
      }

    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function isConventional(message, rules, opts) {
  try {
    const result = lint(message, rules, opts);
    core.info(format({ results: result }, { color: true}));
    return result.valid;
  } catch(error) {
    return false;
  }

}

function getOptsFromConfig(commitlintConfig) {
  return {
    parserOpts:
      commitlintConfig.parserPreset != null && commitlintConfig.parserPreset.parserOpts != null
        ? commitlintConfig.parserPreset.parserOpts
        : {},
    plugins: commitlintConfig.plugins != null ? commitlintConfig.plugins : {},
    ignores: commitlintConfig.ignores != null ? commitlintConfig.ignores : [],
    defaultIgnores:
      commitlintConfig.defaultIgnores != null ? commitlintConfig.defaultIgnores : true,
  }
}

run();
