# github-gist-search-extension

Chrome extension to search your gists with a GitHub-style centered search overlay and qualifier suggestions.

## What it does

On supported `gist.github.com` pages, the extension replaces the in-header search interaction with a centered GitHub-style search overlay and:

- documented gist qualifiers from GitHub Docs
- helper expansion for `@me` to `user:<logged-in-username>`
- autocomplete for common `language:` values
- autocomplete for common `extension:` values
- keyboard navigation with arrow keys, `Enter`, and `Escape`
- theme-aware styling that follows the user's current GitHub theme

The extension only activates when the page appears to be logged in.

## Supported pages

The extension binds to gist search inputs across `https://gist.github.com/*` when the user is logged in, including the home page, user gist listings, and gist search result pages.

## Project layout

- `src/extension/`: source files for the Chrome extension
- `dist/extension/`: clean build artifact to load unpacked locally or upload to the Chrome Web Store
- `tests/`: Playwright regression suite that runs against the built extension bundle
- `docs/`: implementation notes captured from live GitHub behavior
- `.github/workflows/`: CI, release, and Chrome Web Store publishing automation

## Build the extension

```bash
npm install
npm run build
```

This writes the publishable unpacked extension bundle to `dist/extension/`.

## Quality checks

```bash
npm run lint
npm run format:check
npm test
```

To run the full local gate that mirrors CI:

```bash
npm run check
```

## Pre-commit hooks

This repo uses `husky` and `lint-staged`. After `npm install`, the `pre-commit` hook is installed automatically and will:

- run `eslint --fix` on staged JavaScript files
- run `prettier --write` on staged JavaScript, CSS, JSON, Markdown, and YAML files

The hook is intentionally fast and does not run Playwright. The full regression suite stays in CI.

## Install locally

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable `Developer mode`
4. Click `Load unpacked`
5. Select `dist/extension`

## Run tests

```bash
npm test
```

For local interactive debugging:

```bash
npm run test:headed
```

In CI, the same suite can run under Xvfb against the built bundle:

```bash
xvfb-run -a npm test
```

## Release publishing

The release workflow packages `dist/github-gist-search-extension.zip`, uploads it to the GitHub release, and can publish it to the Chrome Web Store with [`puzzlers-labs/chrome-webstore-publish`](https://github.com/puzzlers-labs/chrome-webstore-publish).

Chrome Web Store publishing requires:

- repository variable `CWS_EXTENSION_ID`
- repository secret `CWS_CLIENT_ID`
- repository secret `CWS_CLIENT_SECRET`
- repository secret `CWS_REFRESH_TOKEN`

The workflow skips the publish step when those values are absent. The first Chrome Web Store publish still has to be done manually.

## Notes

The qualifier list is based on the official GitHub Docs page for searching gists:

- `user:`
- `anon:true`
- `NOT`
- `fork:only`
- `filename:`
- `language:`
- `extension:`
- `stars:>`
- `size:>`
