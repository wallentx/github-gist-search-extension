(() => {
  const FEEDBACK_URL =
    'https://github.com/wallentx/github-gist-search-extension/issues/new/choose';
  const PAGE_STATE_KEY = '__gsePageState';
  const RESERVED_PATHS = new Set([
    'about',
    'auth',
    'contact',
    'discover',
    'features',
    'forked',
    'join',
    'login',
    'search',
    'starred',
  ]);

  const SEARCH_ICON =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-search FormControl-input-leadingVisual"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path></svg>';
  const CLEAR_ICON =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x-circle-fill Button-visual"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>';
  const PERSON_ICON =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-person-fill"><path d="M8 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 6.5c-2.71 0-4.75 1.44-4.75 3.35 0 .63.52 1.15 1.15 1.15h7.2c.63 0 1.15-.52 1.15-1.15C12.75 9.44 10.71 8 8 8Z"></path></svg>';

  const LANGUAGE_OPTIONS = [
    { label: 'C++', color: '#f34b7d', value: 'language:C++ ' },
    { label: 'CSS', color: '#663399', value: 'language:CSS ' },
    { label: 'Go', color: '#00ADD8', value: 'language:Go ' },
    { label: 'HTML', color: '#e34c26', value: 'language:HTML ' },
    { label: 'Java', color: '#b07219', value: 'language:Java ' },
    { label: 'JavaScript', color: '#f1e05a', value: 'language:JavaScript ' },
    { label: 'JSON', color: '#292929', value: 'language:JSON ' },
    { label: 'Kotlin', color: '#A97BFF', value: 'language:Kotlin ' },
    { label: 'Markdown', color: '#083fa1', value: 'language:Markdown ' },
    { label: 'PHP', color: '#4F5D95', value: 'language:PHP ' },
    { label: 'Python', color: '#3572A5', value: 'language:Python ' },
    { label: 'Ruby', color: '#701516', value: 'language:Ruby ' },
    { label: 'Rust', color: '#dea584', value: 'language:Rust ' },
    { label: 'Shell', color: '#89e051', value: 'language:Shell ' },
    { label: 'SQL', color: '#e38c00', value: 'language:SQL ' },
    { label: 'Swift', color: '#F05138', value: 'language:Swift ' },
    { label: 'TypeScript', color: '#3178c6', value: 'language:TypeScript ' },
    { label: 'YAML', color: '#cb171e', value: 'language:YAML ' },
  ];

  const EXTENSION_OPTIONS = [
    { label: '.js', value: 'extension:js ' },
    { label: '.ts', value: 'extension:ts ' },
    { label: '.py', value: 'extension:py ' },
    { label: '.rb', value: 'extension:rb ' },
    { label: '.go', value: 'extension:go ' },
    { label: '.rs', value: 'extension:rs ' },
    { label: '.html', value: 'extension:html ' },
    { label: '.css', value: 'extension:css ' },
    { label: '.json', value: 'extension:json ' },
    { label: '.md', value: 'extension:md ' },
    { label: '.sh', value: 'extension:sh ' },
    { label: '.coffee', value: 'extension:coffee ' },
    { label: '.yml', value: 'extension:yml ' },
    { label: '.yaml', value: 'extension:yaml ' },
  ];

  const RELATIVE_TIME_UNITS = [
    { id: 'minutes', label: 'minutes', singular: 'minute' },
    { id: 'hours', label: 'hours', singular: 'hour' },
    { id: 'days', label: 'days', singular: 'day' },
    { id: 'weeks', label: 'weeks', singular: 'week' },
    { id: 'months', label: 'months', singular: 'month' },
    { id: 'years', label: 'years', singular: 'year' },
  ];

  const BASE_SUGGESTIONS = [
    {
      id: 'user',
      section: 'Qualifiers',
      label: 'user:',
      description: 'Limit results to a specific gist owner.',
      trailing: 'Qualifier',
      insertText: 'user:',
      caretOffset: 'user:'.length,
      keywords: ['user', 'owner', 'account'],
      visual: 'person',
    },
    {
      id: 'filename',
      section: 'Qualifiers',
      label: 'filename:',
      description: 'Match gists containing a specific filename.',
      trailing: 'Qualifier',
      insertText: 'filename:',
      caretOffset: 'filename:'.length,
      keywords: ['filename', 'name'],
      visual: 'search',
    },
    {
      id: 'language',
      section: 'Qualifiers',
      label: 'language:',
      description: 'Filter by file language and autocomplete common values.',
      trailing: 'Qualifier',
      insertText: 'language:',
      caretOffset: 'language:'.length,
      keywords: ['language', 'lang'],
      visual: 'search',
    },
    {
      id: 'extension',
      section: 'Qualifiers',
      label: 'extension:',
      description: 'Match gists by file extension.',
      trailing: 'Qualifier',
      insertText: 'extension:',
      caretOffset: 'extension:'.length,
      keywords: ['extension', 'ext'],
      visual: 'search',
    },
    {
      id: 'content',
      section: 'Qualifiers',
      label: 'content:',
      description: 'Match gists by file content text.',
      trailing: 'Qualifier',
      insertText: 'content:',
      caretOffset: 'content:'.length,
      keywords: ['content', 'text', 'body'],
      visual: 'search',
    },
    {
      id: 'created',
      section: 'Filters',
      label: 'created:>2024-05-10T01:23:02+00:00',
      description: 'Filter by gist creation timestamp.',
      trailing: 'Template',
      insertText: 'created:>',
      caretOffset: 'created:>'.length,
      keywords: ['created', 'date', 'time', 'timestamp'],
      visual: 'search',
    },
    {
      id: 'stars',
      section: 'Filters',
      label: 'stars:>100',
      description: 'Find gists with more than a given number of stars.',
      trailing: 'Template',
      insertText: 'stars:>',
      caretOffset: 'stars:>'.length,
      keywords: ['stars', 'popular'],
      visual: 'search',
    },
    {
      id: 'size',
      section: 'Filters',
      label: 'size:>1000',
      description: 'Filter by file size in KB, for example size:>1000.',
      trailing: 'Template',
      insertText: 'size:>',
      caretOffset: 'size:>'.length,
      keywords: ['size', 'kb', 'large'],
      visual: 'search',
    },
    {
      id: 'anon',
      section: 'Filters',
      label: 'anon:true',
      description: 'Include anonymous gists in the results.',
      trailing: 'Insert',
      insertText: 'anon:true ',
      caretOffset: 'anon:true '.length,
      keywords: ['anon', 'anonymous'],
      visual: 'search',
    },
    {
      id: 'fork',
      section: 'Filters',
      label: 'fork:only',
      description: 'Show only forked gists.',
      trailing: 'Insert',
      insertText: 'fork:only ',
      caretOffset: 'fork:only '.length,
      keywords: ['fork', 'forked'],
      visual: 'search',
    },
    {
      id: 'not',
      section: 'Operators',
      label: 'NOT',
      description: 'Exclude the following term or qualifier.',
      trailing: 'Operator',
      insertText: 'NOT ',
      caretOffset: 'NOT '.length,
      keywords: ['not', 'exclude', 'minus'],
      visual: 'search',
    },
  ];

  init();
  document.addEventListener('turbo:load', init);
  document.addEventListener('pjax:end', init);

  function init() {
    if (!isSupportedPage() || !isLoggedIn()) {
      return;
    }

    const state = getOrCreatePageState();
    const forms = getNativeSearchForms();

    forms.forEach((form) => {
      const input = form.querySelector('input[name="q"]:not([type="hidden"])');
      const triggerButton = form.querySelector(
        'button[type="submit"], input[type="submit"]',
      );

      if (!input || form.dataset.gseBound === 'true') {
        return;
      }

      form.dataset.gseBound = 'true';

      const binding = {
        originalForm: form,
        originalInput: input,
        triggerButton,
        inlineStyledContent: null,
      };

      setupInlineHighlighter(binding);
      renderOriginalInput(binding);

      input.addEventListener('input', () => renderOriginalInput(binding));
      form.addEventListener('submit', () => {
        binding.originalInput.value = normalizeQueryForGitHub(
          binding.originalInput.value,
        );
        renderOriginalInput(binding);
      });

      input.addEventListener('focus', () => openOverlay(state, binding));
      input.addEventListener('click', (event) => {
        event.preventDefault();
        openOverlay(state, binding);
      });
    });
  }

  function getNativeSearchForms() {
    return [...document.querySelectorAll('form[action="/search"]')].filter(
      (form) => !form.closest('.gse-root'),
    );
  }

  function getOrCreatePageState() {
    const existingState = window[PAGE_STATE_KEY];
    if (existingState?.root?.isConnected) {
      return existingState;
    }

    document.querySelectorAll('.gse-root').forEach((root) => root.remove());

    const root = document.createElement('div');
    root.className = 'gse-root';
    root.hidden = true;
    root.innerHTML = `
      <div class="gse-backdrop"></div>
      <div class="gse-shell">
        <div role="dialog" aria-modal="true" aria-labelledby="gse-overlay-title" class="Overlay Overlay--width-large Overlay--height-auto gse-dialog">
          <div class="Overlay-body Overlay-body--paddingNone">
            <div class="search-suggestions color-shadow-large border color-fg-default color-bg-default overflow-hidden d-flex flex-column query-builder-container gse-container">
              <form class="gse-form">
                <query-builder class="QueryBuilder search-query-builder">
                  <div class="FormControl FormControl--fullWidth">
                    <label id="gse-overlay-title" for="gse-overlay-input" class="FormControl-label sr-only">Search Gists</label>
                    <div class="QueryBuilder-StyledInput width-fit QueryBuilder-focus">
                      <span class="FormControl-input-leadingVisualWrap QueryBuilder-leadingVisualWrap">${SEARCH_ICON}</span>
                      <div class="QueryBuilder-StyledInputContainer">
                        <div aria-hidden="true" class="QueryBuilder-StyledInputContent gse-styledContent"></div>
                        <div class="QueryBuilder-InputWrapper">
                          <div aria-hidden="true" class="QueryBuilder-Sizer gse-sizer"><span></span></div>
                          <input id="gse-overlay-input" name="q" autocomplete="off" type="text" role="combobox" spellcheck="false" aria-expanded="false" aria-autocomplete="list" aria-haspopup="listbox" aria-controls="gse-overlay-results" class="FormControl-input QueryBuilder-Input FormControl-medium gse-input">
                        </div>
                      </div>
                      <span class="gse-clearWrap" hidden>
                        <span class="sr-only">Clear</span>
                        <button type="button" class="Button Button--iconOnly Button--invisible Button--medium mr-1 px-2 py-0 d-flex flex-items-center rounded-1 color-fg-muted gse-clearButton">${CLEAR_ICON}</button>
                      </span>
                    </div>
                  </div>
                  <ul id="gse-overlay-results" role="listbox" class="ActionListWrap QueryBuilder-ListWrap gse-list" aria-label="Suggestions"></ul>
                  <div class="d-flex flex-items-center border-top color-border-muted px-3 py-2 gse-footer">
                    <span class="color-fg-muted text-small">Gist qualifiers</span>
                    <a target="_blank" href="${FEEDBACK_URL}" class="Link color-fg-accent text-normal ml-2">Extension Feedback/Bug Report</a>
                    <span class="color-fg-muted text-small ml-auto gse-footerHint">Enter to search</span>
                  </div>
                </query-builder>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.append(root);

    const overlayForm = root.querySelector('.gse-form');
    const overlayInput = root.querySelector('.gse-input');
    const clearWrap = root.querySelector('.gse-clearWrap');
    const clearButton = root.querySelector('.gse-clearButton');
    const list = root.querySelector('.gse-list');
    const backdrop = root.querySelector('.gse-backdrop');
    const styledContent = root.querySelector('.gse-styledContent');
    const sizer = root.querySelector('.gse-sizer');
    const styledInput = root.querySelector('.QueryBuilder-StyledInput');

    const state = {
      root,
      activeBinding: null,
      overlayForm,
      overlayInput,
      clearWrap,
      clearButton,
      list,
      backdrop,
      styledContent,
      sizer,
      styledInput,
      open: false,
      suggestions: [],
      activeIndex: -1,
      interactionMode: 'none',
      hoverEnabled: false,
      hoverStartPoint: null,
      originalBodyOverflow: '',
      originalBodyPaddingRight: '',
    };

    overlayInput.addEventListener('input', () => {
      syncOriginalInput(state);
      state.activeIndex = -1;
      state.interactionMode = 'none';
      renderStyledQuery(state);
      updateInputWidth(state);
      updateClearButton(state);
      renderSuggestions(state);
    });

    overlayInput.addEventListener('keydown', (event) =>
      handleOverlayKeydown(event, state),
    );
    overlayInput.addEventListener('click', () => renderSuggestions(state));
    styledInput.addEventListener('mousedown', (event) => {
      if (
        !state.open ||
        event.target === overlayInput ||
        event.target.closest('.gse-clearButton')
      ) {
        return;
      }

      event.preventDefault();
      focusOverlayInput(state);
    });
    root.addEventListener('mousemove', (event) => {
      if (state.open) {
        if (!state.hoverStartPoint) {
          state.hoverStartPoint = { x: event.clientX, y: event.clientY };
          return;
        }

        const deltaX = event.clientX - state.hoverStartPoint.x;
        const deltaY = event.clientY - state.hoverStartPoint.y;
        if (Math.hypot(deltaX, deltaY) >= 4) {
          state.hoverEnabled = true;
        }
      }
    });

    overlayForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitSearch(state);
    });

    clearButton.addEventListener('click', () => {
      overlayInput.value = '';
      syncOriginalInput(state);
      renderStyledQuery(state);
      updateInputWidth(state);
      updateClearButton(state);
      renderSuggestions(state);
      overlayInput.focus();
    });

    backdrop.addEventListener('click', () => closeOverlay(state));

    document.addEventListener('keydown', (event) => {
      if (!state.open) {
        return;
      }

      if (event.key === 'Escape') {
        closeOverlay(state);
      }
    });

    window[PAGE_STATE_KEY] = state;
    return state;
  }

  function isSupportedPage() {
    return true;
  }

  function isLoggedIn() {
    const body = document.body;
    return Boolean(body) && !body.classList.contains('logged-out');
  }

  function openOverlay(state, binding) {
    state.activeBinding = binding;

    if (!state.open) {
      state.open = true;
      state.root.hidden = false;
      state.overlayInput.setAttribute('aria-expanded', 'true');
      state.originalBodyOverflow = document.body.style.overflow;
      state.originalBodyPaddingRight = document.body.style.paddingRight;
      compensateForScrollbar(state);
      document.body.style.overflow = 'hidden';
    }

    state.overlayInput.value = binding.originalInput.value;
    state.activeIndex = -1;
    state.interactionMode = 'none';
    state.hoverEnabled = false;
    state.hoverStartPoint = null;
    renderStyledQuery(state);
    updateInputWidth(state);
    updateClearButton(state);
    renderSuggestions(state);

    requestAnimationFrame(() => {
      state.overlayInput.focus({ preventScroll: true });
      const end = state.overlayInput.value.length;
      state.overlayInput.setSelectionRange(end, end);
    });
  }

  function closeOverlay(state) {
    if (!state.open) {
      return;
    }

    const binding = state.activeBinding;
    syncOriginalInput(state);
    state.open = false;
    state.root.hidden = true;
    state.overlayInput.setAttribute('aria-expanded', 'false');
    state.overlayInput.removeAttribute('aria-activedescendant');
    state.activeIndex = -1;
    state.interactionMode = 'none';
    state.hoverEnabled = false;
    state.hoverStartPoint = null;
    document.body.style.overflow = state.originalBodyOverflow;
    document.body.style.paddingRight = state.originalBodyPaddingRight;
    state.activeBinding = null;
    binding?.originalInput.blur();
  }

  function updateClearButton(state) {
    state.clearWrap.hidden = state.overlayInput.value.length === 0;
  }

  function syncOriginalInput(state) {
    const binding = state.activeBinding;
    if (!binding) {
      return;
    }

    binding.originalInput.value = state.overlayInput.value;
    renderOriginalInput(binding);
  }

  function submitSearch(state) {
    const binding = state.activeBinding;
    if (!binding) {
      return;
    }

    const normalizedQuery = normalizeQueryForGitHub(state.overlayInput.value);
    state.overlayInput.value = normalizedQuery;
    syncOriginalInput(state);
    const url = new URL(
      binding.originalForm.action || '/search',
      location.origin,
    );
    url.searchParams.set('q', normalizedQuery);
    location.assign(url.toString());
  }

  function compensateForScrollbar() {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth <= 0) {
      return;
    }

    const currentPaddingRight =
      parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }

  function getTokenContext(input) {
    const value = input.value;
    const caret = input.selectionStart ?? value.length;
    let start = caret;
    let end = caret;

    while (start > 0 && !/\s/.test(value[start - 1])) {
      start -= 1;
    }

    while (end < value.length && !/\s/.test(value[end])) {
      end += 1;
    }

    const token = value.slice(start, end);
    return {
      value,
      start,
      end,
      token,
      tokenLower: token.toLowerCase(),
    };
  }

  function buildSuggestions(context) {
    const username = getLoggedInUsername();
    const pageUsername = getPageUsername();
    const token = context.tokenLower;

    const relativeSuggestions = buildRelativeTimeSuggestions(context.token);
    if (relativeSuggestions) {
      return relativeSuggestions;
    }

    if (token.startsWith('language:')) {
      const query = context.token.slice('language:'.length).toLowerCase();
      return filterSuggestions(
        LANGUAGE_OPTIONS.map((option) => ({
          id: `language-${option.label.toLowerCase()}`,
          section: 'Languages',
          label: option.label,
          description: '',
          trailing: 'Autocomplete',
          insertText: option.value,
          caretOffset: option.value.length,
          visual: 'dot',
          color: option.color,
        })),
        query,
      );
    }

    if (token.startsWith('extension:')) {
      const query = context.token
        .slice('extension:'.length)
        .replace(/^\./, '')
        .toLowerCase();
      return filterSuggestions(
        EXTENSION_OPTIONS.map((option) => ({
          id: `extension-${option.label.slice(1)}`,
          section: 'Extensions',
          label: option.label,
          description: `Complete extension:${option.label.slice(1)}`,
          trailing: 'Autocomplete',
          insertText: option.value,
          caretOffset: option.value.length,
          visual: 'search',
        })),
        query,
      );
    }

    if (token.startsWith('user:') || token.startsWith('@')) {
      const query = context.token
        .replace(/^user:/i, '')
        .replace(/^@/, '')
        .toLowerCase();
      const suggestions = [];

      if (username) {
        suggestions.push({
          id: 'helper-me',
          section: 'Helpers',
          label: '@me',
          description: `Expand to user:${username}`,
          trailing: 'Autocomplete',
          insertText: `user:${username} `,
          caretOffset: `user:${username} `.length,
          visual: 'person',
        });
      }

      if (pageUsername && pageUsername !== username) {
        suggestions.push({
          id: 'page-user',
          section: 'Users',
          label: pageUsername,
          description: `Complete user:${pageUsername}`,
          trailing: 'Autocomplete',
          insertText: `user:${pageUsername} `,
          caretOffset: `user:${pageUsername} `.length,
          visual: 'person',
        });
      }

      if (username) {
        suggestions.push({
          id: 'current-user',
          section: 'Users',
          label: username,
          description: `Complete user:${username}`,
          trailing: 'Autocomplete',
          insertText: `user:${username} `,
          caretOffset: `user:${username} `.length,
          visual: 'person',
        });
      }

      return filterSuggestions(suggestions, query);
    }

    const suggestions = [...BASE_SUGGESTIONS];

    suggestions.push(
      ...RELATIVE_TIME_UNITS.flatMap((unit) => [
        {
          id: `${unit.id}-gt`,
          section: 'Date helpers',
          label: `${unit.label}:>`,
          description: `Newer than the specified number of ${unit.label} ago.`,
          trailing: 'Helper',
          insertText: `${unit.label}:>`,
          caretOffset: `${unit.label}:>`.length,
          keywords: [
            unit.label,
            unit.singular,
            'created',
            'date',
            'time',
            'timestamp',
          ],
          visual: 'search',
        },
        {
          id: `${unit.id}-lt`,
          section: 'Date helpers',
          label: `${unit.label}:<`,
          description: `Older than the specified number of ${unit.label} ago.`,
          trailing: 'Helper',
          insertText: `${unit.label}:<`,
          caretOffset: `${unit.label}:<`.length,
          keywords: [
            unit.label,
            unit.singular,
            'created',
            'date',
            'time',
            'timestamp',
          ],
          visual: 'search',
        },
      ]),
    );

    if (username) {
      suggestions.unshift({
        id: 'helper-me',
        section: 'Helpers',
        label: '@me',
        description: `Expand to user:${username}`,
        trailing: 'Autocomplete',
        insertText: `user:${username} `,
        caretOffset: `user:${username} `.length,
        keywords: ['@me', 'me', username],
        visual: 'person',
      });
    }

    if (pageUsername && pageUsername !== username) {
      suggestions.unshift({
        id: 'page-user',
        section: 'Helpers',
        label: `user:${pageUsername}`,
        description: `Search gists from ${pageUsername}.`,
        trailing: 'Autocomplete',
        insertText: `user:${pageUsername} `,
        caretOffset: `user:${pageUsername} `.length,
        keywords: ['page', 'owner', pageUsername],
        visual: 'person',
      });
    }

    return filterSuggestions(suggestions, token);
  }

  function filterSuggestions(suggestions, query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return suggestions;
    }

    return suggestions.filter((suggestion) => {
      const haystack = [suggestion.label, ...(suggestion.keywords || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }

  function renderSuggestions(state) {
    const context = getTokenContext(state.overlayInput);
    state.suggestions = buildSuggestions(context);
    state.list.innerHTML = '';
    state.activeIndex = Math.min(
      state.activeIndex,
      state.suggestions.length - 1,
    );

    if (state.suggestions.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'gse-empty color-fg-muted text-small';
      empty.textContent = 'No matching qualifiers or autocomplete values.';
      state.list.append(empty);
      state.activeIndex = -1;
      state.overlayInput.removeAttribute('aria-activedescendant');
      return;
    }

    let currentSection = '';

    state.suggestions.forEach((suggestion, index) => {
      if (suggestion.section !== currentSection) {
        currentSection = suggestion.section;
        const divider = document.createElement('li');
        divider.className = 'ActionList-sectionDivider';
        divider.setAttribute('role', 'presentation');
        divider.innerHTML = `<h3 role="presentation" class="ActionList-sectionDivider-title QueryBuilder-sectionTitle p-2 text-left" aria-hidden="true">${currentSection}</h3>`;
        state.list.append(divider);
      }

      const item = document.createElement('li');
      item.className = 'ActionListItem';
      item.id = `gse-option-${suggestion.id}-${index}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-label', getOptionAriaLabel(suggestion));
      item.setAttribute(
        'aria-selected',
        index === state.activeIndex ? 'true' : 'false',
      );
      item.innerHTML = `
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          <span class="ActionListItem-visual ActionListItem-visual--leading">${renderVisual(
            suggestion,
          )}</span>
          <span class="ActionListItem-descriptionWrap gse-copy">
            <span class="ActionListItem-label text-normal">${escapeHtml(suggestion.label)}</span>
            ${
              suggestion.description
                ? `<span class="color-fg-muted text-small gse-description">${escapeHtml(
                    suggestion.description,
                  )}</span>`
                : ''
            }
          </span>
          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing">${escapeHtml(
            suggestion.trailing,
          )}</span>
        </span>
      `;

      item.addEventListener('mouseenter', () => {
        if (!state.hoverEnabled) {
          return;
        }
        state.activeIndex = index;
        state.interactionMode = 'hover';
        updateActiveOption(state);
      });

      item.addEventListener('click', () => {
        applySuggestion(state, suggestion);
      });

      state.list.append(item);
    });

    updateActiveOption(state);
  }

  function getOptionAriaLabel(suggestion) {
    const trailing = suggestion.trailing
      ? `${suggestion.trailing.toLowerCase()} `
      : '';

    if (suggestion.section === 'Languages') {
      return `${suggestion.label}, ${trailing}this language`.trim();
    }

    if (suggestion.section === 'Extensions') {
      return `${suggestion.label}, ${trailing}this extension`.trim();
    }

    if (!suggestion.description) {
      return suggestion.label;
    }

    return `${suggestion.label}, ${suggestion.description}`.trim();
  }

  function renderVisual(suggestion) {
    if (suggestion.visual === 'dot') {
      return `<span class="gse-languageDot" style="background-color: ${escapeHtml(
        suggestion.color,
      )}"></span>`;
    }

    if (suggestion.visual === 'person') {
      return PERSON_ICON;
    }

    return SEARCH_ICON;
  }

  function updateActiveOption(state) {
    const items = state.list.querySelectorAll('.ActionListItem[role="option"]');
    let activeId = '';
    items.forEach((item, index) => {
      const isActive = index === state.activeIndex;
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        activeId = item.id;
        item.scrollIntoView({ block: 'nearest' });
      }
    });

    if (activeId) {
      state.overlayInput.setAttribute('aria-activedescendant', activeId);
    } else {
      state.overlayInput.removeAttribute('aria-activedescendant');
    }
  }

  function handleOverlayKeydown(event, state) {
    if (event.key === 'ArrowDown') {
      if (state.suggestions.length > 0) {
        state.activeIndex =
          state.activeIndex < 0
            ? 0
            : Math.min(state.activeIndex + 1, state.suggestions.length - 1);
        state.interactionMode = 'keyboard';
        updateActiveOption(state);
      }
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowUp') {
      if (state.suggestions.length > 0) {
        state.activeIndex =
          state.activeIndex < 0
            ? state.suggestions.length - 1
            : Math.max(state.activeIndex - 1, 0);
        state.interactionMode = 'keyboard';
        updateActiveOption(state);
      }
      event.preventDefault();
      return;
    }

    if (
      event.key === 'Enter' &&
      state.activeIndex >= 0 &&
      state.interactionMode === 'keyboard'
    ) {
      applySuggestion(state, state.suggestions[state.activeIndex]);
      event.preventDefault();
      return;
    }
  }

  function applySuggestion(state, suggestion) {
    const context = getTokenContext(state.overlayInput);
    const nextValue =
      context.value.slice(0, context.start) +
      suggestion.insertText +
      context.value.slice(context.end);

    state.overlayInput.value = nextValue;
    const caret =
      context.start + (suggestion.caretOffset ?? suggestion.insertText.length);
    state.overlayInput.setSelectionRange(caret, caret);
    syncOriginalInput(state);
    renderStyledQuery(state);
    updateInputWidth(state);
    updateClearButton(state);
    state.activeIndex = -1;
    state.interactionMode = 'none';
    renderSuggestions(state);
    focusOverlayInput(state);
  }

  function buildRelativeTimeSuggestions(token) {
    const match = token.match(
      /^(minutes|hours|days|weeks|months|years):([<>]?)(\d*)$/i,
    );
    if (!match) {
      return null;
    }

    const [, rawUnit, operator, amount] = match;
    const unit = RELATIVE_TIME_UNITS.find(
      ({ id }) => id === rawUnit.toLowerCase(),
    );
    if (!unit) {
      return null;
    }

    if (!operator) {
      return [
        makeRelativeTemplateSuggestion(unit, '>'),
        makeRelativeTemplateSuggestion(unit, '<'),
      ];
    }

    if (!amount) {
      return [makeRelativeTemplateSuggestion(unit, operator)];
    }

    const canonical = buildRelativeCreatedToken(
      unit.id,
      operator,
      Number.parseInt(amount, 10),
    );
    if (!canonical) {
      return [];
    }

    return [
      {
        id: `${unit.id}-${operator}-${amount}`,
        section: 'Date helpers',
        label: `${unit.label}:${operator}${amount}`,
        description: describeRelativeTime(unit.id, operator, amount),
        trailing: 'Translate',
        insertText: `${canonical} `,
        caretOffset: `${canonical} `.length,
        keywords: [unit.label, unit.singular, canonical, 'created'],
        visual: 'search',
      },
    ];
  }

  function makeRelativeTemplateSuggestion(unit, operator) {
    const example = `${unit.label}:${operator}7`;
    const direction = operator === '>' ? 'Newer than' : 'Older than';
    return {
      id: `${unit.id}-${operator === '>' ? 'after' : 'before'}`,
      section: 'Date helpers',
      label: example,
      description: `${direction} 7 ${unit.label} ago.`,
      trailing: 'Helper',
      insertText: `${unit.label}:${operator}`,
      caretOffset: `${unit.label}:${operator}`.length,
      keywords: [
        unit.label,
        unit.singular,
        'created',
        'date',
        'time',
        'timestamp',
      ],
      visual: 'search',
    };
  }

  function renderStyledQuery(state) {
    if (!state.styledContent) {
      return;
    }

    const value = state.overlayInput.value;
    state.styledContent.innerHTML = highlightQuery(value);
    state.overlayInput.classList.toggle('gse-hasStyledValue', value.length > 0);
  }

  function setupInlineHighlighter(binding) {
    const host = binding.originalInput.parentElement;
    if (!host) {
      return;
    }

    host.dataset.gseInlineBound = 'true';
    host.classList.add('gse-inlineHost');

    host
      .querySelectorAll(':scope > .gse-inlineStyledContent')
      .forEach((node, index) => {
        if (index > 0) {
          node.remove();
        }
      });

    const styled =
      host.querySelector(':scope > .gse-inlineStyledContent') ||
      document.createElement('div');
    styled.className = 'gse-inlineStyledContent';
    styled.setAttribute('aria-hidden', 'true');

    const computed = getComputedStyle(binding.originalInput);
    styled.style.paddingTop = computed.paddingTop;
    styled.style.paddingRight = computed.paddingRight;
    styled.style.paddingBottom = computed.paddingBottom;
    styled.style.paddingLeft = computed.paddingLeft;
    styled.style.font = computed.font;
    styled.style.lineHeight = computed.lineHeight;
    styled.style.letterSpacing = computed.letterSpacing;

    if (!styled.isConnected) {
      host.append(styled);
    }

    binding.inlineStyledContent = styled;
  }

  function renderOriginalInput(binding) {
    if (!binding.inlineStyledContent) {
      return;
    }

    const value = binding.originalInput.value;
    binding.inlineStyledContent.innerHTML = value ? highlightQuery(value) : '';
    binding.originalInput.classList.toggle(
      'gse-inlineHasStyledValue',
      value.length > 0,
    );
  }

  function highlightQuery(value) {
    const segments = value.match(/\s+|\S+/g) || [];
    let pendingWhitespace = '';

    return (
      segments
        .map((segment) => {
          if (/^\s+$/.test(segment)) {
            pendingWhitespace += segment;
            return '';
          }

          const rendered = renderHighlightedPart(segment, pendingWhitespace);
          pendingWhitespace = '';
          return rendered;
        })
        .join('') +
      (pendingWhitespace ? `<span>${escapeHtml(pendingWhitespace)}</span>` : '')
    );
  }

  function renderHighlightedPart(token, leadingWhitespace = '') {
    if (token === '@me') {
      return `<span>${escapeHtml(leadingWhitespace)}</span><span class="qb-filter-value">@me</span>`;
    }

    const keyedValuePatterns = [
      /^(user:)(\S+)$/i,
      /^(filename:)(\S+)$/i,
      /^(language:)(\S+)$/i,
      /^(extension:)(\S+)$/i,
      /^(content:)(\S+)$/i,
      /^(created:)([<>]=?\S+)$/i,
      /^(minutes:)([<>]=?\S+)$/i,
      /^(hours:)([<>]=?\S+)$/i,
      /^(days:)([<>]=?\S+)$/i,
      /^(weeks:)([<>]=?\S+)$/i,
      /^(months:)([<>]=?\S+)$/i,
      /^(years:)([<>]=?\S+)$/i,
      /^(anon:)(true)$/i,
      /^(fork:)(only)$/i,
      /^(stars:)([<>]=?\S+)$/i,
      /^(size:)([<>]=?\S+)$/i,
    ];

    for (const pattern of keyedValuePatterns) {
      const match = token.match(pattern);
      if (match) {
        return `<span>${escapeHtml(
          `${leadingWhitespace}${match[1]}`,
        )}</span><span class="qb-filter-value">${escapeHtml(match[2])}</span>`;
      }
    }

    return `<span>${escapeHtml(`${leadingWhitespace}${token}`)}</span>`;
  }

  function updateInputWidth(state) {
    if (!state.sizer) {
      return;
    }

    state.sizer.textContent = state.overlayInput.value;
    const spacer = document.createElement('span');
    spacer.textContent = '';
    state.sizer.append(spacer);

    const styledInput = state.overlayInput.closest('.QueryBuilder-StyledInput');
    const clearWidth = state.clearWrap.hidden
      ? 0
      : state.clearWrap.getBoundingClientRect().width;
    const maxWidth = Math.max(
      (styledInput?.getBoundingClientRect().width || 0) - clearWidth - 48,
      32,
    );
    const measuredWidth = Math.max(
      state.sizer.getBoundingClientRect().width + 2,
      32,
    );
    state.overlayInput.style.width = `${Math.min(measuredWidth, maxWidth)}px`;
  }

  function getLoggedInUsername() {
    const selectors = [
      'meta[name="user-login"]',
      'meta[name="octolytics-actor-login"]',
      '[data-login]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const value =
        element?.getAttribute('content') ||
        element?.getAttribute('value') ||
        element?.getAttribute('data-login');

      if (value) {
        return value.trim();
      }
    }

    return '';
  }

  function getPageUsername() {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length !== 1) {
      return '';
    }

    const candidate = segments[0];
    if (RESERVED_PATHS.has(candidate.toLowerCase())) {
      return '';
    }

    return candidate;
  }

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function focusOverlayInput(state) {
    state.overlayInput.focus({ preventScroll: true });
    const end = state.overlayInput.value.length;
    state.overlayInput.setSelectionRange(end, end);
  }

  function normalizeQueryForGitHub(value) {
    const segments = value.match(/\s+|\S+/g) || [];

    return segments
      .map((segment) => {
        if (/^\s+$/.test(segment)) {
          return segment;
        }

        const canonical = normalizeRelativeTimeToken(segment);
        return canonical || segment;
      })
      .join('');
  }

  function normalizeRelativeTimeToken(token) {
    const match = token.match(
      /^(minutes|hours|days|weeks|months|years):([<>])(\d+)$/i,
    );
    if (!match) {
      return '';
    }

    const [, unit, operator, amount] = match;
    return buildRelativeCreatedToken(
      unit.toLowerCase(),
      operator,
      Number.parseInt(amount, 10),
    );
  }

  function buildRelativeCreatedToken(unit, operator, amount) {
    if (!Number.isFinite(amount) || amount < 0) {
      return '';
    }

    const createdAt = subtractRelativeAmount(new Date(), unit, amount);
    return `created:${operator}${formatGitHubTimestamp(createdAt)}`;
  }

  function subtractRelativeAmount(now, unit, amount) {
    const next = new Date(now);

    switch (unit) {
      case 'minutes':
        next.setUTCMinutes(next.getUTCMinutes() - amount);
        break;
      case 'hours':
        next.setUTCHours(next.getUTCHours() - amount);
        break;
      case 'days':
        next.setUTCDate(next.getUTCDate() - amount);
        break;
      case 'weeks':
        next.setUTCDate(next.getUTCDate() - amount * 7);
        break;
      case 'months':
        next.setUTCMonth(next.getUTCMonth() - amount);
        break;
      case 'years':
        next.setUTCFullYear(next.getUTCFullYear() - amount);
        break;
      default:
        break;
    }

    return next;
  }

  function formatGitHubTimestamp(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    const second = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+00:00`;
  }

  function describeRelativeTime(unit, operator, amount) {
    const metadata = RELATIVE_TIME_UNITS.find(({ id }) => id === unit);
    const label =
      amount === 1
        ? metadata?.singular || unit.replace(/s$/, '')
        : metadata?.label || unit;
    const direction = operator === '>' ? 'Newer than' : 'Older than';
    return `${direction} ${amount} ${label} ago.`;
  }
})();
