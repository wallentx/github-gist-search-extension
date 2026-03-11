# GitHub Search Widget Notes

Date: March 10, 2026

These notes capture live observations from GitHub's native search widget and the current extension architecture so we can replace bespoke behavior deliberately instead of guessing.

## Native GitHub Query Builder

Observed on:

- `https://github.com/search?q=language%3APython+language%3A&type=repositories`
- `https://github.com/search?q=user%3Awallentx+lang%3AGo+&type=code`

### Popup structure

- Popup root uses `div[role="dialog"].Overlay.Overlay--width-large.Overlay--height-auto`.
- Main container uses `div.search-suggestions.query-builder-container`.
- Search field is inside `query-builder.QueryBuilder.search-query-builder`.
- Suggestions list is `ul[role="listbox"].ActionListWrap.QueryBuilder-ListWrap`.
- Suggestion rows are `li.ActionListItem[role="option"]`.
- Suggestion row content is inside `.ActionListContent.ActionListContent--visual16.QueryBuilder-ListItem`.

### Selected-row styling

- The active gray highlight is on the outer `li.ActionListItem[aria-selected="true"]`.
- The selected row's computed background is `rgba(101, 108, 118, 0.2)`.
- The selected row has `border-radius: 6px`.
- The inner `.ActionListContent` stays transparent.
- The blue vertical bar is drawn by `li.ActionListItem[aria-selected="true"]::after`.
- Native blue bar values:
  - `width: 4px`
  - `top: 5.375px`
  - `bottom: 5.375px`
  - `left: -4px`
  - `border-radius: 6px`
  - `background: rgb(31, 111, 235)`

### Query text rendering

- The input itself is transparent while typing:
  - `color: rgba(0, 0, 0, 0)`
  - `background: rgba(0, 0, 0, 0)`
  - caret remains visible via `caret-color`
- Styled query text is rendered in an absolute overlay:
  - `.QueryBuilder-StyledInputContent`
  - `position: absolute`
  - `display: flex`
  - `white-space: pre`
- Input width is kept aligned with a hidden sizer:
  - `.QueryBuilder-Sizer`
  - `display: block`
  - `visibility: hidden`
- Valid qualifier values are highlighted with `.qb-filter-value`.
- Only the value is highlighted, not the full `key:value`.
- Native `.qb-filter-value` observations:
  - `display: block`
  - `border-radius: 3px`
  - blue foreground
  - muted blue background

### Suggestion semantics

- Keyboard selection sets `aria-selected="true"` on the `li[role="option"]`.
- The combobox uses `aria-activedescendant` to point at the selected option.
- The trailing helper text such as `Autocomplete` is inside `.ActionListItem-description.QueryBuilder-ListItem-trailing`.
- For language suggestions, the leading visual is a colored dot inside `.ActionListItem-visual--leading`.

### Popup page behavior

- When the native popup opens, GitHub scroll-locks the page:
  - `document.body.style.overflow = "hidden"`
  - right padding compensation is applied (`15px` observed in MCP)
- Suggestions list is scrollable:
  - `overflow-y: auto`
  - `max-height` is clamped to viewport

## Current Extension Architecture

File: [content-script.js](/home/william/src/github-gist-search-extension/src/extension/content-script.js)

- `init()` currently binds every `form[action="/search"]` on `gist.github.com`.
- For each bound form, we create a separate overlay root via `createOverlayState(...)`.
- Each state appends its own `.gse-root` to `document.body`.
- Each state also installs a document-level `keydown` listener for `Escape`.
- Inline highlighting for the original page search input is created per bound input via `setupInlineHighlighter(...)`.

## Duplicate Overlay Risk

Observed on:

- `https://gist.github.com/search?q=`

Live DOM check on that page showed:

- `form[action="/search"]` count: `2`
- both forms had visible `input[name="q"]`
- one is the header search input
- one is the page-level gist search input

Implication:

- the current script can create two independent overlays on the same page
- `openOverlay(state)` does not close any other open overlay
- if multiple states open, the user can see stacked dialogs and may need multiple outside clicks to dismiss them

This matches the user-reported behavior:

- two search widgets appearing on top of each other
- one dialog dismissing while another remains behind it
- needing two clicks to fully dismiss the UI

## Live Extension Findings In MCP

