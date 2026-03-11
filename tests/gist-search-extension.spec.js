const { test, expect } = require('./extension-fixture');

async function gotoSearchPage(page, query = '') {
  await page.goto(
    `https://gist.github.com/search?q=${encodeURIComponent(query)}`,
  );
  await page.waitForFunction(
    () =>
      document.querySelectorAll('form[action="/search"][data-gse-bound="true"]')
        .length === 2,
  );
}

async function openOverlay(page, selector = '#page-search-input') {
  await page.locator(selector).click();
  await expect(page.locator(".gse-root [role='dialog']")).toHaveCount(1);
}

test('keeps a single overlay instance across both native search forms', async ({
  page,
}) => {
  await gotoSearchPage(page);

  await openOverlay(page, '#page-search-input');
  await page.keyboard.press('Escape');
  await openOverlay(page, '#header-search-input');

  expect(await page.locator('.gse-root').count()).toBe(1);
  expect(await page.locator(".gse-root [role='dialog']").count()).toBe(1);
});

test('native search button submits a normalized relative-date query without reopening the overlay', async ({
  page,
}) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  await page.locator('.gse-input').fill('months:>2');
  await page.keyboard.press('Escape');

  await expect(page.locator('#page-search-input')).toHaveValue('months:>2');
  await page.locator('#page-search-button').click();

  await expect(page).toHaveURL(/q=created%3A%3E/);
  await expect(page.locator(".gse-root [role='dialog']")).toBeHidden();
});

test('date helpers expose both directions with descriptive copy', async ({
  page,
}) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  await page.locator('.gse-input').fill('minutes:');

  await expect
    .poll(() => page.locator(".gse-list [role='option']").allInnerTexts())
    .toContain('minutes:>7\nNewer than 7 minutes ago.\nHelper');
  await expect
    .poll(() => page.locator(".gse-list [role='option']").allInnerTexts())
    .toContain('minutes:<7\nOlder than 7 minutes ago.\nHelper');
});

test('default helper list includes both newer-than and older-than shortcuts', async ({
  page,
}) => {
  await gotoSearchPage(page, 'created:>2026-01-11T01:37:11+00:00');
  await openOverlay(page);

  await page.locator('.gse-clearButton').click();

  const listText = await page.locator('.gse-list').innerText();
  expect(listText).toContain('minutes:>');
  expect(listText).toContain('minutes:<');
  expect(listText).toContain('hours:>');
  expect(listText).toContain('hours:<');
});

test('overlay input hit area spans the full input wrapper width', async ({
  page,
}) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  const hitTest = await page.evaluate(() => {
    const input = document.querySelector('.gse-input');
    const wrapper = document.querySelector(
      '.gse-root .QueryBuilder-InputWrapper',
    );

    if (!input || !wrapper) {
      return [];
    }

    const rect = wrapper.getBoundingClientRect();
    return [0.05, 0.5, 0.95].map((ratio) => {
      const x = rect.left + rect.width * ratio;
      const y = rect.top + rect.height / 2;
      return document.elementFromPoint(x, y) === input;
    });
  });

  expect(hitTest).toEqual([true, true, true]);
});

test('hover alone does not let Enter commit a suggestion', async ({ page }) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  await page.locator('.gse-input').fill('u');
  const firstOption = page.locator(".gse-list [role='option']").first();
  const box = await firstOption.boundingBox();

  if (!box) {
    throw new Error('Expected at least one suggestion row.');
  }

  await page.mouse.move(box.x + 4, box.y + 4);
  await page.mouse.move(box.x + 24, box.y + 20);
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/q=u$/);
});

test('keyboard selection still commits suggestions', async ({ page }) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  await page.locator('.gse-input').fill('u');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page.locator('.gse-input')).toHaveValue('user:');
  await expect(page).toHaveURL(/q=$/);
});

test('language autocomplete rows omit the extra helper description line', async ({
  page,
}) => {
  await gotoSearchPage(page);
  await openOverlay(page);

  await page.locator('.gse-input').fill('language:');
  await expect(
    page.locator(".gse-list [role='option'] .gse-description"),
  ).toHaveCount(0);
  await expect(page.locator(".gse-list [role='option']").first()).toContainText(
    'Autocomplete',
  );
});
