/* ============================================================
   TranscriptMind — script.js
   Handles: tabs, file drop, form submit, results rendering
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ---- INDEX PAGE ----
  const form = document.getElementById("analyze-form");
  if (form) {
    initIndexPage();
  }

  // ---- RESULTS PAGE ----
  const dashboard = document.getElementById("dashboard");
  if (dashboard) {
    initResultsPage();
  }
});


// ============================================================
// INDEX PAGE
// ============================================================

function initIndexPage() {
  // Tab switching
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // Char counter
  const textarea = document.getElementById("transcript-text");
  const charCount = document.getElementById("char-count");
  if (textarea) {
    textarea.addEventListener("input", () => {
      charCount.textContent = textarea.value.length.toLocaleString();
    });
  }

  // File drop zone
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileSelected = document.getElementById("file-selected");

  if (dropZone) {
    dropZone.addEventListener("dragover", e => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if (file) setFile(file);
    });
    dropZone.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) setFile(fileInput.files[0]);
    });
  }

  function setFile(file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileSelected.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }

  // Form submission
  const analyzeForm = document.getElementById("analyze-form");
  const analyzeBtn = document.getElementById("analyze-btn");
  const errorBox = document.getElementById("error-box");

  analyzeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Determine active tab
    const activeTab = document.querySelector(".tab.active").dataset.tab;

    const formData = new FormData();
    if (activeTab === "paste") {
      const text = document.getElementById("transcript-text").value.trim();
      if (!text) { showError("Please paste some transcript text first."); return; }
      formData.append("transcript_text", text);
    } else {
      const file = fileInput.files[0];
      if (!file) { showError("Please select a .txt file to upload."); return; }
      formData.append("file", file);
    }

    // Show loading state
    setLoading(true);
    hideError();

    try {
      const response = await fetch("/analyze", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok || result.error) {
        showError(result.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Store results in sessionStorage and redirect
      sessionStorage.setItem("analysisData", JSON.stringify(result.data));
      sessionStorage.setItem("vizHTML", result.visualization_html || "");
      window.location.href = "/results";

    } catch (err) {
      showError("Network error. Is the server running?");
      setLoading(false);
    }
  });

  function setLoading(loading) {
    const btnText = analyzeBtn.querySelector(".btn-text");
    const btnSpinner = analyzeBtn.querySelector(".btn-spinner");
    analyzeBtn.disabled = loading;
    btnText.hidden = loading;
    btnSpinner.hidden = !loading;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
  }
}


// ============================================================
// RESULTS PAGE — Flask route serves this page,
// data arrives via sessionStorage from the index page fetch
// ============================================================

function initResultsPage() {
  const raw = sessionStorage.getItem("analysisData");
  const vizHTML = sessionStorage.getItem("vizHTML");

  if (!raw) {
    // If someone lands here directly without data, redirect home
    window.location.href = "/";
    return;
  }

  const data = JSON.parse(raw);
  renderDashboard(data);

  if (vizHTML) {
    const frame = document.getElementById("viz-frame");
    frame.srcdoc = vizHTML;
  }

  // Entity count badge
  const badge = document.getElementById("entity-count-badge");
  if (badge && data.total_entities !== undefined) {
    badge.textContent = `${data.total_entities} entities`;
  }
}


function renderDashboard(data) {
  renderSpeakers(data.speakers || []);
  renderTopics(data.topics || []);
  renderDecisions(data.decisions || []);
  renderActionItems(data.action_items || []);
}


function renderSpeakers(speakers) {
  const grid = document.getElementById("speakers-grid");
  if (!grid) return;

  if (!speakers.length) {
    grid.innerHTML = '<p class="empty-state">No speakers identified.</p>';
    return;
  }

  grid.innerHTML = speakers.map(s => `
    <div class="speaker-card">
      <div class="speaker-name">${escHtml(s.name)}</div>
      <div class="speaker-role">${escHtml(s.role || "participant")}</div>
      <div class="speaker-count">${s.mention_count || 0} mention${s.mention_count !== 1 ? "s" : ""}</div>
    </div>
  `).join("");
}


function renderTopics(topics) {
  const wrap = document.getElementById("topics-wrap");
  if (!wrap) return;

  if (!topics.length) {
    wrap.innerHTML = '<p class="empty-state">No key topics identified!</p>';
    return;
  }

  wrap.innerHTML = topics.map(t => {
    const cls = t.importance === "high" ? "topic-chip high" : "topic-chip";
    return `<span class="${cls}">${escHtml(t.text)}</span>`;
  }).join("");
}


function renderDecisions(decisions) {
  const list = document.getElementById("decision-list");
  if (!list) return;

  if (!decisions.length) {
    list.innerHTML = '<p class="empty-state">No decisions recorded.</p>';
    return;
  }

  list.innerHTML = decisions.map(d => {
    const meta = [
      d.made_by && d.made_by !== "unknown" ? `by ${escHtml(d.made_by)}` : "",
      d.context ? escHtml(d.context) : ""
    ].filter(Boolean).join(" · ");

    return `
      <div class="decision-item">
        <div class="decision-text">"${escHtml(d.text)}"</div>
        ${meta ? `<div class="decision-meta">${meta}</div>` : ""}
      </div>
    `;
  }).join("");
}


function renderActionItems(items) {
  const tbody = document.getElementById("action-tbody");
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state" style="padding:1rem">No action items identified.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(a.text)}</td>
      <td><span class="owner-tag">${escHtml(a.owner || "unassigned")}</span></td>
      <td><span class="deadline-tag">${escHtml(a.deadline || "not specified")}</span></td>
    </tr>
  `).join("");
}


// ============================================================
// UTILS
// ============================================================

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