Observed after installing the unpacked extension in the MCP browser and signing into GitHub.

### Signed-in gist search page

Page:

- `https://gist.github.com/search?q=`

Live extension state observed in the page:

- `body` class included `logged-in`
- `form[action="/search"]` count: `6`
- only `2` of those are native gist search forms
- `4` of those are extension-created `.gse-form` overlay forms
- `.gse-root` count: `4`
- `.gse-inlineHost` count: `4`

That means `init()` is rebinding extension-owned forms as if they were page-owned forms.

### Concrete recursion bug

Current selector:

- `document.querySelectorAll('form[action="/search"]')`

Problem:

- extension overlay forms also use `action="/search"`
- on later `init()` passes, those overlay forms are included in the binding set
- each rebound overlay form can create another overlay root

This is not just theoretical. In the live MCP page, the accessibility tree showed two separate `dialog "Search Gists"` nodes visible at the same time after opening the widget.

### Immediate design consequence

The extension should not be architected as "one overlay per matched form".

The safer model is:

- one singleton overlay per page
- one active source input at a time
- bind only native page search forms
- explicitly ignore any form inside `.gse-root`

### Post-refactor verification

After moving to a singleton overlay model and reloading the extension in MCP:

- `https://gist.github.com/search?q=` reported `2` native search forms
- `.gse-root` count stayed at `1`
- opening the widget produced exactly `1` visible dialog
- repeated open/close did not increase `.gse-root` count
- typing `language:`, arrowing through autocomplete, pressing `Enter`, typing free text, and pressing `Backspace` all kept the widget in a single stable overlay

After a follow-up semantics pass:

- suggestion rows are exposed as `li[role="option"]` rather than nested buttons
- the combobox now uses `aria-controls` and `aria-activedescendant`
- `aria-activedescendant` clears correctly after committing a suggestion

After a qualifier-support pass:

- `content:` works on gist search results and is now treated as a first-class qualifier in the extension
- relative helper tokens such as `days:>7` are translated on submit into `created:>YYYY-MM-DDTHH:MM:SS+00:00`
- language autocomplete rows no longer render the extra helper description line
- clicking anywhere inside the visible search shell now re-focuses the real input, which avoids the disappearing-cursor / can’t-type failure caused by the real input only spanning the measured text width

### Parity audit findings

Comparing GitHub's live widget against the extension overlay revealed a few specific drifts:

- GitHub measures scrollbar compensation before setting `body { overflow: hidden; }`.
- Our extension originally measured after scroll-lock, which could collapse the measured scrollbar width to `0` and reintroduce page shift on open.
- GitHub's real input spans the full input wrapper width, even when the visible styled query text is shorter.
- Our extension originally let the real input behave like a content-width field, which caused right-side drag-selection and hit-testing problems.
- The base date-helper list in the extension originally only surfaced `unit:>` shortcuts, even though the relative helper system supported both `>` and `<`.

### Parity fixes applied

- Scrollbar compensation now runs before body scroll-lock, matching the native order.
- The real overlay input now spans the full wrapper width so browser-native selection works across the whole field.
- Default date-helper suggestions now include both `>` and `<` variants for all supported units.

## Cleanup Direction

We should reduce custom state and treat GitHub's DOM/CSS as the contract.

### Recommended changes

- Move to a single global overlay singleton per page, not one overlay per search form.
- Keep one active source input at a time and sync that input into the singleton overlay.
- Keep selection state on `li.ActionListItem[role="option"]`, not on inner buttons or wrappers.
- Keep the inner `.ActionListContent` transparent and let the outer row own active styling.
- Keep the styled query layer + hidden sizer approach; that is the native mechanism.
- Keep hover as a visual affordance only; commit should come from click or keyboard selection.
- Audit every remaining `gse-*` style that overrides GitHub component internals and remove it unless it is needed for gist-specific layout or behavior.

### Areas still bespoke

- suggestion source and filtering logic
- `@me` helper expansion
- gist-specific qualifier set
- overlay singleton/state management
- inline highlighting on the original gist page input

## Practical Rule

For future changes, prefer this order:

1. inspect the live GitHub search widget
2. copy the DOM role/class/state pattern
3. add the minimum gist-specific behavior on top
4. only add custom CSS when GitHub's existing classes are not enough
