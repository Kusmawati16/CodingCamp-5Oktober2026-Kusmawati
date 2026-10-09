# Design Document — To-Do List Life Dashboard

## Overview

The Life Dashboard is a fully static, single-page web application delivered as three files: `index.html`, `css/style.css`, and `js/app.js`. There is no build step, no server, and no external dependency. All state is stored in `window.localStorage`. The page renders four always-visible sections — Greeting Panel, Focus Timer, To-Do List, and Quick Links Panel — laid out in a responsive pastel-themed grid.

---

## Architecture

### High-Level Structure

```
index.html          ← HTML skeleton, section markup, links to CSS/JS
css/
  style.css         ← All styling: layout, pastel palette, typography, responsive breakpoints
js/
  app.js            ← All behaviour: module namespaces, DOM manipulation, localStorage I/O
```

The JavaScript is organised into four self-contained namespace objects within a single IIFE to avoid polluting `window`. Each namespace owns its DOM references, storage key, and public methods:

```
GreetingModule      — clock/date display, salutation logic
TimerModule         — countdown state machine, button control
TaskModule          — task CRUD, localStorage serialisation
LinksModule         — quick-link CRUD, localStorage serialisation
```

Initialisation order on `DOMContentLoaded`:
1. `GreetingModule.init()` — starts `setInterval` tick
2. `TimerModule.init()` — resets display to 25:00, binds buttons
3. `TaskModule.init()` — loads tasks from storage, renders list
4. `LinksModule.init()` — loads links from storage (or seeds defaults), renders buttons

---

## Components

### 1. Greeting Panel

**Responsibility:** Display live clock, formatted date, and time-sensitive salutation.

**DOM structure:**
```html
<section id="greeting-panel" class="panel">
  <h2 id="greeting-text">Good Morning</h2>
  <p id="clock">00:00:00</p>
  <p id="date-display">Monday, January 1, 2025</p>
</section>
```

**Behaviour:**
- `setInterval(tick, 1000)` updates `#clock` every second.
- `formatTime(date)` — pads hours, minutes, seconds to two digits with `:` separators.
- `formatDate(date)` — uses `Intl.DateTimeFormat` with `{ weekday:'long', year:'numeric', month:'long', day:'numeric' }` for locale-aware full date.
- `getGreeting(hour)` — pure function mapping hour integer to salutation string (see Requirement 1.4–1.7).

**Greeting band mapping:**

| Hour range | Salutation       |
|------------|-----------------|
| 05 – 11    | Good Morning    |
| 12 – 17    | Good Afternoon  |
| 18 – 20    | Good Evening    |
| 21 – 23, 00 – 04 | Good Night |

---

### 2. Focus Timer

**Responsibility:** Manage a 25-minute countdown with Start / Stop / Reset.

**DOM structure:**
```html
<section id="timer-panel" class="panel">
  <h2>Focus Timer</h2>
  <div id="timer-display">25:00</div>
  <div class="timer-controls">
    <button id="btn-start">Start</button>
    <button id="btn-stop" disabled>Stop</button>
    <button id="btn-reset">Reset</button>
  </div>
</section>
```

**State machine:**

```
IDLE  ──start()──►  RUNNING  ──stop()──►  PAUSED
                       │                     │
                    tick()=0              start()──► RUNNING
                       ▼
                  COMPLETE ──reset()──►  IDLE
              (any state) ──reset()──►  IDLE
```

**Key variables (inside `TimerModule`):**
- `totalSeconds` — remaining seconds (1500 on init/reset)
- `intervalId` — `setInterval` handle (null when not running)
- `state` — `'idle' | 'running' | 'paused' | 'complete'`

**Button enable/disable rules:**

| State    | Start   | Stop    | Reset  |
|----------|---------|---------|--------|
| idle     | enabled | disabled | enabled |
| running  | disabled | enabled | enabled |
| paused   | enabled | disabled | enabled |
| complete | disabled | disabled | enabled |

**Completion notification:** Tries `new Notification()` if `Notification.permission === 'granted'`; falls back to `window.alert()`.

---

### 3. To-Do List

**Responsibility:** Full CRUD for tasks with LocalStorage persistence.

