# What is this?
This GitHub action checks PRs to ensure that at least one commit
in the PR satisfies a really simplified version of
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).



# How to use:

```
on:
  pull_request:

jobs:
  check-commits:
    runs-on: ubuntu-latest
    name: "Check conventional commits"
    steps:
      - name: "Check commits"
        uses: daily-co/check-commitlint@v1
        with:
          types: feat,fix,improvement
