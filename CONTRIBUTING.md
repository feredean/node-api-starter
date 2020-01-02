# For Contributors

Thank you for your interest to contribute to this project! I will try to keep this project as up to date as possible and expand on the functionality and integrations that are already present. This being said any contribution or feedback will be most welcome!

## Commit Messages

Really liked the format proposed by [puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/CONTRIBUTING.md#commit-messages).

Commit messages should follow the Semantic Commit Messages format:

```text
label(namespace): title

description

footer
```

1. _label_ is one of the following:
   - `fix` - bug fixes.
   - `feat` - features.
   - `deployment` - changes to CircleCI or Kubernetes configuration
   - `docs` - changes to docs
   - `test` - changes to tests
   - `style` - code style: spaces/alignment/wrapping etc.
   - `chore` - build-related work, e.g. eslint / tsconfig config changes
2. _namespace_ is put in parenthesis after label and is optional. Must be lowercase.
3. _title_ is a brief summary of changes.
4. _description_ is **optional**, new-line separated from title and is in present tense.
5. _footer_ is **optional**, new-line separated from _description_ and contains "fixes" / "references" attribution to github issues.
6. _footer_ should also include "BREAKING CHANGE" if current API clients will break due to this change. It should explain what changed and how to get the old behavior.

Example:

```txt
test(middleware): Add tests for middlewares

- add build script to keep the project updated
- add test for middlewares
- add test for duplicate accounts on register
- various other minor fixes

Fixes #123, Fixes #234
```
