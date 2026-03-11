function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildMockGistPage(urlString) {
  const url = new URL(urlString);
  const query = url.searchParams.get('q') || '';
  const heading = query ? `Search: ${query}` : 'Search';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="user-login" content="wallentx">
    <title>${escapeHtml(heading)}</title>
    <style>
      :root {
        color-scheme: dark;
        --fgColor-default: #f0f6fc;
        --fgColor-muted: #8b949e;
        --fgColor-accent: #4493f8;
        --bgColor-default: #0d1117;
        --bgColor-muted: rgba(110, 118, 129, 0.1);
        --bgColor-accent-muted: rgba(56, 139, 253, 0.15);
        --control-transparent-bgColor-hover: rgba(101, 108, 118, 0.2);
        --control-muted-fgColor-rest: #768390;
        --control-strong-fgColor-rest: #9ea7b3;
        --borderColor-default: #30363d;
        --borderColor-muted: #21262d;
        --shadow-floating-large: 0 16px 70px rgba(1, 4, 9, 0.85);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 2200px;
        color: var(--fgColor-default);
        background: var(--bgColor-default);
        font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      a {
        color: inherit;
      }

      .site-header,
      .search-page {
        padding: 16px 24px;
      }

      .site-header {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(13, 17, 23, 0.95);
        border-bottom: 1px solid var(--borderColor-muted);
        backdrop-filter: blur(12px);
      }

      .layout {
        display: grid;
        grid-template-columns: 1fr minmax(0, 1040px) 1fr;
      }

      .search-page {
        grid-column: 2;
      }

      .mock-form {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .mock-input {
        min-width: 0;
        flex: 1 1 auto;
        height: 40px;
        padding: 0 12px;
        color: var(--fgColor-default);
        background: #010409;
        border: 1px solid var(--borderColor-default);
        border-radius: 8px;
      }

      .mock-submit {
        height: 40px;
        padding: 0 16px;
        color: var(--fgColor-default);
        background: #21262d;
        border: 1px solid var(--borderColor-default);
        border-radius: 8px;
      }

      .mock-results {
        margin-top: 24px;
        padding: 24px;
        border: 1px solid var(--borderColor-muted);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.02);
      }

      .Overlay {
        color: var(--fgColor-default);
        background: var(--bgColor-default);
        border: 1px solid var(--borderColor-default);
        border-radius: 12px;
        box-shadow: var(--shadow-floating-large);
      }

      .Overlay-body {
        padding: 0;
      }

      .search-suggestions {
        overflow: hidden;
      }

      .query-builder-container {
        background: var(--bgColor-default);
      }

      .QueryBuilder {
        width: 100%;
      }

      .FormControl {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .FormControl-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .FormControl-input {
        width: 100%;
        min-width: 0;
        height: 32px;
        padding: 0;
        color: var(--fgColor-default);
        background: transparent;
        border: 0;
        outline: 0;
        font: inherit;
      }

      .FormControl-input::placeholder {
        color: var(--fgColor-muted);
      }

      .QueryBuilder-StyledInput {
        display: flex;
        align-items: stretch;
        gap: 12px;
        min-height: 32px;
        padding: 0 16px;
        border: 1px solid var(--borderColor-default);
        border-radius: 8px;
        background: #010409;
      }

      .QueryBuilder-focus {
        border-color: #1f6feb;
        box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.25);
      }

      .QueryBuilder-StyledInputContainer {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
      }

      .QueryBuilder-InputWrapper {
        position: static;
      }

      .QueryBuilder-StyledInputContent,
      .QueryBuilder-Sizer {
        font: inherit;
      }

      .ActionListWrap {
        margin: 0;
        padding: 8px;
        list-style: none;
      }

      .ActionList-sectionDivider {
        list-style: none;
      }

      .ActionList-sectionDivider-title {
        margin: 0;
        color: var(--fgColor-muted);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .ActionListItem {
        list-style: none;
      }

      .ActionListContent {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px 12px;
      }

      .ActionListContent--visual16 .ActionListItem-visual--leading {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        min-width: 16px;
        margin-top: 2px;
      }

      .ActionListItem-descriptionWrap {
        min-width: 0;
        flex: 1 1 auto;
      }

      .ActionListItem-label,
      .ActionListItem-description {
        display: block;
      }

      .Link {
        color: var(--fgColor-accent);
        text-decoration: none;
      }

      .color-fg-muted {
        color: var(--fgColor-muted);
      }

      .color-fg-accent {
        color: var(--fgColor-accent);
      }

      .color-border-muted {
        border-color: var(--borderColor-muted);
      }

      .text-small {
        font-size: 12px;
      }

      .text-normal {
        font-size: 14px;
      }

      .border-top {
        border-top: 1px solid var(--borderColor-muted);
      }

      .d-flex {
        display: flex;
      }

      .flex-items-center {
        align-items: center;
      }

      .p-2 {
        padding: 8px;
      }

      .px-3 {
        padding-left: 16px;
        padding-right: 16px;
      }

      .py-2 {
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .ml-2 {
        margin-left: 8px;
      }

      .width-fit {
        width: fit-content;
      }
    </style>
  </head>
  <body class="logged-in env-production page-responsive">
    <header class="site-header">
      <strong>Mock Gist</strong>
      <form id="header-search-form" class="mock-form" action="/search">
        <input id="header-search-input" class="mock-input" type="text" name="q" value="${escapeHtml(
          query,
        )}" aria-label="Header Search">
        <button id="header-search-button" class="mock-submit" type="submit">Search</button>
      </form>
    </header>
    <div class="layout">
      <main class="search-page">
        <h1>${escapeHtml(heading)}</h1>
        <form id="page-search-form" class="mock-form" action="/search">
          <input id="page-search-input" class="mock-input" type="text" name="q" value="${escapeHtml(
            query,
          )}" aria-label="Page Search">
          <button id="page-search-button" class="mock-submit" type="submit">Search</button>
        </form>
        <section class="mock-results">
          <p id="results-query"><strong>Current query:</strong> ${escapeHtml(query || '(empty)')}</p>
          <p>This fixture intentionally includes two native search forms so overlay duplication regressions are detectable.</p>
        </section>
      </main>
    </div>
  </body>
</html>`;
}

module.exports = {
  buildMockGistPage,
};