**DOM structure:**
```html
<section id="todo-panel" class="panel">
  <h2>To-Do List</h2>
  <div class="todo-input-row">
    <input id="task-input" type="text" placeholder="Add a new task…" />
    <button id="btn-add-task">Add</button>
  </div>
  <ul id="task-list"></ul>
</section>
```

**Task data model:**
```js
{
  id:        string,   // crypto.randomUUID() or Date.now().toString()
  title:     string,   // task text
  done:      boolean,  // completion state
  createdAt: number    // Date.now() timestamp
}
```

**Storage key:** `"dashboard_tasks"` — serialised as JSON array.

**Rendered task item (read mode):**
```html
<li data-id="{id}" class="task-item [done]">
  <button class="btn-toggle" aria-label="Toggle complete">✓</button>
  <span class="task-title">{title}</span>
  <div class="task-actions">
    <button class="btn-edit" aria-label="Edit task">✎</button>
    <button class="btn-delete" aria-label="Delete task">✕</button>
  </div>
</li>
```

**Rendered task item (edit mode):**
```html
<li data-id="{id}" class="task-item editing">
  <input class="edit-input" value="{title}" />
  <button class="btn-confirm-edit" aria-label="Save edit">✔</button>
  <button class="btn-cancel-edit" aria-label="Cancel edit">✗</button>
</li>
```

**CRUD operations:**

| Operation | Logic |
|-----------|-------|
| `addTask(title)` | Trims title; rejects if empty/whitespace; pushes new task object; saves; re-renders |
| `toggleTask(id)` | Finds task by id; flips `done`; saves; re-renders |
| `startEditTask(id)` | Swaps read-mode LI to edit-mode LI in-place |
| `confirmEditTask(id, newTitle)` | Trims; if non-empty updates title; else restores original; saves; re-renders |
| `deleteTask(id)` | Filters out task by id; saves; re-renders |

**Render order:** Tasks rendered in `createdAt` ascending order (oldest first / newest at bottom).

---

### 4. Quick Links Panel

**Responsibility:** Render named URL buttons; support add / edit / delete with persistence.

**DOM structure:**
```html
<section id="links-panel" class="panel">
  <h2>Quick Links</h2>
  <div id="links-grid"></div>
  <button id="btn-add-link">+ Add Link</button>
  <div id="add-link-form" class="hidden">
    <input id="link-label-input" placeholder="Label" />
    <input id="link-url-input" placeholder="https://…" />
    <button id="btn-confirm-link">Add</button>
    <button id="btn-cancel-link">Cancel</button>
  </div>
</section>
```

**Quick Link data model:**
```js
{
  id:    string,   // crypto.randomUUID() or Date.now().toString()
  label: string,
  url:   string    // stored as-is; opened via window.open(url, '_blank')
}
```

**Storage key:** `"dashboard_links"` — serialised as JSON array.

**Default seeds (applied only when storage key is absent):**
```js
[
  { label: 'Google',  url: 'https://www.google.com' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'GitHub',  url: 'https://www.github.com' },
  { label: 'Gmail',   url: 'https://mail.google.com' },
  { label: 'ChatGPT', url: 'https://chat.openai.com' }
]
```

**Rendered link button:**
```html
<div class="link-item" data-id="{id}">
  <button class="link-btn" onclick="window.open(url,'_blank')">{label}</button>
  <button class="btn-edit-link" aria-label="Edit link">✎</button>
  <button class="btn-delete-link" aria-label="Delete link">✕</button>
</div>
```

**CRUD operations:**

| Operation | Logic |
|-----------|-------|
| `addLink(label, url)` | Trims both; rejects if either empty; pushes; saves; re-renders; hides form |
| `editLink(id)` | Populates form fields; sets form to edit mode (confirm button updates rather than adds) |
| `confirmEditLink(id, label, url)` | Validates non-empty; updates record; saves; re-renders |
| `deleteLink(id)` | Filters out by id; saves; re-renders |
| `openLink(url)` | `window.open(url, '_blank', 'noopener,noreferrer')` |

---

## Data Models and Local Storage Schema

```
localStorage key: "dashboard_tasks"
Value: JSON.stringify(Task[])

localStorage key: "dashboard_links"
Value: JSON.stringify(QuickLink[])
```

