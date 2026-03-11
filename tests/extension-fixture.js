const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test: base, expect, chromium } = require('@playwright/test');
const { buildMockGistPage } = require('./helpers/mock-gist-page');

const extensionPath = path.resolve(__dirname, '..', 'dist', 'extension');

const test = base.extend({
  context: async ({}, use) => {
    if (!fs.existsSync(path.join(extensionPath, 'manifest.json'))) {
      throw new Error(
        `Built extension not found at ${extensionPath}. Run npm run build first.`,
      );
    }

    const userDataDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gse-playwright-'),
    );
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: process.env.GSE_HEADLESS !== 'false',
      viewport: { width: 1440, height: 1200 },
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    await context.route('https://gist.github.com/**', async (route) => {
      if (route.request().resourceType() !== 'document') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: buildMockGistPage(route.request().url()),
      });
    });

    try {
      await use(context);
    } finally {
      await context.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  },

  page: async ({ context }, use) => {
    const page = context.pages()[0] || (await context.newPage());
    await use(page);
  },
});

module.exports = {
  test,
  expect,
};
