const nock = require('nock');

test('run with Conforming commit', async () => {
  process.env.GITHUB_EVENT_PATH = "pr-event.json";
  process.env.GITHUB_EVENT_NAME = "pull_request";
  process.env.INPUT_COMMITLINT_CONFIG_PATH = ".commitlintrc.js";
  process.env.INPUT_GITHUB_TOKEN = "not-really-a-token";

  nock('https://api.github.com')
    .get('/repos/daily-co/pluot-core/pulls/5736/commits')
    .replyWithFile(200, __dirname + '/commits-success.json', { 'Content-type': 'application/json' });

  const action = require('./index');
  const returnValue = await action.run();
  expect(returnValue).toBe(0);

})

test('run with non-compliant commit', async () => {
  process.env.GITHUB_EVENT_PATH = "pr-event.json";
  process.env.GITHUB_EVENT_NAME = "pull_request";
  process.env.INPUT_COMMITLINT_CONFIG_PATH = ".commitlintrc.js";
  process.env.INPUT_GITHUB_TOKEN = "not-really-a-token";

  nock('https://api.github.com')
    .get('/repos/daily-co/pluot-core/pulls/5736/commits')
    .replyWithFile(200, __dirname + '/commits-failure.json', { 'Content-type': 'application/json' });

  const action = require('./index');
  const returnValue = await action.run();
  expect(returnValue).toBe(1);

})