Both keys are read at `init()` time with a `try/catch` around `JSON.parse` to handle corrupt data gracefully (defaults to empty array / seed defaults on parse error).

---

## Interfaces

### Module Public API

```js
// GreetingModule
init()                          // starts clock interval

// TimerModule
init()                          // resets display, binds buttons
start()                         // transitions idle/paused → running
stop()                          // transitions running → paused
reset()                         // transitions any → idle, restores 25:00
// Internal:
tick()                          // called each second; decrements totalSeconds

// TaskModule
init()                          // loads from storage, renders
addTask(title: string)
toggleTask(id: string)
startEditTask(id: string)
confirmEditTask(id: string, newTitle: string)
cancelEditTask(id: string)
deleteTask(id: string)

// LinksModule
init()                          // loads from storage (or seeds defaults), renders
openLink(url: string)
addLink(label: string, url: string)
startEditLink(id: string)
confirmEditLink(id: string, label: string, url: string)
deleteLink(id: string)
```

### Event Delegation

Rather than attaching listeners to every button, `TaskModule` and `LinksModule` each attach a single `click` listener to their container (`#task-list` and `#links-grid` respectively), reading `event.target.closest('[data-id]')` and `event.target.dataset.action` to dispatch to the correct handler.

---

## Visual Design and Layout

### Colour Palette

| Token          | Value     | Usage                        |
|----------------|-----------|------------------------------|
| `--lavender`   | `#C9B8E8` | Greeting panel accent        |
| `--lavender-light` | `#EDE8F5` | Greeting panel background |
| `--mint`       | `#A8D5BA` | Timer panel accent           |
| `--mint-light` | `#E8F5EE` | Timer panel background       |
| `--peach`      | `#F5C6A0` | Task list accent             |
| `--peach-light`| `#FDF0E8` | Task list background         |
| `--sky`        | `#A8C8E8` | Quick Links accent           |
| `--sky-light`  | `#E8F0F8` | Quick Links background       |
| `--text-main`  | `#3D3D4E` | Body text                    |
| `--text-muted` | `#888899` | Secondary/placeholder text   |
| `--white`      | `#FFFFFF` | Card/input backgrounds       |

### Typography

- Font stack: `'Segoe UI', system-ui, sans-serif`
- Body size: `16px` base
- Clock: `3rem`, bold
- Section headings (`h2`): `1.25rem`, `600` weight
- Task titles: `1rem`

### Layout

**≥ 768 px (desktop grid):**
```
┌──────────────┬──────────────┐
│  Greeting    │  Focus Timer │
├──────────────┼──────────────┤
│  To-Do List  │  Quick Links │
└──────────────┴──────────────┘
```
Implemented with `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem`.

**< 768 px (mobile stack):**
All four panels stack vertically in a single column.

### Panel Card Style

Each `<section class="panel">` uses:
- `border-radius: 16px`
- `padding: 1.5rem`
- `box-shadow: 0 2px 12px rgba(0,0,0,0.08)`
- Per-section pastel background via specific class (`.greeting-panel`, `.timer-panel`, etc.)

### Interactive States

- Buttons: pastel background, `border-radius: 8px`, hover darkens by 10%, active scales to `0.97`
- Task done: title gets `text-decoration: line-through; color: var(--text-muted)`
- Edit inputs: `border: 2px solid var(--lavender); border-radius: 6px`

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| `localStorage` unavailable (private browsing / quota exceeded) | `try/catch` around all read/write calls; app continues without persistence; silent graceful degradation |
| Corrupt JSON in storage | `JSON.parse` wrapped in `try/catch`; defaults to `[]` (tasks) or seed defaults (links) |
| `Notification` API unavailable or denied | Falls back to `window.alert()` |
| `crypto.randomUUID()` unavailable (old browser) | Falls back to `Date.now() + Math.random()` string |
| Empty / whitespace task or link input | Validated before any storage write; input field receives focus; no partial state mutation |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Time formatting is always HH:MM:SS

*For any* `Date` object, `formatTime(date)` SHALL return a string that exactly matches the pattern `\d{2}:\d{2}:\d{2}` — two-digit hours, two-digit minutes, two-digit seconds separated by colons — with no leading or trailing characters.

