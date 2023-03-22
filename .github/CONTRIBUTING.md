# CodeGraphy Contributing Guide

Hi! I'm really excited that you are interested in contributing to CodeGraphy. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/joesobo/CodeGraphy/blob/main/.github/CODE_OF_CONDUCT.md)
- [Pull Request Guidelines](#pull-request-guidelines)

## Pull Request Guidelines

- All development should be done in dedicated branches.

- Checkout a topic branch from the relevant branch, e.g. `main`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:
  - If you are resolving a special issue, add `(fix #xxxx)` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

### Committing Changes

We prefer using commit messages that follow these [commit message convention](./COMMIT_CONVENTION.md) so that important changes are quickly and easily viewed from the code history.

### Commonly used scripts

```bash
# watch and auto re-build extension
$ pnpm watch
```

## Running the Project

```bash
# start watching for any changes
pnpm watch
```

Navigate to the `src/extension.ts`

Press `F5` to open up a debug window
