(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // GreetingModule — live clock, locale-aware date, time-sensitive salutation
  // Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
  // ─────────────────────────────────────────────────────────────────────────────
  var GreetingModule = {

    /**
     * Formats a Date's time portion as HH:MM:SS with zero-padded two-digit fields.
     * @param {Date} date
     * @returns {string}  e.g. "09:05:03"
     */
    formatTime: function (date) {
      var h = String(date.getHours()).padStart(2, '0');
      var m = String(date.getMinutes()).padStart(2, '0');
      var s = String(date.getSeconds()).padStart(2, '0');
      return h + ':' + m + ':' + s;
    },

    /**
     * Formats a Date as a locale-aware full date string containing weekday,
     * month name, day number, and four-digit year.
     * @param {Date} date
     * @returns {string}  e.g. "Monday, January 6, 2025"
     */
    formatDate: function (date) {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    },

    /**
     * Maps an hour integer (0–23) to the appropriate salutation string.
     * Band table:
     *   05–11 → "Good Morning"
     *   12–17 → "Good Afternoon"
     *   18–20 → "Good Evening"
     *   21–23, 00–04 → "Good Night"
     * @param {number} hour  Integer in range [0, 23]
     * @returns {string}
     */
    getGreeting: function (hour) {
      if (hour >= 5 && hour <= 11) {
        return 'Good Morning';
      } else if (hour >= 12 && hour <= 17) {
        return 'Good Afternoon';
      } else if (hour >= 18 && hour <= 20) {
        return 'Good Evening';
      } else {
        // Covers 21–23 and 00–04
        return 'Good Night';
      }
    },

    /**
     * Captures the current moment and updates all three Greeting Panel elements.
     * Called once immediately by init() and then on every 1-second interval.
     */
    tick: function () {
      var now = new Date();
      document.getElementById('clock').textContent = GreetingModule.formatTime(now);
      document.getElementById('date-display').textContent = GreetingModule.formatDate(now);
      document.getElementById('greeting-text').textContent = GreetingModule.getGreeting(now.getHours());
    },

    /**
     * Bootstraps the Greeting Panel: renders immediately then starts a 1-second
     * interval so the clock updates in real time.
     */
    init: function () {
      GreetingModule.tick();
      setInterval(GreetingModule.tick, 1000);
    }

  }; // end GreetingModule

  // ─────────────────────────────────────────────────────────────────────────────
  // TimerModule — 25-minute countdown state machine
  // Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
  // ─────────────────────────────────────────────────────────────────────────────
  var TimerModule = (function () {

    // Private state
    var totalSeconds = 1500;   // 25 minutes
    var intervalId   = null;
    var state        = 'idle'; // 'idle' | 'running' | 'paused' | 'complete'

    /**
     * Converts a total-seconds count into a "MM:SS" display string.
     * @param {number} seconds  Non-negative integer
     * @returns {string}  e.g. 1500 → "25:00", 90 → "01:30"
     */
    function formatDisplay(seconds) {
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    /**
     * Enables/disables the three timer buttons according to the current state.
     * Button disable rules:
     *   idle     : start=enabled,  stop=disabled, reset=enabled
     *   running  : start=disabled, stop=enabled,  reset=enabled
     *   paused   : start=enabled,  stop=disabled, reset=enabled
     *   complete : start=disabled, stop=disabled, reset=enabled
     */
    function updateButtonStates() {
      var btnStart = document.getElementById('btn-start');
      var btnStop  = document.getElementById('btn-stop');
      var btnReset = document.getElementById('btn-reset');

      if (!btnStart || !btnStop || !btnReset) { return; }

      // Reset is always enabled
      btnReset.disabled = false;

      switch (state) {
        case 'idle':
          btnStart.disabled = false;
          btnStop.disabled  = true;
          break;
        case 'running':
          btnStart.disabled = true;
          btnStop.disabled  = false;
          break;
        case 'paused':
          btnStart.disabled = false;
          btnStop.disabled  = true;
          break;
        case 'complete':
          btnStart.disabled = true;
          btnStop.disabled  = true;
          break;
        default:
          btnStart.disabled = false;
          btnStop.disabled  = true;
      }
    }

    /**
     * Called once per second while the timer is running.
     * Decrements totalSeconds, updates the display, and handles completion.
     */
    function tick() {
      totalSeconds -= 1;
      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = formatDisplay(totalSeconds);
      }

      if (totalSeconds === 0) {
        clearInterval(intervalId);
        intervalId = null;
        state = 'complete';
        updateButtonStates();

        // Notify the user that the session is done
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Focus session complete!');
        } else {
          window.alert('Focus session complete!');
        }
      }
    }

    /**
     * Transitions idle/paused → running; starts the 1-second interval.
     */
    function start() {
      if (state === 'idle' || state === 'paused') {
        state = 'running';
        intervalId = setInterval(tick, 1000);
        updateButtonStates();
      }
    }

    /**
     * Transitions running → paused; clears the interval.
     */
    function stop() {
      if (state === 'running') {
        clearInterval(intervalId);
        intervalId = null;
        state = 'paused';
        updateButtonStates();
      }
    }

    /**
     * Resets the timer to its initial idle state from any state.
     * Idempotent — calling it twice produces the same result.
     */
    function reset() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      totalSeconds = 1500;
      state = 'idle';

      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = '25:00';
      }

      updateButtonStates();
    }

    /**
     * Bootstraps the Timer Panel: resets to 25:00, binds button click handlers.
     */
    function init() {
      reset();

      var btnStart = document.getElementById('btn-start');
      var btnStop  = document.getElementById('btn-stop');
      var btnReset = document.getElementById('btn-reset');

      if (btnStart) { btnStart.addEventListener('click', start); }
      if (btnStop)  { btnStop.addEventListener('click', stop);   }
      if (btnReset) { btnReset.addEventListener('click', reset);  }
    }

    // Public API — expose methods for external use and testability
    return {
      formatDisplay:      formatDisplay,
      updateButtonStates: updateButtonStates,
      tick:               tick,
      start:              start,
      stop:               stop,
      reset:              reset,
      init:               init,
      // Getters exposed for property-based testing (Property 4)
      getState:   function () { return state; },
      getSeconds: function () { return totalSeconds; },
      // Test helper: force internal state for property testing without
      // waiting for real countdown ticks. Only used by tests/property-test.js.
      _forceState: function (newState, newSeconds) {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        state        = newState;
        totalSeconds = (newSeconds !== undefined) ? newSeconds : totalSeconds;
      }
    };

  }()); // end TimerModule

  // ─────────────────────────────────────────────────────────────────────────────
  // TaskModule — to-do CRUD with localStorage persistence
  // Requirements: 3.1–3.9, 5.6
  // ─────────────────────────────────────────────────────────────────────────────
  var TaskModule = (function () {

    // Private state
    var tasks = [];

    /** Storage key used for all localStorage reads/writes. */
    var STORAGE_KEY = 'dashboard_tasks';

    /**
     * Task data model:
     * {
     *   id:        string,   // unique identifier
     *   title:     string,   // task text
     *   done:      boolean,  // completion state
     *   createdAt: number    // Date.now() timestamp
     * }
     */

    /**
     * Generates a unique string id.
     * Uses crypto.randomUUID() when available; falls back to Date.now() + Math.random().
     * @returns {string}
     */
    function generateId() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return String(Date.now()) + String(Math.random());
    }

    /**
     * Persists the given tasks array to localStorage as a JSON string.
     * Silently degrades on any error (e.g. private browsing, quota exceeded).
     * @param {Array} taskArray
     */
    function saveTasks(taskArray) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(taskArray));
      } catch (e) {
        // Silent graceful degradation — app continues without persistence
      }
    }

    /**
     * Reads and parses the tasks array from localStorage.
     * Returns an empty array when:
     *   - the key is absent or null
     *   - JSON.parse throws (corrupt data)
     *   - the parsed value is not an Array
     * @returns {Array}
     */
    function loadTasks() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) { return []; }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    // ── Placeholder stubs — to be implemented in Tasks 6.2–6.10 ──────────────

    /**
     * Escapes characters that are unsafe inside HTML text content and attribute values.
     * Prevents XSS when task titles contain <, >, &, or " characters.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /** Re-renders the entire task list from the private tasks array. */
    function renderTasks() {
      var list = document.getElementById('task-list');
      if (!list) { return; }

      if (tasks.length === 0) {
        list.innerHTML = '';
        return;
      }

      // Sort by createdAt ascending (oldest first, newest at bottom)
      var sorted = tasks.slice().sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });

      var html = sorted.map(function (task) {
        var doneClass = task.done ? ' done' : '';
        return '<li data-id="' + task.id + '" class="task-item' + doneClass + '">' +
          '<button class="btn-toggle" aria-label="Toggle complete">✓</button>' +
          '<span class="task-title">' + escapeHtml(task.title) + '</span>' +
          '<div class="task-actions">' +
            '<button class="btn-edit" aria-label="Edit task">✎</button>' +
            '<button class="btn-delete" aria-label="Delete task">✕</button>' +
          '</div>' +
        '</li>';
      }).join('');

      list.innerHTML = html;
    }

    /**
     * Adds a new task with the given title.
     * Trims title; rejects if empty/whitespace.
     * @param {string} title
     */
    function addTask(title) {
      var trimmedTitle = (title || '').trim();
      if (!trimmedTitle) {
        var input = document.getElementById('task-input');
        if (input) { input.focus(); }
        return;
      }

      var newTask = {
        id:        generateId(),
        title:     trimmedTitle,
        done:      false,
        createdAt: Date.now()
      };

      tasks.push(newTask);
      saveTasks(tasks);
      renderTasks();

      var taskInput = document.getElementById('task-input');
      if (taskInput) { taskInput.value = ''; }
    }

    /**
     * Flips the done state of the task identified by id.
     * @param {string} id
     */
    function toggleTask(id) {
      var task = tasks.find(function (t) { return t.id === id; });
      if (!task) { return; }
      task.done = !task.done;
      saveTasks(tasks);
      renderTasks();
    }

    /**
     * Deletes the task identified by id.
     * @param {string} id
     */
    function deleteTask(id) {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks(tasks);
      renderTasks();
    }

    /**
     * Switches the task item for id into inline edit mode.
     * Replaces the <li>'s className and innerHTML with an edit-mode form.
     * @param {string} id
     */
    function startEditTask(id) {
      var item = document.querySelector('[data-id="' + id + '"]');
      if (!item) { return; }

      var task = tasks.find(function (t) { return t.id === id; });
      if (!task) { return; }

      item.className = 'task-item editing';
      item.innerHTML =
        '<input class="edit-input" value="' + escapeHtml(task.title) + '" />' +
        '<button class="btn-confirm-edit" aria-label="Save edit">✔</button>' +
        '<button class="btn-cancel-edit" aria-label="Cancel edit">✗</button>';

      var input = item.querySelector('.edit-input');
      if (input) { input.focus(); }
    }

    /**
     * Saves the edited title for the task identified by id.
     * Trims newTitle; if empty, restores the original title without saving.
     * @param {string} id
     * @param {string} newTitle
     */
    function confirmEditTask(id, newTitle) {
      var trimmedTitle = (newTitle || '').trim();
      var task = tasks.find(function (t) { return t.id === id; });
      if (!task) { return; }

      if (trimmedTitle) {
        task.title = trimmedTitle;
        saveTasks(tasks);
      }
      // Whether trimmed or empty, re-render to restore read-mode view
      renderTasks();
    }

    /**
     * Cancels an in-progress edit and restores read mode for the task.
     * @param {string} id
     */
    function cancelEditTask(id) {
      renderTasks();
    }

    /**
     * Bootstraps the Task panel: loads tasks from storage, renders the list,
     * and binds the Add button and input event listeners.
     */
    function init() {
      tasks = loadTasks();
      renderTasks();

      var btnAdd   = document.getElementById('btn-add-task');
      var taskInput = document.getElementById('task-input');

      if (btnAdd) {
        btnAdd.addEventListener('click', function () {
          addTask(document.getElementById('task-input').value);
        });
      }

      if (taskInput) {
        taskInput.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            addTask(event.target.value);
          }
        });
      }

      var taskList = document.getElementById('task-list');
      if (taskList) {
        taskList.addEventListener('click', function (event) {
          var item = event.target.closest('[data-id]');
          if (!item) { return; }
          var id = item.dataset.id;
          if (event.target.classList.contains('btn-toggle')) {
            toggleTask(id);
          } else if (event.target.classList.contains('btn-delete')) {
            deleteTask(id);
          } else if (event.target.classList.contains('btn-edit')) {
            startEditTask(id);
          } else if (event.target.classList.contains('btn-confirm-edit')) {
            var input = item.querySelector('.edit-input');
            confirmEditTask(id, input ? input.value : '');
          } else if (event.target.classList.contains('btn-cancel-edit')) {
            cancelEditTask(id);
          }
        });
      }
    }

    // Public API
    return {
      generateId:      generateId,
      saveTasks:       saveTasks,
      loadTasks:       loadTasks,
      renderTasks:     renderTasks,
      addTask:         addTask,
      toggleTask:      toggleTask,
      deleteTask:      deleteTask,
      startEditTask:   startEditTask,
      confirmEditTask: confirmEditTask,
      cancelEditTask:  cancelEditTask,
      init:            init
    };

  }()); // end TaskModule

  // ─────────────────────────────────────────────────────────────────────────────
  // LinksModule — quick-link CRUD with localStorage persistence and default seeds
  // Requirements: 4.1, 4.2, 5.6
  // ─────────────────────────────────────────────────────────────────────────────
  var LinksModule = (function () {

    // Private state
    var links = [];

    /**
     * Tracks whether the add-link form is in "add" or "edit" mode.
     * null  → clicking confirm calls addLink()
     * string → clicking confirm calls confirmEditLink(editingLinkId, ...)
     */
    var editingLinkId = null;

    /** Storage key used for all localStorage reads/writes. */
    var STORAGE_KEY = 'dashboard_links';

    /**
     * Link data model:
     * {
     *   id:    string,  // unique identifier
     *   label: string,  // display name
     *   url:   string   // full URL
     * }
     */

    /**
     * Generates a unique string id.
     * Uses crypto.randomUUID() when available; falls back to Date.now() + Math.random().
     * @returns {string}
     */
    function generateId() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return String(Date.now()) + String(Math.random());
    }

    /**
     * Default seed links — used only when the storage key is absent.
     * Each object gets a fresh id at the time loadLinks() builds the array.
     */
    var DEFAULT_SEEDS = [
      { label: 'Google',  url: 'https://www.google.com' },
      { label: 'YouTube', url: 'https://www.youtube.com' },
      { label: 'GitHub',  url: 'https://www.github.com' },
      { label: 'Gmail',   url: 'https://mail.google.com' },
      { label: 'ChatGPT', url: 'https://chat.openai.com' }
    ];

    /**
     * Persists the given links array to localStorage as a JSON string.
     * Silently degrades on any error (e.g. private browsing, quota exceeded).
     * @param {Array} linksArray
     */
    function saveLinks(linksArray) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(linksArray));
      } catch (e) {
        // Silent graceful degradation — app continues without persistence
      }
    }

    /**
     * Reads and parses the links array from localStorage.
     * Returns the five default seeds (each with a fresh generateId()) when:
     *   - the key is absent or null
     *   - JSON.parse throws (corrupt data)
     *   - the parsed value is not an Array
     * @returns {Array}
     */
    function loadLinks() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
          // Key absent — return freshly seeded defaults
          return DEFAULT_SEEDS.map(function (seed) {
            return { id: generateId(), label: seed.label, url: seed.url };
          });
        }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : DEFAULT_SEEDS.map(function (seed) {
          return { id: generateId(), label: seed.label, url: seed.url };
        });
      } catch (e) {
        return DEFAULT_SEEDS.map(function (seed) {
          return { id: generateId(), label: seed.label, url: seed.url };
        });
      }
    }

    // ── Placeholder stubs — to be implemented in Tasks 8.3–8.8 ──────────────

    /**
     * Escapes characters that are unsafe inside HTML text content and attribute values.
     * Prevents XSS when link labels contain <, >, &, or " characters.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /** Re-renders the entire links grid from the private links array. */
    function renderLinks() {
      var grid = document.getElementById('links-grid');
      if (!grid) { return; }

      var html = links.map(function (link) {
        return '<div class="link-item" data-id="' + link.id + '">' +
          '<button class="link-btn">' + escapeHtml(link.label) + '</button>' +
          '<button class="btn-edit-link" aria-label="Edit link">✎</button>' +
          '<button class="btn-delete-link" aria-label="Delete link">✕</button>' +
        '</div>';
      }).join('');

      grid.innerHTML = html;
    }

    /**
     * Opens the given URL in a new tab.
     * @param {string} url
     */
    function openLink(url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    /**
     * Adds a new link with the given label and url.
     * Trims both fields; highlights the offending input and returns early if either is empty.
     * On success: pushes new link, saves, re-renders, hides the form, clears inputs.
     * @param {string} label
     * @param {string} url
     */
    function addLink(label, url) {
      var trimmedLabel = (label || '').trim();
      var trimmedUrl   = (url   || '').trim();

      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');

      if (!trimmedLabel) {
        if (labelInput) {
          labelInput.classList.add('error');
          labelInput.style.borderColor = 'red';
        }
        return;
      }

      if (!trimmedUrl) {
        if (urlInput) {
          urlInput.classList.add('error');
          urlInput.style.borderColor = 'red';
        }
        return;
      }

      var newLink = {
        id:    generateId(),
        label: trimmedLabel,
        url:   trimmedUrl
      };

      links.push(newLink);
      saveLinks(links);
      renderLinks();

      // Hide the form and clear inputs
      var form = document.getElementById('add-link-form');
      if (form) { form.classList.add('hidden'); }
      if (labelInput) { labelInput.value = ''; }
      if (urlInput)   { urlInput.value   = ''; }
    }

    /**
     * Puts the add-link form into edit mode for the link identified by id.
     * Populates #link-label-input and #link-url-input with the existing values,
     * shows the form, sets editingLinkId, and focuses the label input.
     * @param {string} id
     */
    function startEditLink(id) {
      var link = links.find(function (l) { return l.id === id; });
      if (!link) { return; }

      var form       = document.getElementById('add-link-form');
      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');

      // Populate form fields with the existing values
      if (labelInput) {
        labelInput.value = link.label;
        labelInput.classList.remove('error');
        labelInput.style.borderColor = '';
      }
      if (urlInput) {
        urlInput.value = link.url;
        urlInput.classList.remove('error');
        urlInput.style.borderColor = '';
      }

      // Show the form and switch to edit mode
      if (form) { form.classList.remove('hidden'); }
      editingLinkId = id;

      // Focus the label field for immediate editing
      if (labelInput) { labelInput.focus(); }
    }

    /**
     * Saves the edited label and url for the link identified by id.
     * Validates that neither field is empty; highlights offending inputs on failure.
     * On success: updates the record, saves, re-renders, and hides the form.
     * @param {string} id
     * @param {string} label
     * @param {string} url
     */
    function confirmEditLink(id, label, url) {
      var trimmedLabel = (label || '').trim();
      var trimmedUrl   = (url   || '').trim();

      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');

      if (!trimmedLabel) {
        if (labelInput) {
          labelInput.style.borderColor = 'red';
        }
        return;
      }

      if (!trimmedUrl) {
        if (urlInput) {
          urlInput.style.borderColor = 'red';
        }
        return;
      }

      var link = links.find(function (l) { return l.id === id; });
      if (!link) { return; }

      link.label = trimmedLabel;
      link.url   = trimmedUrl;

      saveLinks(links);
      renderLinks();

      // Hide form and clean up
      var form = document.getElementById('add-link-form');
      if (form) { form.classList.add('hidden'); }
      if (labelInput) {
        labelInput.value = '';
        labelInput.style.borderColor = '';
        labelInput.classList.remove('error');
      }
      if (urlInput) {
        urlInput.value = '';
        urlInput.style.borderColor = '';
        urlInput.classList.remove('error');
      }
      editingLinkId = null;
    }

    /**
     * Deletes the link identified by id, then saves and re-renders.
     * @param {string} id
     */
    function deleteLink(id) {
      links = links.filter(function (l) { return l.id !== id; });
      saveLinks(links);
      renderLinks();
    }

    /**
     * Attaches a single delegated click listener on #links-grid that handles
     * open, edit, and delete actions.
     */
    function bindEvents() {
      var linksGrid = document.getElementById('links-grid');
      if (linksGrid) {
        linksGrid.addEventListener('click', function (event) {
          var item = event.target.closest('[data-id]');
          if (!item) { return; }
          var id = item.dataset.id;
          if (event.target.classList.contains('link-btn')) {
            var link = links.find(function (l) { return l.id === id; });
            if (link) { openLink(link.url); }
          } else if (event.target.classList.contains('btn-edit-link')) {
            startEditLink(id);
          } else if (event.target.classList.contains('btn-delete-link')) {
            deleteLink(id);
          }
        });
      }
    }

    /**
     * Bootstraps the Links panel: loads links from storage (or seeds defaults),
     * renders the grid, and binds all event listeners including the add-link form.
     */
    function init() {
      links = loadLinks();
      renderLinks();
      bindEvents();

      var form       = document.getElementById('add-link-form');
      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');

      // ── #btn-add-link: show the form in "add" mode ──────────────────────────
      var btnAddLink = document.getElementById('btn-add-link');
      if (btnAddLink) {
        btnAddLink.addEventListener('click', function () {
          editingLinkId = null;          // add mode

          // Clear any previous error styling
          if (labelInput) {
            labelInput.classList.remove('error');
            labelInput.style.borderColor = '';
            labelInput.value = '';
          }
          if (urlInput) {
            urlInput.classList.remove('error');
            urlInput.style.borderColor = '';
            urlInput.value = '';
          }

          if (form) { form.classList.remove('hidden'); }
        });
      }

      // ── #btn-confirm-link: add or edit depending on editingLinkId ──────────
      var btnConfirmLink = document.getElementById('btn-confirm-link');
      if (btnConfirmLink) {
        btnConfirmLink.addEventListener('click', function () {
          var labelVal = labelInput ? labelInput.value : '';
          var urlVal   = urlInput   ? urlInput.value   : '';

          if (editingLinkId === null) {
            addLink(labelVal, urlVal);
          } else {
            confirmEditLink(editingLinkId, labelVal, urlVal);
          }
        });
      }

      // ── #btn-cancel-link: hide the form and clear inputs ───────────────────
      var btnCancelLink = document.getElementById('btn-cancel-link');
      if (btnCancelLink) {
        btnCancelLink.addEventListener('click', function () {
          if (form) { form.classList.add('hidden'); }
          if (labelInput) {
            labelInput.value = '';
            labelInput.classList.remove('error');
            labelInput.style.borderColor = '';
          }
          if (urlInput) {
            urlInput.value = '';
            urlInput.classList.remove('error');
            urlInput.style.borderColor = '';
          }
          editingLinkId = null;
        });
      }
    }

    // Public API
    return {
      generateId: generateId,
      saveLinks:  saveLinks,
      loadLinks:  loadLinks,
      renderLinks:     renderLinks,
      openLink:        openLink,
      addLink:         addLink,
      startEditLink:   startEditLink,
      confirmEditLink: confirmEditLink,
      deleteLink:      deleteLink,
      bindEvents:      bindEvents,
      /** Allows startEditLink (Task 8.6) to put the form into edit mode. */
      setEditingLinkId: function (id) { editingLinkId = id; },
      init:            init
    };

  }()); // end LinksModule

  // ─────────────────────────────────────────────────────────────────────────────
  // Entry point — initialise all modules after the DOM is ready
  // ─────────────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    GreetingModule.init();
    TimerModule.init();
    TaskModule.init();
    LinksModule.init();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test hook — expose pure functions for property-based tests.
  // Only attached when running in the test harness (tests/index.html).
  // ─────────────────────────────────────────────────────────────────────────────
  window._test = {
    formatTime:  GreetingModule.formatTime,
    formatDate:  GreetingModule.formatDate,
    getGreeting: GreetingModule.getGreeting,
    TimerModule: TimerModule
  };

})();