**Validates: Requirements 1.2**

---

### Property 2: Date formatting always contains full date components

*For any* `Date` object, `formatDate(date)` SHALL return a string that contains: a day-of-week name, a month name, a numeric day of the month, and a four-digit year — all drawn from the actual date represented by the input.

**Validates: Requirements 1.3**

---

### Property 3: Greeting band classification is exhaustive and correct

*For any* integer hour in the range `[0, 23]`, `getGreeting(hour)` SHALL return exactly one of the four salutation strings, matching the correct band: `"Good Morning"` for hours 5–11, `"Good Afternoon"` for hours 12–17, `"Good Evening"` for hours 18–20, and `"Good Night"` for hours 21–23 and 0–4. No hour value produces an undefined or empty result.

**Validates: Requirements 1.4, 1.5, 1.6, 1.7**

---

### Property 4: Timer reset is idempotent across all states

*For any* timer state (idle, running, paused, or complete) and any remaining time value, calling `reset()` SHALL always transition the timer to idle state and set the display to exactly `"25:00"`. Calling `reset()` a second time on an already-idle timer at 25:00 SHALL produce the same result.

**Validates: Requirements 2.6**

---

### Property 5: Task persistence round-trip

*For any* array of valid task objects, serialising the array to Local Storage via `saveTasks(tasks)` and immediately deserialising via `loadTasks()` SHALL return an array that is deeply equal to the original — preserving all fields (`id`, `title`, `done`, `createdAt`) and the original ordering.

**Validates: Requirements 3.1**

---

### Property 6: Task addition — valid titles grow the list; invalid titles do not

*For any* existing task list and any candidate title string: if the trimmed title is non-empty, `addTask(title)` SHALL increase the task list length by exactly 1 and the new task SHALL appear as the last element with the provided title and `done: false`. If the trimmed title is empty or consists entirely of whitespace, `addTask(title)` SHALL leave the task list length and contents entirely unchanged.

**Validates: Requirements 3.2, 3.3, 3.9**

---

### Property 7: Task completion toggle is a boolean inverse

*For any* task with any `done` value, calling `toggleTask(id)` exactly once SHALL set `done` to `!done`. Calling `toggleTask(id)` twice in sequence SHALL restore `done` to its original value (round-trip identity).

**Validates: Requirements 3.4**

---

### Property 8: Task edit validation — non-empty saves, empty/whitespace discards

*For any* task with an existing title and any candidate edit string: if the trimmed string is non-empty, `confirmEditTask(id, newTitle)` SHALL update the stored title to the trimmed string. If the trimmed string is empty or all-whitespace, `confirmEditTask(id, newTitle)` SHALL leave the stored title equal to the original pre-edit value.

**Validates: Requirements 3.6, 3.7**

---

### Property 9: Task deletion always removes exactly one task

*For any* task list containing at least one task and any valid task `id` present in the list, `deleteTask(id)` SHALL reduce the list length by exactly 1 and the task with that `id` SHALL not appear anywhere in the resulting list.

**Validates: Requirements 3.8**

---

### Property 10: Quick Links persistence round-trip

*For any* array of valid Quick Link objects, serialising to Local Storage via `saveLinks(links)` and immediately deserialising via `loadLinks()` SHALL return an array deeply equal to the original — preserving all fields (`id`, `label`, `url`) and the original ordering.

**Validates: Requirements 4.2**

---

### Property 11: Quick Link add — valid inputs grow the list; missing inputs do not

*For any* existing links list and any candidate `(label, url)` pair: if both trimmed values are non-empty, `addLink(label, url)` SHALL increase the list length by exactly 1 and the new link SHALL have the provided label and URL. If either trimmed value is empty, `addLink(label, url)` SHALL leave the list length and contents entirely unchanged.

**Validates: Requirements 4.5, 4.6**

---

### Property 12: Quick Link deletion always removes exactly one link

*For any* links list containing at least one link and any valid link `id` present in the list, `deleteLink(id)` SHALL reduce the list length by exactly 1 and the link with that `id` SHALL not appear anywhere in the resulting list.

**Validates: Requirements 4.8**
