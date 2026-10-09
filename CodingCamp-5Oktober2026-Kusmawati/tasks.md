# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement the Life Dashboard as three static files (`index.html`, `css/style.css`, `js/app.js`) using only HTML, CSS, and Vanilla JavaScript. All state persists in `localStorage`. The page renders four always-visible sections in a responsive pastel-themed grid. JavaScript is organised into four IIFE-scoped module namespaces: `GreetingModule`, `TimerModule`, `TaskModule`, and `LinksModule`.

---

## Tasks

- [x] 1. Set up project structure and HTML skeleton
  - Create `index.html` with `<!DOCTYPE html>`, `<meta charset>`, `<meta name="viewport">`, and links to `css/style.css` and `js/app.js`
  - Add all four `<section class="panel">` elements (`#greeting-panel`, `#timer-panel`, `#todo-panel`, `#links-panel`) with the exact DOM structure from the design
  - Add the `<div id="add-link-form" class="hidden">` form and `#btn-add-link` button inside the links section
  - Verify the file opens in a browser without errors (file:// protocol)
  - _Requirements: 5.1, 5.4, 6.2_

- [x] 2. Implement base CSS — layout, palette, and typography
  - [x] 2.1 Define CSS custom properties and global reset
    - Declare all colour tokens (`--lavender`, `--mint`, `--peach`, `--sky`, their `-light` variants, `--text-main`, `--text-muted`, `--white`) as `:root` variables
    - Apply `box-sizing: border-box`, margin/padding reset, and `font-family: 'Segoe UI', system-ui, sans-serif`
    - _Requirements: 6.1, 6.3_

  - [x] 2.2 Implement responsive grid layout
    - Style `body` / `.dashboard-grid` to use `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem` at ≥768 px
    - Add `@media (max-width: 767px)` breakpoint that switches to a single-column stack
    - _Requirements: 6.4, 6.5_

  - [x] 2.3 Style panel cards and per-section backgrounds
    - Apply `border-radius: 16px`, `padding: 1.5rem`, `box-shadow: 0 2px 12px rgba(0,0,0,0.08)` to every `.panel`
    - Assign pastel background colours to `.greeting-panel` (`--lavender-light`), `.timer-panel` (`--mint-light`), `.todo-panel` (`--peach-light`), `.links-panel` (`--sky-light`)
    - Style `h2` at `1.25rem / 600` weight and `#clock` at `3rem / bold`
    - _Requirements: 6.1, 6.3_

  - [x] 2.4 Style interactive states for buttons and inputs
    - Style all buttons with pastel background, `border-radius: 8px`, hover darkens 10%, active scales to `0.97`
    - Style `.task-item.done .task-title` with `text-decoration: line-through; color: var(--text-muted)`
    - Style edit inputs with `border: 2px solid var(--lavender); border-radius: 6px`
    - Style `.hidden` utility class as `display: none`
    - _Requirements: 6.3_

- [x] 3. Implement `GreetingModule` in `js/app.js`
  - [x] 3.1 Scaffold the IIFE and `GreetingModule` namespace
    - Create `js/app.js` as a single IIFE wrapping all four modules
    - Implement `formatTime(date)` — pads hours, minutes, seconds to two digits with `:` separators
    - Implement `formatDate(date)` — uses `Intl.DateTimeFormat` with `{ weekday:'long', year:'numeric', month:'long', day:'numeric' }`
    - Implement `getGreeting(hour)` — maps hour integer to the four salutation strings per the band table in the design
    - Implement `init()` — sets `#clock` and `#date-display` immediately, starts `setInterval(tick, 1000)`, updates `#greeting-text` each tick
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [-]* 3.2 Write property test for `formatTime` — Property 1
    - **Property 1: Time formatting is always HH:MM:SS**
    - Test that for any `Date`, `formatTime` returns a string matching `^\d{2}:\d{2}:\d{2}$`
    - **Validates: Requirements 1.2**

  - [-]* 3.3 Write property test for `formatDate` — Property 2
    - **Property 2: Date formatting always contains full date components**
    - Test that for any `Date`, `formatDate` returns a string containing a weekday name, month name, numeric day, and four-digit year
    - **Validates: Requirements 1.3**

  - [-]* 3.4 Write property test for `getGreeting` — Property 3
    - **Property 3: Greeting band classification is exhaustive and correct**
    - Test that for every integer in `[0, 23]`, `getGreeting` returns the correct salutation string and never returns `undefined` or `""`
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**

- [x] 4. Implement `TimerModule` in `js/app.js`
  - [x] 4.1 Implement timer state machine and display
    - Add `TimerModule` namespace inside the IIFE with `totalSeconds`, `intervalId`, and `state` variables
    - Implement `tick()` — decrements `totalSeconds`, formats as `MM:SS`, updates `#timer-display`; when `totalSeconds === 0`, transitions to complete state and fires notification or `window.alert()`
    - Implement `start()` — transitions `idle/paused → running`; sets `setInterval(tick, 1000)`; updates button disabled states per the design table
    - Implement `stop()` — clears interval, transitions `running → paused`; updates button states
    - Implement `reset()` — clears interval, sets `totalSeconds = 1500`, sets `state = 'idle'`, updates display to `"25:00"`, updates button states
    - Implement `init()` — calls `reset()`, binds `#btn-start`, `#btn-stop`, `#btn-reset` click handlers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [-]* 4.2 Write property test for timer reset — Property 4
    - **Property 4: Timer reset is idempotent across all states**
    - Test that calling `reset()` from any state always sets `state = 'idle'` and display to `"25:00"`; calling it twice produces the same result
    - **Validates: Requirements 2.6**

- [x] 5. Checkpoint — Greeting and Timer working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement `TaskModule` in `js/app.js`
  - [x] 6.1 Implement localStorage helpers and task data model
    - Implement `saveTasks(tasks)` — wraps `localStorage.setItem("dashboard_tasks", JSON.stringify(tasks))` in `try/catch`
    - Implement `loadTasks()` — wraps `JSON.parse(localStorage.getItem("dashboard_tasks"))` in `try/catch`; returns `[]` on error or missing key
    - Define the task object shape: `{ id, title, done, createdAt }`; generate `id` via `crypto.randomUUID()` with fallback to `Date.now() + Math.random()`
    - _Requirements: 3.1, 5.6_

  - [ ]* 6.2 Write property test for task persistence — Property 5
    - **Property 5: Task persistence round-trip**
    - Test that `saveTasks(tasks)` followed immediately by `loadTasks()` returns an array deeply equal to the original (all fields and ordering preserved)
    - **Validates: Requirements 3.1**

  - [x] 6.3 Implement task rendering and `addTask`
    - Implement `renderTasks()` — sorts by `createdAt` ascending, generates HTML for each task (read-mode `<li>`) and sets `#task-list` innerHTML
    - Implement `addTask(title)` — trims title; if empty, focuses `#task-input` and returns; else pushes new task, calls `saveTasks`, calls `renderTasks`, clears input
    - Bind `#btn-add-task` click and `#task-input` keydown Enter to `addTask`
    - _Requirements: 3.2, 3.3, 3.9_

  - [~]* 6.4 Write property test for `addTask` — Property 6
    - **Property 6: Task addition — valid titles grow the list; invalid titles do not**
    - Test that non-empty titles increase task array length by 1 and the new task has `done: false`; whitespace-only titles leave the array unchanged
    - **Validates: Requirements 3.2, 3.3, 3.9**

  - [x] 6.5 Implement `toggleTask`, `deleteTask`, and event delegation
    - Implement `toggleTask(id)` — finds task, flips `done`, saves, re-renders
    - Implement `deleteTask(id)` — filters out task by id, saves, re-renders
    - Attach a single `click` event listener on `#task-list`; use `event.target.closest('[data-id]')` and button class to dispatch to the correct handler
    - _Requirements: 3.4, 3.8_

  - [~]* 6.6 Write property test for `toggleTask` — Property 7
    - **Property 7: Task completion toggle is a boolean inverse**
    - Test that one call sets `done = !done`; two calls restore the original value
    - **Validates: Requirements 3.4**

  - [~]* 6.7 Write property test for `deleteTask` — Property 9
    - **Property 9: Task deletion always removes exactly one task**
    - Test that `deleteTask(id)` reduces the array length by exactly 1 and the deleted id no longer appears
    - **Validates: Requirements 3.8**

  - [x] 6.8 Implement `startEditTask`, `confirmEditTask`, `cancelEditTask`
    - Implement `startEditTask(id)` — swaps the read-mode `<li>` to the edit-mode `<li>` in-place (inline input pre-filled with existing title)
    - Implement `confirmEditTask(id, newTitle)` — trims; if non-empty, updates title, saves, re-renders; else restores original title and re-renders
    - Implement `cancelEditTask(id)` — re-renders without saving (discards inline edit)
    - Wire edit/confirm/cancel buttons via the existing event delegation listener
    - _Requirements: 3.5, 3.6, 3.7_

  - [~]* 6.9 Write property test for `confirmEditTask` — Property 8
    - **Property 8: Task edit validation — non-empty saves, empty/whitespace discards**
    - Test that non-empty edits update the stored title; empty/whitespace edits leave the stored title equal to the pre-edit value
    - **Validates: Requirements 3.6, 3.7**

  - [x] 6.10 Implement `TaskModule.init()`
    - Call `loadTasks()`, store result in module-local `tasks` array, call `renderTasks()`
    - _Requirements: 3.1_

- [x] 7. Checkpoint — To-Do List working end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement `LinksModule` in `js/app.js`
  - [x] 8.1 Implement localStorage helpers, data model, and default seeds
    - Implement `saveLinks(links)` — wraps `localStorage.setItem("dashboard_links", JSON.stringify(links))` in `try/catch`
    - Implement `loadLinks()` — if key is absent or parse fails, return the five default seeds (Google, YouTube, GitHub, Gmail, ChatGPT); else return parsed array
    - Define the link object shape: `{ id, label, url }`
    - _Requirements: 4.1, 4.2, 5.6_

  - [~]* 8.2 Write property test for links persistence — Property 10
    - **Property 10: Quick Links persistence round-trip**
    - Test that `saveLinks(links)` followed immediately by `loadLinks()` (with the key present) returns an array deeply equal to the original
    - **Validates: Requirements 4.2**

  - [x] 8.3 Implement link rendering and `openLink`
    - Implement `renderLinks()` — generates `<div class="link-item">` HTML for each link and sets `#links-grid` innerHTML
    - Implement `openLink(url)` — calls `window.open(url, '_blank', 'noopener,noreferrer')`
    - Attach a single `click` event listener on `#links-grid` for open/edit/delete dispatching
    - _Requirements: 4.3_

  - [x] 8.4 Implement `addLink` and the add-link form
    - Implement `addLink(label, url)` — trims both; if either empty, highlight the missing input and return; else push new link, save, re-render, hide the form
    - Bind `#btn-add-link` to show `#add-link-form`; bind `#btn-confirm-link` to call `addLink`; bind `#btn-cancel-link` to hide the form
    - _Requirements: 4.4, 4.5, 4.6_

  - [~]* 8.5 Write property test for `addLink` — Property 11
    - **Property 11: Quick Link add — valid inputs grow the list; missing inputs do not**
    - Test that both fields non-empty increases list length by 1; either field empty leaves list unchanged
    - **Validates: Requirements 4.5, 4.6**

  - [x] 8.6 Implement `startEditLink`, `confirmEditLink`, `deleteLink`
    - Implement `startEditLink(id)` — populates `#link-label-input` and `#link-url-input` with the existing values; sets form to edit mode so confirm saves rather than adds
    - Implement `confirmEditLink(id, label, url)` — validates non-empty; updates record; saves; re-renders; hides form
    - Implement `deleteLink(id)` — filters out link by id; saves; re-renders
    - _Requirements: 4.7, 4.8_

  - [~]* 8.7 Write property test for `deleteLink` — Property 12
    - **Property 12: Quick Link deletion always removes exactly one link**
    - Test that `deleteLink(id)` reduces list length by exactly 1 and the deleted id no longer appears
    - **Validates: Requirements 4.8**

  - [x] 8.8 Implement `LinksModule.init()`
    - Call `loadLinks()`, store in module-local `links` array, call `renderLinks()`
    - _Requirements: 4.1, 4.2_

- [x] 9. Wire all modules on `DOMContentLoaded`
  - [x] 9.1 Add `DOMContentLoaded` initialisation entry point
    - At the bottom of the IIFE, add `document.addEventListener('DOMContentLoaded', () => { GreetingModule.init(); TimerModule.init(); TaskModule.init(); LinksModule.init(); })`
    - Verify all four sections render correctly and interact without console errors on file:// open in Chrome, Firefox, Edge, and Safari
    - _Requirements: 5.4, 5.5_

  - [~]* 9.2 Write integration smoke tests
    - Verify page load initialises all four modules without errors
    - Verify a task add → reload cycle restores the task (localStorage round-trip)
    - Verify a link add → reload cycle restores the link
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 10. Final checkpoint — Full dashboard integration
  - Ensure all tests pass and all four sections function correctly end-to-end. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests (Properties 1–12) map directly to the Correctness Properties section of the design document
- The single IIFE in `js/app.js` keeps all module namespaces private from `window`
- Error handling (corrupt localStorage, missing Notification API, missing `crypto.randomUUID`) is addressed within each module's helpers
- No build step, no dependencies — open `index.html` directly in a browser

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "6.5", "6.8"] },
    { "id": 7, "tasks": ["6.6", "6.7", "6.9", "6.10", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["8.4", "8.6"] },
    { "id": 10, "tasks": ["8.5", "8.7", "8.8"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["9.2"] }
  ]
}
```
