/* ===================================================================
   To-Do List Life Dashboard — script.js
   Step 3: Greeting section
     - Real-time clock (time + date, updates every second)
     - Time-of-day greeting (Good Morning / Afternoon / Evening / Night)
     - Challenge 2: editable custom name, persisted via localStorage
   Step 4: Focus Timer
     - 25-minute countdown with Start / Stop / Reset
     - Drift-free timing using a wall-clock end timestamp
   Step 5: To-Do List
     - Add / edit (double-click) / toggle-done / delete tasks
     - All tasks persisted to localStorage (TC-2)
     - Challenge 3: block exact duplicate tasks with an inline error
   Step 6: Quick Links
     - Add links (name + URL) that open in a new tab; delete links
     - All links persisted to localStorage; defaults seeded on first run
   =================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initGreeting();
    initFocusTimer();
    initTodoList();
    initQuickLinks();
    // Note: Light/Dark mode toggle (Challenge 1) is not yet wired up.
  });

  /* -----------------------------------------------------------------
     Greeting section
     ----------------------------------------------------------------- */
  function initGreeting() {
    var greetingHeading = document.getElementById("greeting-heading");
    var timeEl = document.getElementById("current-time");
    var dateEl = document.getElementById("current-date");
    if (!greetingHeading || !timeEl || !dateEl) return;

    var STORAGE_KEY = "dashboard.userName";
    var DEFAULT_NAME = "Friend";

    // Build the editable greeting inside the existing <h2>:
    //   "Good Morning, Friend!" — the word updates with the clock,
    //   the name span is contenteditable and persisted to localStorage.
    greetingHeading.innerHTML =
      '<span id="greeting-word">Hello</span>, <span id="user-name" ' +
      'class="user-name" contenteditable="true" spellcheck="false" ' +
      'title="Click to edit your name">' + DEFAULT_NAME + "</span>!";

    var wordEl = document.getElementById("greeting-word");
    var nameEl = document.getElementById("user-name");

    // Inline affordance styles so this step is self-contained in script.js.
    injectNameStyles();

    // Restore the saved name (Challenge 2)
    var savedName = localStorage.getItem(STORAGE_KEY);
    if (savedName) {
      nameEl.textContent = savedName;
    }

    // --- Real-time clock + greeting ---
    updateClock();
    setInterval(updateClock, 1000);

    function updateClock() {
      var now = new Date();
      timeEl.textContent = formatTime(now);
      dateEl.textContent = formatDate(now);
      wordEl.textContent = getGreetingWord(now);
    }

    // --- Editable name handlers (Challenge 2) ---

    // Select all text on focus so typing replaces the name easily.
    nameEl.addEventListener("focus", function () {
      var range = document.createRange();
      range.selectNodeContents(nameEl);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });

    // Pressing Enter commits the edit (prevents line breaks).
    nameEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        nameEl.blur();
      }
    });

    // Persist on blur; fall back to the default if left empty.
    nameEl.addEventListener("blur", function () {
      var value = nameEl.textContent.replace(/\s+/g, " ").trim();
      if (!value) {
        nameEl.textContent = DEFAULT_NAME;
        localStorage.removeItem(STORAGE_KEY);
      } else {
        nameEl.textContent = value; // normalize + strips any pasted HTML
        localStorage.setItem(STORAGE_KEY, value);
      }
    });
  }

  /* -----------------------------------------------------------------
     Helpers
     ----------------------------------------------------------------- */

  // 12-hour clock with seconds, e.g. "10:05:09 PM"
  function formatTime(now) {
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 -> 12
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };
    return h + ":" + pad(m) + ":" + pad(s) + " " + ampm;
  }

  // Long form date using the visitor's locale, e.g. "Thursday, October 22, 2026"
  function formatDate(now) {
    return now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Pick a greeting based on the hour of day
  function getGreetingWord(now) {
    var h = now.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    if (h < 21) return "Good Evening";
    return "Good Night";
  }

  // Dashed-underline affordance so the name looks clickable/editable.
  // White tones are used because the greeting card always has white text.
  function injectNameStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".user-name {",
      "  cursor: text; outline: none; padding: 0 2px;",
      "  border-bottom: 2px dashed rgba(255, 255, 255, 0.45);",
      "  transition: border-color 0.2s ease;",
      "}",
      ".user-name:hover { border-bottom-color: rgba(255, 255, 255, 0.85); }",
      ".user-name:focus { border-bottom: 2px solid #ffffff; }",
    ].join("\n");
    document.head.appendChild(style);
  }

  /* -----------------------------------------------------------------
     Focus Timer section
     ----------------------------------------------------------------- */
  function initFocusTimer() {
    var displayEl = document.getElementById("timer-display");
    var startBtn = document.getElementById("timer-start");
    var stopBtn = document.getElementById("timer-stop");
    var resetBtn = document.getElementById("timer-reset");
    var statusEl = document.getElementById("timer-status");
    if (!displayEl || !startBtn || !stopBtn || !resetBtn || !statusEl) return;

    var DURATION = 25 * 60; // 25 minutes, in seconds
    var remaining = DURATION;
    var intervalId = null;
    var endTime = null; // wall-clock time at which the timer hits zero

    startBtn.addEventListener("click", startTimer);
    stopBtn.addEventListener("click", stopTimer);
    resetBtn.addEventListener("click", resetTimer);

    updateDisplay(); // show 25:00 right away

    function startTimer() {
      if (intervalId !== null) return; // already running
      if (remaining <= 0) remaining = DURATION; // restart after finishing
      endTime = Date.now() + remaining * 1000;
      intervalId = setInterval(tick, 1000);
      tick(); // paint immediately instead of waiting a second
      setStatus("Focusing…");
    }

    function tick() {
      remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      updateDisplay();
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        setStatus("Time's up! Great work — take a break.");
      }
    }

    function stopTimer() {
      if (intervalId === null) return; // nothing running to stop
      clearInterval(intervalId);
      intervalId = null;
      // freeze the exact remaining time at the moment we stopped
      remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      updateDisplay();
      setStatus("Paused");
    }

    function resetTimer() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      remaining = DURATION;
      updateDisplay();
      setStatus("Ready to focus");
    }

    function updateDisplay() {
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      displayEl.textContent = pad(m) + ":" + pad(s);
    }

    function setStatus(text) {
      statusEl.textContent = text;
    }

    function pad(n) {
      return String(n).padStart(2, "0");
    }
  }

  /* -----------------------------------------------------------------
     To-Do List section
     ----------------------------------------------------------------- */
  function initTodoList() {
    var form = document.getElementById("todo-form");
    var input = document.getElementById("todo-input");
    var ulEl = document.getElementById("todo-items");
    var emptyEl = document.getElementById("todo-empty");
    if (!form || !input || !ulEl || !emptyEl) return;

    var STORAGE_KEY = "dashboard.tasks";
    var tasks = loadTasks();
    var errorTimer = null;

    // Inline error message (Challenge 3) + its affordance styles.
    injectTodoStyles();
    var errorEl = document.createElement("p");
    errorEl.id = "todo-error";
    errorEl.className = "todo-error";
    errorEl.setAttribute("role", "alert");
    form.parentNode.insertBefore(errorEl, form.nextSibling);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (addTask(input.value)) {
        input.value = "";
      }
      input.focus();
    });

    renderTasks();

    // --- Mutations ---

    function addTask(text) {
      var value = normalize(text);
      if (!value) {
        showError("Please enter a task first.");
        return false;
      }
      if (isDuplicate(value)) {
        showError("That task is already on your list.");
        return false;
      }
      tasks.push({ id: makeId(), text: value, done: false });
      saveTasks();
      renderTasks();
      return true;
    }

    function toggleDone(id) {
      var task = findTask(id);
      if (!task) return;
      task.done = !task.done;
      saveTasks();
      renderTasks();
    }

    function deleteTask(id) {
      tasks = tasks.filter(function (t) {
        return t.id !== id;
      });
      saveTasks();
      renderTasks();
    }

    function beginEdit(span, task) {
      var original = task.text;
      span.setAttribute("contenteditable", "true");
      span.focus();
      selectAll(span);

      span.addEventListener("keydown", onKey);
      span.addEventListener("blur", onBlur);

      function finish(value) {
        span.removeEventListener("keydown", onKey);
        span.removeEventListener("blur", onBlur);
        span.removeAttribute("contenteditable");
        span.textContent = value;
      }

      function onKey(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          span.blur(); // commit via onBlur
        } else if (e.key === "Escape") {
          e.preventDefault();
          finish(original); // discard changes
        }
      }

      function onBlur() {
        var value = normalize(span.textContent);
        if (!value) {
          finish(original);
          showError("Task can't be empty — keeping the original.");
          return;
        }
        if (value === original) {
          finish(original);
          return;
        }
        if (isDuplicate(value, task.id)) {
          finish(original);
          showError("That task already exists.");
          return;
        }
        task.text = value;
        saveTasks();
        finish(value);
      }
    }

    // --- Rendering ---
    // Built with the DOM API (not innerHTML) so task text can never
    // inject HTML — only plain text is ever inserted.
    function renderTasks() {
      ulEl.innerHTML = "";
      tasks.forEach(function (task) {
        var li = document.createElement("li");
        li.className = "todo-item" + (task.done ? " completed" : "");
        li.dataset.id = task.id;

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", function () {
          toggleDone(task.id);
        });

        var span = document.createElement("span");
        span.className = "todo-text";
        span.textContent = task.text;
        span.title = "Double-click to edit";
        span.addEventListener("dblclick", function () {
          beginEdit(span, task);
        });

        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "todo-delete";
        delBtn.setAttribute("aria-label", "Delete task");
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", function () {
          deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        ulEl.appendChild(li);
      });

      emptyEl.hidden = tasks.length > 0;
    }

    // --- Persistence (TC-2) ---

    function saveTasks() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function loadTasks() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return []; // corrupt data -> start fresh
      }
    }

    // --- Helpers ---

    function findTask(id) {
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) return tasks[i];
      }
      return null;
    }

    // Exact (case-sensitive) duplicate check on trimmed text.
    // excludeId lets editing a task ignore itself.
    function isDuplicate(value, excludeId) {
      return tasks.some(function (t) {
        return t.id !== excludeId && t.text === value;
      });
    }

    function normalize(text) {
      return (text || "").replace(/\s+/g, " ").trim();
    }

    function makeId() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function selectAll(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add("show");
      if (errorTimer) clearTimeout(errorTimer);
      errorTimer = setTimeout(function () {
        errorEl.classList.remove("show");
      }, 3000);
    }

    function injectTodoStyles() {
      var style = document.createElement("style");
      style.textContent = [
        ".todo-error {",
        "  color: var(--danger);",
        "  font-size: 0.85rem;",
        "  min-height: 1.25rem;",
        "  margin-top: 0.5rem;",
        "  opacity: 0;",
        "  transition: opacity 0.2s ease;",
        "}",
        ".todo-error.show { opacity: 1; }",
      ].join("\n");
      document.head.appendChild(style);
    }
  }

  /* -----------------------------------------------------------------
     Quick Links section
     ----------------------------------------------------------------- */
  function initQuickLinks() {
    var form = document.getElementById("link-form");
    var nameInput = document.getElementById("link-name");
    var urlInput = document.getElementById("link-url");
    var listEl = document.getElementById("links-list");
    var emptyEl = document.getElementById("links-empty");
    if (!form || !nameInput || !urlInput || !listEl || !emptyEl) return;

    var STORAGE_KEY = "dashboard.quickLinks";
    var links = loadLinks();
    var errorTimer = null;

    // Inline error message (invalid name/URL, bad scheme, etc.)
    var errorEl = document.createElement("p");
    errorEl.id = "link-error";
    errorEl.className = "link-error";
    errorEl.setAttribute("role", "alert");
    form.parentNode.insertBefore(errorEl, form.nextSibling);

    // Persist right away so the seeded defaults survive a reload
    // even before the user makes their first change.
    saveLinks();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (addLink(nameInput.value, urlInput.value)) {
        nameInput.value = "";
        urlInput.value = "";
      }
      nameInput.focus();
    });

    renderLinks();

    // --- Mutations ---

    function addLink(name, url) {
      name = (name || "").trim();
      url = normalizeUrl(url);
      if (!name) {
        showError("Please enter a link name.");
        return false;
      }
      if (!url) {
        showError("Please enter a valid URL (http/https only).");
        return false;
      }
      links.push({ id: makeLinkId(), name: name, url: url });
      saveLinks();
      renderLinks();
      return true;
    }

    function deleteLink(id) {
      links = links.filter(function (l) {
        return l.id !== id;
      });
      saveLinks();
      renderLinks();
    }

    // --- Rendering ---
    // Each link is a real <a target="_blank"> styled as a button, so
    // native new-tab behaviour, middle-click and right-click all work.
    // Built with the DOM API so link names can never inject HTML.
    function renderLinks() {
      listEl.innerHTML = "";
      links.forEach(function (link) {
        var li = document.createElement("li");
        li.className = "link-item";
        li.dataset.id = link.id;

        var a = document.createElement("a");
        a.className = "quick-link";
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = link.name;

        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "link-delete";
        delBtn.setAttribute("aria-label", "Delete " + link.name);
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", function () {
          deleteLink(link.id);
        });

        li.appendChild(a);
        li.appendChild(delBtn);
        listEl.appendChild(li);
      });

      emptyEl.hidden = links.length > 0;
    }

    // --- Persistence ---

    function saveLinks() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      } catch (e) {
        /* ignore quota / private-mode errors */
      }
    }

    function loadLinks() {
      var raw;
      try {
        raw = localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return defaultLinks();
      }
      if (raw === null) {
        return defaultLinks(); // first visit -> sensible defaults
      }
      try {
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    // --- Helpers ---

    function defaultLinks() {
      return [
        { id: makeLinkId(), name: "Google", url: "https://www.google.com" },
        { id: makeLinkId(), name: "Gmail", url: "https://mail.google.com" },
        { id: makeLinkId(), name: "GitHub", url: "https://github.com" },
        { id: makeLinkId(), name: "YouTube", url: "https://www.youtube.com" },
        { id: makeLinkId(), name: "Notion", url: "https://www.notion.so" },
        { id: makeLinkId(), name: "Calendar", url: "https://calendar.google.com" },
      ];
    }

    // Bare domains like "google.com" get "https://" prepended.
    // Non-http(s) schemes (e.g. javascript:) are rejected for safety.
    function normalizeUrl(url) {
      url = (url || "").trim();
      if (!url) return "";
      if (!/^[a-z][a-z0-9+.\-]*:\/\//i.test(url)) {
        url = "https://" + url;
      }
      if (!/^https?:\/\//i.test(url)) {
        return "";
      }
      return url;
    }

    function makeLinkId() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add("show");
      if (errorTimer) clearTimeout(errorTimer);
      errorTimer = setTimeout(function () {
        errorEl.classList.remove("show");
      }, 3000);
    }
  }
})();
