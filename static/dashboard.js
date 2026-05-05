/* ============================================================
   MeetIntel — dashboard.js
   Handles: sidebar meetings, center analysis, pending actions
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});


// ============================================================
// DUMMY DATA
// ============================================================

const DUMMY_MEETINGS = {
  hosted: [
    {
      id: "h1",
      title: "Q3 Product Roadmap Review",
      date: "2026-04-28",
      platform: "Google Meet",
      attendee_count: 6,
      duration_seconds: 2700,
      is_important: true,
      role: "host",
      analysis: {
        speakers: [
          { name: "Sarah", role: "Product Lead", mention_count: 8 },
          { name: "James", role: "Engineering Manager", mention_count: 5 },
          { name: "Priya", role: "Designer", mention_count: 3 }
        ],
        topics: [
          { text: "Q3 launch timeline", importance: "high" },
          { text: "Mobile redesign", importance: "high" },
          { text: "API deprecation", importance: "medium" },
          { text: "User onboarding", importance: "high" },
          { text: "Budget allocation", importance: "medium" }
        ],
        decisions: [
          { text: "Move the launch to Q3 to give more runway.", made_by: "Sarah", context: "timeline" },
          { text: "Deprecate v1 API by end of July.", made_by: "James", context: "engineering" }
        ],
        action_items: [
          { text: "Send updated roadmap by Friday", owner: "Sarah", deadline: "Friday" },
          { text: "Draft mobile redesign spec", owner: "Priya", deadline: "May 10" },
          { text: "Set up v2 API migration guide", owner: "James", deadline: "May 15" }
        ],
        visualization_html: "",
        total_entities: 18
      }
    },
    {
      id: "h2",
      title: "Sprint 14 Retrospective",
      date: "2026-04-25",
      platform: "Zoom",
      attendee_count: 4,
      duration_seconds: 1800,
      is_important: false,
      role: "host",
      analysis: {
        speakers: [
          { name: "Het", role: "Scrum Master", mention_count: 6 },
          { name: "Alicia", role: "Developer", mention_count: 4 }
        ],
        topics: [
          { text: "Sprint velocity", importance: "high" },
          { text: "CI/CD pipeline issues", importance: "medium" },
          { text: "Code review bottleneck", importance: "high" }
        ],
        decisions: [
          { text: "Implement pair-review system starting Sprint 15.", made_by: "Het", context: "process" }
        ],
        action_items: [
          { text: "Fix flaky CI tests in auth module", owner: "Alicia", deadline: "Next sprint" },
          { text: "Document pair-review workflow", owner: "Het", deadline: "May 5" }
        ],
        visualization_html: "",
        total_entities: 11
      }
    },
    {
      id: "h3",
      title: "Design System Sync",
      date: "2026-04-20",
      platform: "Google Meet",
      attendee_count: 3,
      duration_seconds: 2100,
      is_important: false,
      role: "host",
      analysis: {
        speakers: [
          { name: "Priya", role: "Lead Designer", mention_count: 7 },
          { name: "Marco", role: "Frontend Dev", mention_count: 4 }
        ],
        topics: [
          { text: "Component library v2", importance: "high" },
          { text: "Dark mode tokens", importance: "medium" },
          { text: "Accessibility audit", importance: "high" }
        ],
        decisions: [
          { text: "Adopt Radix primitives for accessible components.", made_by: "Priya", context: "tooling" }
        ],
        action_items: [
          { text: "Create color token mapping for dark mode", owner: "Priya", deadline: "May 8" },
          { text: "Audit all buttons for WCAG AA contrast", owner: "Marco", deadline: "May 12" }
        ],
        visualization_html: "",
        total_entities: 12
      }
    }
  ],
  attended: [
    {
      id: "a1",
      title: "Company All-Hands — May",
      date: "2026-04-30",
      platform: "Microsoft Teams",
      attendee_count: 45,
      duration_seconds: 3600,
      is_important: true,
      role: "attendee",
      analysis: {
        speakers: [
          { name: "CEO Maya", role: "CEO", mention_count: 12 },
          { name: "CFO Daniel", role: "CFO", mention_count: 6 },
          { name: "VP Eng Raj", role: "VP Engineering", mention_count: 4 }
        ],
        topics: [
          { text: "Q2 revenue targets", importance: "high" },
          { text: "Hiring freeze update", importance: "high" },
          { text: "Office relocation", importance: "medium" },
          { text: "New product vertical", importance: "high" }
        ],
        decisions: [
          { text: "Hiring freeze lifted for engineering only.", made_by: "CEO Maya", context: "headcount" },
          { text: "Office move pushed to September.", made_by: "CFO Daniel", context: "facilities" }
        ],
        action_items: [
          { text: "Submit Q2 budget revisions", owner: "CFO Daniel", deadline: "May 3" },
          { text: "Share new product vertical brief with all teams", owner: "CEO Maya", deadline: "May 7" }
        ],
        visualization_html: "",
        total_entities: 22
      }
    },
    {
      id: "a2",
      title: "Client Onboarding: Acme Corp",
      date: "2026-04-22",
      platform: "Zoom",
      attendee_count: 5,
      duration_seconds: 2400,
      is_important: false,
      role: "attendee",
      analysis: {
        speakers: [
          { name: "Lisa (Acme)", role: "Project Manager", mention_count: 5 },
          { name: "Het", role: "Technical Lead", mention_count: 4 },
          { name: "Tom (Acme)", role: "CTO", mention_count: 3 }
        ],
        topics: [
          { text: "Data migration plan", importance: "high" },
          { text: "SSO integration", importance: "high" },
          { text: "SLA requirements", importance: "medium" }
        ],
        decisions: [
          { text: "Use incremental migration over 3 weekends.", made_by: "Het", context: "migration" }
        ],
        action_items: [
          { text: "Prepare staging environment for Acme", owner: "Het", deadline: "May 6" },
          { text: "Send SSO config docs to Acme IT", owner: "Het", deadline: "May 4" },
          { text: "Sign SLA agreement", owner: "Lisa (Acme)", deadline: "May 10" }
        ],
        visualization_html: "",
        total_entities: 14
      }
    }
  ]
};


// ============================================================
// INITIALIZATION
// ============================================================

let allMeetings = [];
let activeMeetingId = null;
let pendingDeleteId = null; // Track meeting to be deleted

function initDashboard() {
  // Flatten for easy lookup
  allMeetings = [
    ...DUMMY_MEETINGS.hosted.map(m => ({ ...m, section: "hosted" })),
    ...DUMMY_MEETINGS.attended.map(m => ({ ...m, section: "attended" }))
  ];

  renderSidebar();
  renderPendingActions();

  // Info modal close
  document.getElementById("close-info-modal").addEventListener("click", () => {
    document.getElementById("info-modal-overlay").classList.remove("show");
  });
  document.getElementById("info-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "info-modal-overlay") {
      document.getElementById("info-modal-overlay").classList.remove("show");
    }
  });

  // Delete modal listeners
  document.getElementById("close-delete-modal").addEventListener("click", closeDeleteModal);
  document.getElementById("cancel-delete-btn").addEventListener("click", closeDeleteModal);
  document.getElementById("confirm-delete-btn").addEventListener("click", confirmDelete);
  document.getElementById("delete-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "delete-modal-overlay") closeDeleteModal();
  });

  // Header Pending Actions button — toggle right panel
  const headerActionsBtn = document.getElementById("header-pending-actions-btn");
  if (headerActionsBtn) {
    headerActionsBtn.addEventListener("click", () => {
      const layout = document.querySelector(".db-layout");
      if (layout) {
        layout.classList.toggle("actions-open");
      }
    });
  }
}


// ============================================================
// SIDEBAR
// ============================================================

function renderSidebar() {
  renderMeetingList("meetings-hosted", DUMMY_MEETINGS.hosted);
  renderMeetingList("meetings-attended", DUMMY_MEETINGS.attended);
}

function renderMeetingList(containerId, meetings) {
  const ul = document.getElementById(containerId);
  if (!ul) return;

  ul.innerHTML = meetings.map(m => `
    <li class="db-meeting-item ${m.is_important ? 'is-important' : ''}" 
        data-id="${m.id}" 
        onclick="selectMeeting('${m.id}')">
      <div class="db-meeting-content">
        ${m.is_important ? '<span class="db-star">★</span>' : ''}
        <span class="db-meeting-name">${escHtml(m.title)}</span>
      </div>
      <button class="db-meeting-menu-btn" onclick="event.stopPropagation(); toggleMenu('${m.id}')">⋯</button>
      <div class="db-meeting-menu" id="menu-${m.id}" hidden>
        <button onclick="event.stopPropagation(); renameMeeting('${m.id}')">Rename</button>
        <button onclick="event.stopPropagation(); toggleImportant('${m.id}')">Mark as Important</button>
        <button onclick="event.stopPropagation(); showMeetingInfo('${m.id}')">Info</button>
        <button onclick="event.stopPropagation(); deleteMeeting('${m.id}')" class="db-menu-danger">Delete</button>
      </div>
    </li>
  `).join("");
}


function toggleMenu(id) {
  // Close all other menus
  document.querySelectorAll(".db-meeting-menu").forEach(m => {
    if (m.id !== `menu-${id}`) m.hidden = true;
  });
  const menu = document.getElementById(`menu-${id}`);
  menu.hidden = !menu.hidden;
}

// Close menus on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".db-meeting-menu-btn") && !e.target.closest(".db-meeting-menu")) {
    document.querySelectorAll(".db-meeting-menu").forEach(m => m.hidden = true);
  }
});


function renameMeeting(id) {
  const meetingItem = document.querySelector(`.db-meeting-item[data-id="${id}"]`);
  const nameSpan = meetingItem?.querySelector(".db-meeting-name");
  const meeting = allMeetings.find(m => m.id === id);
  
  if (!nameSpan || !meeting) return;

  const currentTitle = meeting.title;
  
  // Hide menus
  document.querySelectorAll(".db-meeting-menu").forEach(m => m.hidden = true);

  // Create inline input
  const input = document.createElement("input");
  input.type = "text";
  input.className = "db-meeting-rename-input";
  input.value = currentTitle;

  // Swap span for input
  nameSpan.style.display = "none";
  nameSpan.parentNode.insertBefore(input, nameSpan);
  
  input.focus();
  input.select();

  const finishRename = (save) => {
    const newTitle = input.value.trim();
    if (save && newTitle && newTitle !== currentTitle) {
      meeting.title = newTitle;
      const src = meeting.section === "hosted" ? DUMMY_MEETINGS.hosted : DUMMY_MEETINGS.attended;
      const srcItem = src.find(m => m.id === id);
      if (srcItem) srcItem.title = newTitle;
      
      nameSpan.textContent = newTitle;
      if (activeMeetingId === id) {
        document.getElementById("db-analysis-title").textContent = newTitle;
      }
    }
    
    input.remove();
    nameSpan.style.display = "";
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishRename(true);
    if (e.key === "Escape") finishRename(false);
  });

  input.addEventListener("blur", () => finishRename(true));
}

function toggleImportant(id) {
  const meeting = allMeetings.find(m => m.id === id);
  if (!meeting) return;
  meeting.is_important = !meeting.is_important;
  const src = meeting.section === "hosted" ? DUMMY_MEETINGS.hosted : DUMMY_MEETINGS.attended;
  const srcItem = src.find(m => m.id === id);
  if (srcItem) srcItem.is_important = meeting.is_important;

  renderSidebar();
  highlightActive();
  document.querySelectorAll(".db-meeting-menu").forEach(m => m.hidden = true);
}

function deleteMeeting(id) {
  const meeting = allMeetings.find(m => m.id === id);
  if (!meeting) return;

  pendingDeleteId = id;
  document.getElementById("delete-meeting-name").textContent = meeting.title;
  document.getElementById("delete-modal-overlay").classList.add("show");
  
  // Close menu
  document.querySelectorAll(".db-meeting-menu").forEach(m => m.hidden = true);
}

function closeDeleteModal() {
  document.getElementById("delete-modal-overlay").classList.remove("show");
  pendingDeleteId = null;
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  const meeting = allMeetings.find(m => m.id === id);
  if (!meeting) {
    closeDeleteModal();
    return;
  }

  const src = meeting.section === "hosted" ? DUMMY_MEETINGS.hosted : DUMMY_MEETINGS.attended;
  const idx = src.findIndex(m => m.id === id);
  if (idx > -1) src.splice(idx, 1);

  allMeetings = allMeetings.filter(m => m.id !== id);

  if (activeMeetingId === id) {
    activeMeetingId = null;
    document.getElementById("db-empty-state").hidden = false;
    document.getElementById("db-analysis").hidden = true;
  }

  renderSidebar();
  renderPendingActions();
  closeDeleteModal();
}

function showMeetingInfo(id) {
  const meeting = allMeetings.find(m => m.id === id);
  if (!meeting) return;
  
  const dur = meeting.duration_seconds;
  const hrs = Math.floor(dur / 3600);
  const mins = Math.floor((dur % 3600) / 60);
  const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;

  const body = document.getElementById("info-modal-body");
  body.innerHTML = `
    <div class="info-modal-grid">
      <div class="info-modal-item">
        <label>Meeting Title</label>
        <div class="info-modal-value title-value">${escHtml(meeting.title)}</div>
      </div>
      <div class="info-modal-row">
        <div class="info-modal-item">
          <label>Date</label>
          <div class="info-modal-value">${meeting.date}</div>
        </div>
        <div class="info-modal-item">
          <label>Platform</label>
          <div class="info-modal-value">${escHtml(meeting.platform)}</div>
        </div>
      </div>
      <div class="info-modal-row">
        <div class="info-modal-item">
          <label>Attendee Count</label>
          <div class="info-modal-value">${meeting.attendee_count} participants</div>
        </div>
        <div class="info-modal-item">
          <label>Duration</label>
          <div class="info-modal-value">${durationStr}</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("info-modal-overlay").classList.add("show");
  document.querySelectorAll(".db-meeting-menu").forEach(m => m.hidden = true);
}


// ============================================================
// SELECT MEETING → RENDER CENTER PANEL
// ============================================================

function selectMeeting(id) {
  activeMeetingId = id;
  const meeting = allMeetings.find(m => m.id === id);
  if (!meeting) return;

  highlightActive();

  // Hide empty, show analysis
  document.getElementById("db-empty-state").hidden = true;
  document.getElementById("db-analysis").hidden = false;

  // Title & meta
  document.getElementById("db-analysis-title").textContent = meeting.title;
  document.getElementById("db-analysis-meta").innerHTML = `
    <span>${meeting.date}</span>
    <span>·</span>
    <span>${escHtml(meeting.platform)}</span>
    <span>·</span>
    <span>${meeting.attendee_count} attendees</span>
    <span>·</span>
    <span>${Math.floor(meeting.duration_seconds / 60)} min</span>
  `;

  // Render analysis sections
  const a = meeting.analysis;
  renderDbSpeakers(a.speakers || []);
  renderDbTopics(a.topics || []);
  renderDbDecisions(a.decisions || []);
  renderDbActionItems(a.action_items || []);

  // Viz
  const frame = document.getElementById("db-viz-frame");
  if (a.visualization_html) {
    frame.srcdoc = a.visualization_html;
  } else {
    frame.srcdoc = `<div style="padding:2rem;color:#888;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;height:100%;text-align:center">
      <div><p style="font-size:1.1rem;margin-bottom:0.5rem">No visualization available</p><p style="font-size:0.85rem;opacity:0.6">Analyze a transcript to generate highlighted annotations.</p></div>
    </div>`;
  }
}

function highlightActive() {
  document.querySelectorAll(".db-meeting-item").forEach(el => {
    el.classList.toggle("active", el.dataset.id === activeMeetingId);
  });
}


// ============================================================
// CENTER PANEL RENDERERS (mirror existing results logic)
// ============================================================

function renderDbSpeakers(speakers) {
  const grid = document.getElementById("db-speakers-grid");
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

function renderDbTopics(topics) {
  const wrap = document.getElementById("db-topics-wrap");
  if (!topics.length) {
    wrap.innerHTML = '<p class="empty-state">No key topics identified.</p>';
    return;
  }
  wrap.innerHTML = topics.map(t => {
    const cls = t.importance === "high" ? "topic-chip high" : "topic-chip";
    return `<span class="${cls}">${escHtml(t.text)}</span>`;
  }).join("");
}

function renderDbDecisions(decisions) {
  const list = document.getElementById("db-decision-list");
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

function renderDbActionItems(items) {
  const tbody = document.getElementById("db-action-tbody");
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
// RIGHT PANEL: PENDING ACTION ITEMS
// ============================================================

function renderPendingActions() {
  const container = document.getElementById("db-actions-list");
  const countBadge = document.getElementById("db-actions-count");

  // Group action items by meeting
  const grouped = {};
  let totalCount = 0;

  allMeetings.forEach(m => {
    const items = m.analysis.action_items || [];
    if (items.length > 0) {
      grouped[m.id] = {
        title: m.title,
        items: items.map(item => ({
          ...item,
          meetingId: m.id,
          meetingTitle: m.title
        }))
      };
      totalCount += items.length;
    }
  });

  countBadge.textContent = totalCount;

  if (totalCount === 0) {
    container.innerHTML = '<p class="empty-state" style="padding:1rem;text-align:center">No pending action items 🎉</p>';
    return;
  }

  let globalIdx = 0;
  container.innerHTML = Object.keys(grouped).map(meetingId => {
    const group = grouped[meetingId];
    return `
      <div class="db-action-group" id="group-${meetingId}">
        <div class="db-action-group-header" onclick="toggleActionGroup('${meetingId}')">
          <span class="db-action-group-title">${escHtml(group.title)}</span>
          <span class="db-action-group-arrow">^</span>
        </div>
        <div class="db-action-group-content" id="content-${meetingId}">
          ${group.items.map(item => {
            const id = `action-card-${globalIdx++}`;
            return `
              <div class="db-action-card" id="${id}">
                <label class="db-action-check">
                  <input type="checkbox" onchange="completeAction('${id}', this)">
                  <span class="db-action-checkmark"></span>
                </label>
                <div class="db-action-info">
                  <div class="db-action-task">${escHtml(item.text)}</div>
                  <div class="db-action-from">
                    <span class="owner-tag">${escHtml(item.owner)}</span>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function toggleActionGroup(meetingId) {
  const group = document.getElementById(`group-${meetingId}`);
  if (group) {
    group.classList.toggle("collapsed");
  }
}

function completeAction(cardId, checkbox) {
  const card = document.getElementById(cardId);
  if (!card) return;
  
  // Save original content and styles for undo
  const originalHtml = card.innerHTML;
  const originalClasses = card.className;
  
  // Phase 1: Cross-fade to Undo state
  card.style.height = card.offsetHeight + "px"; // Lock height for transition
  card.classList.add("completing");

  setTimeout(() => {
    // Phase 2: Switch content while faded out
    card.innerHTML = `
      <div class="db-undo-row">
        <span>Task completed</span>
        <button class="db-undo-btn" onclick="undoAction('${cardId}')">Undo</button>
        <div class="db-undo-progress"></div>
      </div>
    `;
    card.className = "db-action-card undo-active";
    
    // Phase 3: Animate to undo height and fade in
    card.style.height = "44px"; // Standard compact undo height
    card.style.opacity = "1";

    // Store original data
    card._originalHtml = originalHtml;
    card._originalClasses = originalClasses;

    // Phase 4: Permanent removal timer
    const undoTimeout = setTimeout(() => {
      if (card.parentNode) {
        card.style.height = "0";
        card.style.opacity = "0";
        card.style.padding = "0";
        card.style.border = "0";
        
        setTimeout(() => {
          if (card.parentNode) {
            const currentGroup = card.parentElement;
            card.remove();
            
            if (currentGroup && currentGroup.querySelectorAll(".db-action-card").length === 0) {
              const group = currentGroup.parentElement;
              if (group) group.remove();
            }

            const remaining = document.querySelectorAll(".db-action-card:not(.undo-active)").length;
            document.getElementById("db-actions-count").textContent = remaining;

            if (remaining === 0) {
              document.getElementById("db-actions-list").innerHTML = 
                '<p class="empty-state" style="padding:1rem;text-align:center">All caught up! 🎉</p>';
            }
          }
        }, 400);
      }
    }, 3000);

    card._undoTimeout = undoTimeout;
  }, 300);
}

function undoAction(cardId) {
  const card = document.getElementById(cardId);
  if (!card || !card._originalHtml) return;

  clearTimeout(card._undoTimeout);

  card.style.opacity = "0";
  
  setTimeout(() => {
    card.innerHTML = card._originalHtml;
    card.className = card._originalClasses;
    card.classList.remove("completing");
    card.style.height = "auto";
    card.style.opacity = "1";
    
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;

    const remaining = document.querySelectorAll(".db-action-card:not(.undo-active)").length;
    document.getElementById("db-actions-count").textContent = remaining;
  }, 200);
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
