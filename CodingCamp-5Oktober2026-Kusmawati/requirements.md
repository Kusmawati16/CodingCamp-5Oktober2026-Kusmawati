# Requirements Document

## Introduction

A single-page "To-do List Life Dashboard" website built with plain HTML, CSS, and Vanilla JavaScript. All data persists via the browser's Local Storage API — no backend server is required. The dashboard presents four sections always visible on one scrollable page: a Greeting panel showing the current date/time, a 25-minute Focus Timer, a To-Do List, and a Quick Links launcher. The visual theme uses soft pastel tones (lavender, mint, peach). The project must be structured with exactly one CSS file under `css/` and one JavaScript file under `js/`.

---

## Glossary

- **Dashboard**: The single HTML page (`index.html`) that renders all four feature sections.
- **Greeting Panel**: The section that displays the current time, date, and a time-sensitive salutation.
- **Focus Timer**: The 25-minute countdown Pomodoro-style timer section.
- **Task**: A single to-do item that has a title, a completion state, and a creation timestamp.
- **Task List**: The ordered collection of Tasks rendered in the To-Do List section.
- **Quick Link**: A named hyperlink record composed of a label and a URL, stored in Local Storage.
- **Quick Links Panel**: The section that renders Quick Link buttons.
- **Local Storage**: The browser's `window.localStorage` Web API used for all client-side persistence.
- **App**: The Dashboard as a whole, delivered as a standalone static web page.

---

## Requirements

### Requirement 1 — Greeting Panel

**User Story:** As a user, I want to see the current time, date, and a personalized greeting so that I feel oriented and welcomed when I open the dashboard.

#### Acceptance Criteria

1. THE App SHALL render a Greeting Panel as the first visible section of the page on every load.
2. WHEN the Dashboard is displayed, THE Greeting Panel SHALL show the current time in HH:MM:SS format updated every second.
3. WHEN the Dashboard is displayed, THE Greeting Panel SHALL show the full current date including the day of the week, month, day number, and year.
4. WHEN the current local time is between 05:00 and 11:59, THE Greeting Panel SHALL display the salutation "Good Morning".
5. WHEN the current local time is between 12:00 and 17:59, THE Greeting Panel SHALL display the salutation "Good Afternoon".
6. WHEN the current local time is between 18:00 and 20:59, THE Greeting Panel SHALL display the salutation "Good Evening".
7. WHEN the current local time is between 21:00 and 04:59, THE Greeting Panel SHALL display the salutation "Good Night".

---

### Requirement 2 — Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls so that I can manage focused work sessions without leaving the dashboard.

#### Acceptance Criteria

1. THE Focus Timer SHALL initialise the countdown display to 25:00 (minutes:seconds) on every page load.
2. WHEN the user activates the Start button, THE Focus Timer SHALL begin counting down from the current displayed time, decrementing the display by one second each second.
3. WHILE the Focus Timer is counting down, THE Focus Timer SHALL disable the Start button and enable the Stop button.
4. WHEN the user activates the Stop button, THE Focus Timer SHALL pause the countdown and retain the remaining time on the display.
5. WHILE the Focus Timer is paused, THE Focus Timer SHALL enable the Start button so the user can resume.
6. WHEN the user activates the Reset button, THE Focus Timer SHALL stop any active countdown and restore the display to 25:00.
7. WHEN the countdown reaches 00:00, THE Focus Timer SHALL stop automatically and display a browser notification or an on-page alert informing the user that the session is complete.

---

### Requirement 3 — To-Do List

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks so that I can track what I need to accomplish during my day.

#### Acceptance Criteria

1. THE Task List SHALL persist all Tasks in Local Storage so that Tasks survive page reload.
2. WHEN the user submits a non-empty task title via the input field, THE Task List SHALL add a new Task with the provided title and an incomplete state.
3. IF the user attempts to submit an empty task title, THEN THE Task List SHALL reject the submission and retain focus on the input field without adding a Task.
4. WHEN the user activates the complete toggle on a Task, THE Task List SHALL update the Task's completion state and apply a visual strikethrough style to the Task title.
5. WHEN the user activates the edit control on a Task, THE Task List SHALL render the Task title as an editable inline field pre-filled with the existing title.
6. WHEN the user confirms an edit with a non-empty title, THE Task List SHALL save the updated title to Local Storage and restore the Task to read-only display.
7. IF the user confirms an edit with an empty title, THEN THE Task List SHALL discard the change and restore the original title.
8. WHEN the user activates the delete control on a Task, THE Task List SHALL remove the Task from the Task List and from Local Storage.
9. THE Task List SHALL display Tasks in the order they were added, with the most recently added Task appearing at the bottom.

---

### Requirement 4 — Quick Links Panel

**User Story:** As a user, I want a panel of clickable link buttons for my favourite websites so that I can navigate quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick Links Panel SHALL initialise with the following default Quick Links on the first load when Local Storage contains no Quick Link data: Google (`https://www.google.com`), YouTube (`https://www.youtube.com`), GitHub (`https://www.github.com`), Gmail (`https://mail.google.com`), and ChatGPT (`https://chat.openai.com`).
2. THE Quick Links Panel SHALL persist all Quick Links in Local Storage so that user-defined links survive page reload.
3. WHEN the user activates a Quick Link button, THE App SHALL open the associated URL in a new browser tab.
4. WHEN the user activates the add-link control, THE Quick Links Panel SHALL display an inline form requesting a label and a URL.
5. WHEN the user submits the add-link form with a non-empty label and a non-empty URL, THE Quick Links Panel SHALL add the new Quick Link, save it to Local Storage, and render a new button for it.
6. IF the user submits the add-link form with an empty label or an empty URL, THEN THE Quick Links Panel SHALL reject the submission and indicate which field is missing.
7. WHEN the user activates the edit control on a Quick Link, THE Quick Links Panel SHALL allow the user to update the label or URL of that Quick Link and save the change to Local Storage.
8. WHEN the user activates the delete control on a Quick Link, THE Quick Links Panel SHALL remove the Quick Link from the panel and from Local Storage.

---

### Requirement 5 — Technology Stack and Project Structure

**User Story:** As a developer, I want the codebase to follow strict structural rules so that it remains clean, maintainable, and runs in any modern browser without a server.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE App SHALL contain exactly one CSS file located at `css/style.css`.
3. THE App SHALL contain exactly one JavaScript file located at `js/app.js`.
4. THE App SHALL function correctly when opened directly in a browser as a local file (`file://` protocol) with no backend server.
5. THE App SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari.
6. THE App SHALL use `window.localStorage` as the sole mechanism for data persistence.

---

### Requirement 6 — Visual Design and Responsiveness

**User Story:** As a user, I want a clean, readable, and visually pleasant interface so that using the dashboard is comfortable for extended periods.

#### Acceptance Criteria

1. THE App SHALL apply a soft pastel colour palette with primary tones drawn from lavender, mint, and peach.
2. THE App SHALL render all four sections — Greeting Panel, Focus Timer, Task List, and Quick Links Panel — on a single scrollable page with no routing or page transitions.
3. THE App SHALL use a clear visual hierarchy with section headings, adequate whitespace, and readable body typography.
4. WHEN the viewport width is 768 px or wider, THE App SHALL display the four sections in a multi-column layout.
5. WHEN the viewport width is below 768 px, THE App SHALL reflow the layout to a single-column stack so the App remains usable on mobile screens.
6. THE App SHALL load and become interactive within 3 seconds on a standard broadband connection for the initial page load with no cached assets.
