/* ============================================================
   MeetIntel — script.js
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

  let analysisProgressInterval = null;

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
    const progressSpan = analyzeBtn.querySelector(".progress-percent");
    const progressFill = document.getElementById("btn-progress-fill");
    
    analyzeBtn.disabled = loading;
    btnText.hidden = loading;
    btnSpinner.hidden = !loading;

    if (loading) {
      analyzeBtn.classList.add("is-loading");
      let progress = 0;
      if (progressSpan) progressSpan.textContent = ` 0%`;
      if (progressFill) progressFill.style.width = `0%`;
      
      // Clear any existing interval
      if (analysisProgressInterval) clearInterval(analysisProgressInterval);
      
      // Simulate progress up to 90%
      analysisProgressInterval = setInterval(() => {
        if (progress < 90) {
          // Faster at start, slower as it gets higher
          const inc = progress < 50 ? 5 : (progress < 80 ? 2 : 1);
          progress += inc;
          if (progress > 90) progress = 90;
          if (progressSpan) progressSpan.textContent = ` ${progress}%`;
          if (progressFill) progressFill.style.width = `${progress}%`;
        }
      }, 400);
    } else {
      if (analysisProgressInterval) {
        clearInterval(analysisProgressInterval);
        analysisProgressInterval = null;
      }
      analyzeBtn.classList.remove("is-loading");
      if (progressFill) progressFill.style.width = `0%`;
    }
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
    window.location.href = "/";
    return;
  }

  const data = JSON.parse(raw);
  window.currentAnalysis = data; // Store globally for modal access
  renderDashboard(data);

  if (vizHTML) {
    const frame = document.getElementById("viz-frame");
    frame.srcdoc = vizHTML;
  }

  const badge = document.getElementById("entity-count-badge");
  if (badge && data.total_entities !== undefined) {
    badge.textContent = `${data.total_entities} entities`;
  }

  // --- New Logic: Integrated Summarize & Email ---
  const emailBtn = document.getElementById("email-speakers-btn");

  emailBtn.addEventListener("click", handleEmailBtnClick);

  // Modal events
  document.getElementById("close-modal").addEventListener("click", closeEmailModal);
  document.getElementById("email-form").addEventListener("submit", handleSendEmails);
  document.getElementById("email-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "email-modal-overlay") closeEmailModal();
  });
}

let summarizationProgressBarInterval = null;

async function handleEmailBtnClick() {
  const emailBtn = document.getElementById("email-speakers-btn");
  const progressBar = document.getElementById("email-btn-progress");
  const textSpan = emailBtn.querySelector(".btn-text");

  // Case 1: Already summarized
  if (sessionStorage.getItem("isSummarized")) {
    openEmailModal();
    return;
  }

  // Case 2: Start background summarization
  emailBtn.disabled = true;
  emailBtn.classList.add("is-summarizing");
  textSpan.textContent = "✨ Preparing summaries...";
  
  let progress = 0;
  if (progressBar) progressBar.style.width = "0%";

  // Start simulated progress
  summarizationProgressBarInterval = setInterval(() => {
    if (progress < 90) {
      // Faster at start, slower at end
      const inc = progress < 40 ? 5 : (progress < 75 ? 2 : 1);
      progress += inc;
      if (progress > 90) progress = 90;
      if (progressBar) progressBar.style.width = `${progress}%`;
    }
  }, 400);

  try {
    const response = await fetch("/summarize", { method: "POST" });
    const result = await response.json();

    if (result.success) {
      // Complete the progress bar
      if (summarizationProgressBarInterval) clearInterval(summarizationProgressBarInterval);
      if (progressBar) progressBar.style.width = "100%";
      textSpan.textContent = "✨ Success!";

      // Small delay for smooth transition
      setTimeout(() => {
        sessionStorage.setItem("isSummarized", "true");
        emailBtn.classList.remove("is-summarizing");
        emailBtn.disabled = false;
        textSpan.textContent = "Email Speakers";
        if (progressBar) progressBar.style.width = "0%";
        
        openEmailModal();
      }, 500);

    } else {
      throw new Error(result.error || "Summarization failed");
    }
    
  } catch (err) {
    if (summarizationProgressBarInterval) clearInterval(summarizationProgressBarInterval);
    showToast("Error: " + err.message);
    
    // Reset button
    emailBtn.classList.remove("is-summarizing");
    emailBtn.disabled = false;
    textSpan.textContent = "Email Speakers";
    if (progressBar) progressBar.style.width = "0%";
  }
}

function openEmailModal() {
  const overlay = document.getElementById("email-modal-overlay");
  const list = document.getElementById("speaker-emails-list");
  const speakers = window.currentAnalysis.speakers || [];

  list.innerHTML = speakers.map(s => `
    <div class="email-row">
      <label>${escHtml(s.name)} (${escHtml(s.role)})</label>
      <input type="email" class="email-input" data-speaker="${escHtml(s.name)}" placeholder="Enter Email-ID">
    </div>
  `).join("");

  overlay.classList.add("show");

  // Add validation listeners
  const inputs = list.querySelectorAll(".email-input");
  inputs.forEach(input => {
    input.addEventListener("input", validateEmailForm);
  });

  validateEmailForm();
}

function closeEmailModal() {
  document.getElementById("email-modal-overlay").classList.remove("show");
}

function validateEmailForm() {
  const inputs = document.querySelectorAll(".email-input");
  const submitBtn = document.getElementById("send-emails-submit");
  let atLeastOne = false;

  inputs.forEach(input => {
    if (input.value.trim() !== "") {
      if (input.checkValidity()) {
        atLeastOne = true;
        input.classList.remove("error");
      } else {
        input.classList.add("error");
      }
    } else {
      input.classList.remove("error");
    }
  });

  submitBtn.disabled = !atLeastOne;
}

async function handleSendEmails(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("send-emails-submit");
  const inputs = document.querySelectorAll(".email-input");
  const recipients = {};

  inputs.forEach(input => {
    const email = input.value.trim();
    if (email && input.checkValidity()) {
      recipients[input.dataset.speaker] = email;
    }
  });

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch("/send-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients })
    });
    const result = await response.json();

    if (result.success) {
      showToast("Email sent successfully!");
      closeEmailModal();
    } else {
      showToast("Error: " + result.error);
    }
  } catch (err) {
    showToast("Network error. Could not send emails.");
  } finally {
    submitBtn.textContent = 'Send';
    submitBtn.disabled = false;
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 4000);
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
  const externalMoreBtn = document.getElementById("topics-more-btn");
  if (externalMoreBtn) externalMoreBtn.remove(); // Clean up old static button

  if (!wrap) return;

  if (!topics.length) {
    wrap.innerHTML = '<p class="empty-state">No key topics identified!</p>';
    return;
  }

  wrap.dataset.allTopics = JSON.stringify(topics);
  wrap.dataset.expanded = "false";
  renderTopicsFlow();
}

function renderTopicsFlow() {
  const wrap = document.getElementById("topics-wrap");
  if (!wrap) return;
  const topics = JSON.parse(wrap.dataset.allTopics || "[]");
  const isExpanded = wrap.dataset.expanded === "true";

  wrap.innerHTML = ""; // clear

  if (isExpanded) {
    // Render all
    wrap.innerHTML = topics.map(t => {
      const cls = t.importance === "high" ? "topic-chip high" : "topic-chip";
      return `<span class="${cls}">${escHtml(t.text)}</span>`;
    }).join("");

    // Check if we actually need a less button
    const btn = document.createElement("button");
    btn.className = "topics-more-btn inline";
    btn.textContent = "...less";
    btn.onclick = () => { wrap.dataset.expanded = "false"; renderTopicsFlow(); };
    wrap.appendChild(btn);
    return;
  }

  // Determine if it fits in 2 rows, inserting the inline "...more" button
  const btn = document.createElement("button");
  btn.className = "topics-more-btn inline";
  btn.textContent = "...more";
  btn.onclick = () => { wrap.dataset.expanded = "true"; renderTopicsFlow(); };

  let firstTop = -1;
  let rowCount = 1;
  let currentTop = -1;

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    const span = document.createElement("span");
    const cls = t.importance === "high" ? "topic-chip high" : "topic-chip";
    span.className = cls;
    span.textContent = t.text;
    wrap.appendChild(span);

    // Add button to check layout footprint
    wrap.appendChild(btn);

    if (firstTop === -1) {
      firstTop = span.offsetTop;
      currentTop = firstTop;
    }

    let spanTop = span.offsetTop;
    if (spanTop > currentTop + 5) {
      rowCount++;
      currentTop = spanTop;
    }

    let btnTop = btn.offsetTop;
    let expectedBtnRow = rowCount;
    if (btnTop > currentTop + 5) {
      expectedBtnRow = rowCount + 1;
    }

    if (expectedBtnRow > 2) {
      // Span plus button overflowed to the 3rd row. 
      span.remove(); // The span won't fit if we need the more button.
      break;
    }

    if (i === topics.length - 1) {
      // Everything fit! No button needed.
      btn.remove();
    } else {
      btn.remove(); // Remove btn so next iteration can append it properly at the end
    }
  }
}

// Window resize listener to reflow truncated items
window.addEventListener("resize", () => {
  const wrap = document.getElementById("topics-wrap");
  if (wrap && wrap.dataset.allTopics && wrap.dataset.expanded === "false") {
    clearTimeout(wrap.resizeTimer);
    wrap.resizeTimer = setTimeout(() => renderTopicsFlow(), 100);
  }
});


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
