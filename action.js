const format = require('@commitlint/format').default;
const lint = require('@commitlint/lint').default;
const load = require('@commitlint/load').default;
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
      const commitlintConfig = await load({}, { file: commitlintConfigPath });
      const commitlintOpts = getOptsFromConfig(commitlintConfig);
      for (let c of commits) {
        if (await isConventional(c.commit.message, commitlintConfig.rules, commitlintOpts)) {
          return 0;
        }
      }
      core.setFailed("Pull request requires at least one conventional commit message");
      return 1;
    }
  } catch (error) {
    console.error(error.message, error);
    core.setFailed(error.message, error);
    return 1;
  }
}

async function isConventional(message, rules, opts) {
  try {
    const result = await lint(message, rules, opts);
    if(!result.valid) {
      core.info(format({ results: [result] }, { color: true }));
    } else {
      core.info(`Conformant commit message: ${message}`);
    }
    return result.valid;
  } catch(error) {
    core.error(`Error ${JSON.stringify(error)}`);
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

exports.run = run;

