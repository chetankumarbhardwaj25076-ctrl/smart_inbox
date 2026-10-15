/**
 * NexusInbox AI — Client Application Engine
 * Handles reactive state, API communication, dynamic rendering,
 * calendar .ICS generation, and AI email ingestion.
 */

// Application State
const state = {
  opportunities: [],
  emails: [],
  profile: {
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    department: "Computer Science & Engineering",
    academicYear: "3rd Year",
    skills: "Python, TypeScript, Machine Learning, Distributed Systems",
    interests: "AI/ML, Hackathons, Open Source, Cloud Architecture",
    gpa: "3.85",
    minUrgencyAlert: 75
  },
  stats: {
    totalEmails: 0,
    totalOpportunities: 0,
    urgentCount: 0,
    highMatchCount: 0,
    categories: {}
  },
  filters: {
    category: "All",
    urgency: "All",
    status: "All",
    search: "",
    sort: "urgency"
  },
  viewMode: "grid", // 'grid' | 'timeline'
  activeOpportunity: null
};

// Sample realistic email templates for quick testing
const INGEST_TEMPLATES = {
  hackathon: {
    subject: "CalHacks 13.0 Applications Now Open! ⚡ $75,000 in Prizes & Hardware Lab",
    sender: "CalHacks Team <team@calhacks.io>",
    body: `Hey Builders!

Applications are live for CalHacks 13.0, the world's largest collegiate hackathon hosted at UC Berkeley!

Event Highlights:
- Dates: November 20-22, 2026
- Venue: MetLife Pavilion / SF Bay Area + Global Virtual Track
- Travel Grants: Full flight & bus stipends available for verified college students
- Tracks: Foundation Models, Agentic Workflows, Climate Intelligence, Quantum & Robotics

Eligibility: Undergraduate and graduate students worldwide.
Firm Deadline: October 29, 2026 at 11:59 PM PST.

Steps:
1. Apply with your GitHub and Devpost links at https://calhacks.io/apply-2026
2. Confirm hardware requests if building robotics or IoT
3. Join the Discord community after acceptance`
  },
  research: {
    subject: "Paid Undergraduate Research Fellowship: Edge AI & Neuromorphic Computing",
    sender: "Prof. Elena Rostova <rostova@ailab.edu>",
    body: `Undergraduate Researchers,

Our Autonomous Systems Laboratory has 2 paid Research Assistant openings for Spring 2027.

Project Focus: Deploying quantized vision-language models on low-power edge robotics.
Compensation: $26/hour (15-20 hours/week) with possible co-authorship at CVPR 2027.

Requirements:
- Enrolled undergraduate student in Computer Science, Electrical Engineering, or Data Science
- Completed coursework in Data Structures, Linear Algebra, and Deep Learning
- Minimum GPA: 3.4

Application Deadline: November 02, 2026 at 5:00 PM EST.
Submit CV and transcript to: https://ailab.edu/fellowships/apply`
  },
  internship: {
    subject: "Microsoft University Recruiting: Explore SWE Summer 2027 Opportunities",
    sender: "Microsoft University Programs <college-recruiting@microsoft.com>",
    body: `Dear Student,

Microsoft is accepting early applications for our Summer 2027 Software Engineering and Product Management Internships.

Locations: Redmond, WA; Sunnyvale, CA; Cambridge, MA.
Benefits: Competitive hourly pay, corporate housing, relocation allowance, and executive 1:1 mentorship.

Eligibility: Currently pursuing BS or MS in Computer Science, Software Engineering, or related technical degrees.
Batch 1 Deadline: October 25, 2026 at 11:59 PM.

Apply directly at: https://careers.microsoft.com/students/explore-2027`
  },
  scholarship: {
    subject: "NextGen STEM Excellence $10,000 Scholarship & Mentorship Grant",
    sender: "National Science Foundation & Tech Council <awards@stemgrant.org>",
    body: `Greetings Scholars,

The NextGen STEM Merit Grant provides $10,000 in direct academic tuition assistance for high-achieving undergraduates in computer science and engineering disciplines.

Eligibility:
- 2nd, 3rd, or 4th year college student
- 3.3+ GPA
- Demonstration of community contribution or open source software involvement

Application Deadline: October 31, 2026 at 11:59 PM.
Portal: https://stemgrant.org/apply-nextgen`
  },
  academic: {
    subject: "URGENT NOTICE: Senior Capstone & Honors Thesis Proposal Due This Friday",
    sender: "Academic Affairs & Department Chair <chair@university.edu>",
    body: `All Senior and Junior Honors Candidates:

This is a mandatory reminder that final faculty-signed Senior Capstone Project Proposals must be submitted to the portal by Friday, October 17, 2026 at 5:00 PM EST.

Unsubmitted proposals will delay degree audit certification. Ensure your primary faculty advisor has approved your proposal draft before submission.

Submission Portal: https://portal.university.edu/capstone/submit`
  }
};

// ==================== Initialization ====================
document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  await loadProfile();
  await loadOpportunities();
  await loadStats();
});

// ==================== Event Listeners ====================
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("btnClearSearch");

  searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    clearSearch.style.display = e.target.value ? "block" : "none";
    filterAndRenderOpportunities();
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    state.filters.search = "";
    clearSearch.style.display = "none";
    filterAndRenderOpportunities();
  });

  // Sort
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.filters.sort = e.target.value;
    filterAndRenderOpportunities();
  });

  // View Switch (Cards vs Timeline)
  document.getElementById("btnViewGrid").addEventListener("click", () => {
    setViewMode("grid");
  });
  document.getElementById("btnViewTimeline").addEventListener("click", () => {
    setViewMode("timeline");
  });

  // Category filter pills
  document.querySelectorAll("#categoryPills .pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#categoryPills .pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filters.category = btn.getAttribute("data-category");
      filterAndRenderOpportunities();
    });
  });

  // Urgency filter chips
  document.querySelectorAll("#urgencyChips .chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#urgencyChips .chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filters.urgency = btn.getAttribute("data-urgency");
      filterAndRenderOpportunities();
    });
  });

  // Status filter chips
  document.querySelectorAll("#statusChips .chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#statusChips .chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filters.status = btn.getAttribute("data-status");
      filterAndRenderOpportunities();
    });
  });

  // Quick Seed Button
  document.getElementById("btnQuickSeed").addEventListener("click", seedSampleData);

  // Raw Emails Button
  document.getElementById("btnViewEmails").addEventListener("click", openEmailsModal);
  document.getElementById("btnCloseEmails").addEventListener("click", () => closeModal("emailsModal"));
  document.getElementById("btnCloseEmailsBtn").addEventListener("click", () => closeModal("emailsModal"));

  // Reset filter empty state button
  document.getElementById("btnEmptyReset").addEventListener("click", resetFilters);

  // Ingestion Modal
  document.getElementById("btnOpenIngest").addEventListener("click", () => openModal("ingestModal"));
  document.getElementById("btnCloseIngest").addEventListener("click", () => closeModal("ingestModal"));
  document.getElementById("btnCancelIngest").addEventListener("click", () => closeModal("ingestModal"));
  document.getElementById("btnSubmitIngest").addEventListener("click", submitIngestion);

  // Template select in ingestion
  document.getElementById("ingestTemplateSelect").addEventListener("change", (e) => {
    const key = e.target.value;
    if (key && INGEST_TEMPLATES[key]) {
      const t = INGEST_TEMPLATES[key];
      document.getElementById("ingestSubject").value = t.subject;
      document.getElementById("ingestSender").value = t.sender;
      document.getElementById("ingestBody").value = t.body;
    }
  });

  // Profile Modal
  document.getElementById("btnOpenProfile").addEventListener("click", openProfileModal);
  document.getElementById("btnCloseProfile").addEventListener("click", () => closeModal("profileModal"));
  document.getElementById("btnCancelProfile").addEventListener("click", () => closeModal("profileModal"));
  document.getElementById("btnSaveProfile").addEventListener("click", saveProfile);

  // Daily Digest Modal
  document.getElementById("btnOpenDigest").addEventListener("click", openDigestModal);
  document.getElementById("btnCloseDigest").addEventListener("click", () => closeModal("digestModal"));
  document.getElementById("btnCloseDigestBtn").addEventListener("click", () => closeModal("digestModal"));
  document.getElementById("btnCopyDigest").addEventListener("click", copyDigestText);

  // Detail Modal
  document.getElementById("btnCloseDetail").addEventListener("click", () => closeModal("detailModal"));

  // Close modals on overlay backdrop click
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
}

// ==================== API Calls ====================
async function loadProfile() {
  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        state.profile = data;
        updateProfileNav();
      }
    }
  } catch (err) {
    console.warn("Using offline profile state:", err);
  }
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    if (res.ok) {
      const stats = await res.json();
      state.stats = stats;
      renderKPIs(stats);
    }
  } catch (err) {
    console.warn("Using calculated stats:", err);
  }
}

async function loadOpportunities() {
  showLoading(true);
  try {
    const params = new URLSearchParams({
      category: state.filters.category,
      urgency: state.filters.urgency,
      status: state.filters.status,
      search: state.filters.search,
      sort: state.filters.sort
    });

    const res = await fetch(`/api/opportunities?${params.toString()}`);
    if (res.ok) {
      state.opportunities = await res.json();
      filterAndRenderOpportunities();
    }
  } catch (err) {
    console.error("Failed to load opportunities:", err);
    showToast("Error connecting to server. Showing cached data.", "error");
  } finally {
    showLoading(false);
  }
}

async function seedSampleData() {
  showToast("Loading campus opportunity stream...", "success");
  try {
    const res = await fetch("/api/emails/seed", { method: "POST" });
    if (res.ok) {
      showToast("Loaded 9 realistic college emails & deadlines!", "success");
      await loadOpportunities();
      await loadStats();
    }
  } catch (err) {
    console.error("Failed to seed:", err);
    showToast("Loaded demo dataset", "success");
    await loadOpportunities();
  }
}

async function submitIngestion() {
  const subject = document.getElementById("ingestSubject").value.trim();
  const sender = document.getElementById("ingestSender").value.trim();
  const body = document.getElementById("ingestBody").value.trim();

  if (!subject || !body) {
    showToast("Please provide at least a subject and email body.", "error");
    return;
  }

  const spinner = document.getElementById("aiRunningBox");
  spinner.style.display = "flex";
  document.getElementById("btnSubmitIngest").disabled = true;

  try {
    const res = await fetch("/api/emails/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, sender, body })
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`AI Analyzed: "${data.extracted?.title || subject}"`, "success");
      closeModal("ingestModal");
      // Reset form
      document.getElementById("ingestSubject").value = "";
      document.getElementById("ingestSender").value = "";
      document.getElementById("ingestBody").value = "";
      document.getElementById("ingestTemplateSelect").value = "";

      await loadOpportunities();
      await loadStats();

      // Open detail modal for newly analyzed opportunity
      if (data.opportunity) {
        openDetailModal(data.opportunity);
      }
    } else {
      showToast("Analysis encountered an error. Please try again.", "error");
    }
  } catch (err) {
    console.error("Error analyzing email:", err);
    showToast("Network error analyzing email.", "error");
  } finally {
    spinner.style.display = "none";
    document.getElementById("btnSubmitIngest").disabled = false;
  }
}

async function saveProfile() {
  const updated = {
    name: document.getElementById("profName").value.trim(),
    email: document.getElementById("profEmail").value.trim(),
    department: document.getElementById("profDept").value.trim(),
    academicYear: document.getElementById("profYear").value,
    gpa: document.getElementById("profGpa").value.trim(),
    minUrgencyAlert: parseInt(document.getElementById("profUrgency").value, 10),
    skills: document.getElementById("profSkills").value.trim(),
    interests: document.getElementById("profInterests").value.trim()
  };

  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      state.profile = await res.json();
      updateProfileNav();
      closeModal("profileModal");
      showToast("Student profile updated! Matches recalculated.", "success");
      await loadOpportunities();
    }
  } catch (err) {
    console.error("Failed to save profile:", err);
    state.profile = updated;
    updateProfileNav();
    closeModal("profileModal");
    showToast("Profile saved locally.", "success");
  }
}

async function updateOpportunityStatus(oppId, newStatus) {
  try {
    const res = await fetch(`/api/opportunities/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userStatus: newStatus })
    });
    if (res.ok) {
      const updated = await res.json();
      const opp = state.opportunities.find(o => o.id === oppId);
      if (opp) opp.userStatus = newStatus;
      showToast(`Status updated: ${newStatus}`, "success");
    }
  } catch (err) {
    console.error("Error updating status:", err);
  }
}

async function toggleBookmark(oppId, btnElement) {
  const opp = state.opportunities.find(o => o.id === oppId);
  if (!opp) return;

  const newBookmarked = !opp.isBookmarked;
  opp.isBookmarked = newBookmarked;

  if (btnElement) {
    btnElement.classList.toggle("bookmarked", newBookmarked);
  }

  try {
    await fetch(`/api/opportunities/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBookmarked: newBookmarked })
    });
    showToast(newBookmarked ? "Opportunity saved to bookmarks!" : "Removed from bookmarks", "success");
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
}

// ==================== Render Functions ====================
function renderKPIs(stats) {
  document.getElementById("kpiUrgentCount").textContent = stats.urgentCount || 0;
  document.getElementById("kpiMatchCount").textContent = stats.highMatchCount || 0;
  document.getElementById("kpiTotalOpps").textContent = stats.totalOpportunities || 0;
  document.getElementById("kpiTotalEmails").textContent = stats.totalEmails || 0;
  document.getElementById("rawCountLabel").textContent = stats.totalEmails || 0;
}

function updateProfileNav() {
  document.getElementById("navProfileName").textContent = state.profile.name;
  const yr = state.profile.academicYear.split(" ")[0];
  const deptShort = state.profile.department.includes("Computer") ? "CS" : state.profile.department.slice(0, 10);
  document.getElementById("navProfileTag").textContent = `${deptShort} • ${yr}`;
  document.querySelector(".profile-avatar").textContent = state.profile.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2);
}

function filterAndRenderOpportunities() {
  let list = [...state.opportunities];

  // Category filter
  if (state.filters.category && state.filters.category !== "All") {
    list = list.filter(o => o.category === state.filters.category);
  }

  // Urgency filter
  if (state.filters.urgency && state.filters.urgency !== "All") {
    if (state.filters.urgency === "Critical") list = list.filter(o => o.urgencyScore >= 85);
    else if (state.filters.urgency === "High") list = list.filter(o => o.urgencyScore >= 70 && o.urgencyScore < 85);
    else if (state.filters.urgency === "Medium") list = list.filter(o => o.urgencyScore >= 50 && o.urgencyScore < 70);
    else if (state.filters.urgency === "Low") list = list.filter(o => o.urgencyScore < 50);
  }

  // Status filter
  if (state.filters.status && state.filters.status !== "All") {
    if (state.filters.status === "Bookmarked") {
      list = list.filter(o => o.isBookmarked);
    } else {
      list = list.filter(o => o.userStatus === state.filters.status.toLowerCase());
    }
  }

  // Search filter
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase().trim();
    list = list.filter(o => {
      const haystack = `${o.title} ${o.organization} ${o.summary} ${o.eligibility} ${o.branches}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  // Sorting
  if (state.filters.sort === "urgency") {
    list.sort((a, b) => b.urgencyScore - a.urgencyScore);
  } else if (state.filters.sort === "match") {
    list.sort((a, b) => b.matchScore - a.matchScore);
  } else if (state.filters.sort === "recent") {
    list.sort((a, b) => b.id - a.id);
  }

  // Empty state handling
  const emptyState = document.getElementById("emptyState");
  const oppGrid = document.getElementById("opportunityGrid");
  const timelineTrack = document.getElementById("timelineTrack");

  if (list.length === 0) {
    emptyState.style.display = "block";
    oppGrid.style.display = "none";
    document.getElementById("timelineContainer").style.display = "none";
    return;
  } else {
    emptyState.style.display = "none";
  }

  if (state.viewMode === "grid") {
    oppGrid.style.display = "grid";
    document.getElementById("timelineContainer").style.display = "none";
    renderGrid(list);
  } else {
    oppGrid.style.display = "none";
    document.getElementById("timelineContainer").style.display = "block";
    renderTimeline(list);
  }
}

function renderGrid(list) {
  const container = document.getElementById("opportunityGrid");
  container.innerHTML = "";

  list.forEach(opp => {
    const card = document.createElement("div");
    card.className = `opp-card ${opp.urgencyScore >= 85 ? "critical-deadline" : ""}`;

    // Urgency level label and class
    let urgencyClass = "urgency-low";
    let urgencyLabel = "Low Urgency";
    if (opp.urgencyScore >= 85) {
      urgencyClass = "urgency-critical";
      urgencyLabel = `Critical (${opp.urgencyScore})`;
    } else if (opp.urgencyScore >= 70) {
      urgencyClass = "urgency-high";
      urgencyLabel = `High (${opp.urgencyScore})`;
    } else if (opp.urgencyScore >= 50) {
      urgencyClass = "urgency-medium";
      urgencyLabel = `Medium (${opp.urgencyScore})`;
    }

    card.innerHTML = `
      <div>
        <div class="opp-card-header">
          <div class="badge-row">
            <span class="badge badge-category">${getCategoryIcon(opp.category)} ${escapeHtml(opp.category)}</span>
            <span class="badge ${urgencyClass}">${urgencyLabel}</span>
            <span class="badge badge-match">${opp.matchScore}% Match</span>
          </div>
          <button class="card-bookmark-btn ${opp.isBookmarked ? "bookmarked" : ""}" title="Bookmark" data-id="${opp.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${opp.isBookmarked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </div>

        <div class="opp-org">${escapeHtml(opp.organization)}</div>
        <h3 class="opp-title">${escapeHtml(opp.title)}</h3>
        <p class="opp-summary">${escapeHtml(opp.summary)}</p>

        <div class="opp-meta-list">
          <div class="opp-meta-item">
            <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span><strong>Deadline:</strong> <span class="${opp.urgencyScore >= 80 ? "deadline-highlight" : ""}">${escapeHtml(opp.deadlineText || "See details")}</span></span>
          </div>
          <div class="opp-meta-item">
            <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span><strong>Eligibility:</strong> ${escapeHtml(opp.eligibility || "Open to all students")}</span>
          </div>
        </div>
      </div>

      <div class="opp-card-footer">
        <div class="status-dropdown-wrap">
          <select data-status-id="${opp.id}">
            <option value="new" ${opp.userStatus === "new" ? "selected" : ""}>Status: New</option>
            <option value="interested" ${opp.userStatus === "interested" ? "selected" : ""}>Interested</option>
            <option value="applied" ${opp.userStatus === "applied" ? "selected" : ""}>Applied</option>
            <option value="dismissed" ${opp.userStatus === "dismissed" ? "selected" : ""}>Dismiss</option>
          </select>
        </div>

        <div class="card-action-btns">
          ${opp.registrationUrl ? `<a href="${escapeHtml(opp.registrationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Apply or Open Link"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Link</a>` : ""}
          <button class="btn btn-outline btn-sm btn-open-detail" data-id="${opp.id}">
            Review &amp; Checklist
          </button>
        </div>
      </div>
    `;

    // Bind bookmark click
    const bkmkBtn = card.querySelector(".card-bookmark-btn");
    bkmkBtn.addEventListener("click", () => toggleBookmark(opp.id, bkmkBtn));

    // Bind status change
    const statusSelect = card.querySelector("[data-status-id]");
    statusSelect.addEventListener("change", (e) => {
      updateOpportunityStatus(opp.id, e.target.value);
    });

    // Bind detail click
    card.querySelector(".btn-open-detail").addEventListener("click", () => {
      openDetailModal(opp);
    });

    container.appendChild(card);
  });
}

function renderTimeline(list) {
  const container = document.getElementById("timelineTrack");
  container.innerHTML = "";

  list.forEach(opp => {
    const item = document.createElement("div");
    item.className = `timeline-item ${opp.urgencyScore >= 85 ? "urgent-item" : ""}`;

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-body">
        <div class="timeline-info">
          <div class="timeline-date-tag">
            ${getCategoryIcon(opp.category)} ${escapeHtml(opp.deadlineText || "Upcoming")} &bull; ${opp.urgencyScore >= 85 ? "CRITICAL" : "ACTIVE"}
          </div>
          <div class="timeline-item-title">${escapeHtml(opp.title)}</div>
          <div class="opp-org">${escapeHtml(opp.organization)} &bull; Match: ${opp.matchScore}%</div>
        </div>
        <div class="timeline-actions">
          <button class="btn btn-secondary btn-sm btn-calendar-export" data-id="${opp.id}" title="Download Calendar .ICS Event">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Add to Cal
          </button>
          <button class="btn btn-primary btn-sm btn-timeline-detail" data-id="${opp.id}">
            View
          </button>
        </div>
      </div>
    `;

    item.querySelector(".btn-calendar-export").addEventListener("click", () => exportCalendarEvent(opp));
    item.querySelector(".btn-timeline-detail").addEventListener("click", () => openDetailModal(opp));

    container.appendChild(item);
  });
}

// ==================== Modals Management ====================
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

function openDetailModal(opp) {
  state.activeOpportunity = opp;
  const modal = document.getElementById("detailModal");

  // Badges
  document.getElementById("modalCategoryBadge").textContent = `${getCategoryIcon(opp.category)} ${opp.category}`;
  document.getElementById("modalUrgencyBadge").textContent = `Urgency: ${opp.urgencyScore}/100`;
  document.getElementById("modalMatchBadge").textContent = `Student Fit: ${opp.matchScore}%`;

  let actionsList = [];
  try {
    actionsList = typeof opp.requiredActions === "string" ? JSON.parse(opp.requiredActions) : opp.requiredActions;
  } catch (e) {
    actionsList = [opp.requiredActions || "Complete application form"];
  }

  const bodyEl = document.getElementById("detailModalBody");
  bodyEl.innerHTML = `
    <div>
      <div class="opp-org" style="font-size: 0.9rem;">${escapeHtml(opp.organization)}</div>
      <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">${escapeHtml(opp.title)}</h2>
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${escapeHtml(opp.summary)}</p>
    </div>

    <!-- Key Parameters -->
    <div class="detail-section">
      <div class="detail-section-title">Opportunity Parameters</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
        <div><strong>Submission Deadline:</strong> <span style="color: #f87171;">${escapeHtml(opp.deadlineText || "Not specified")}</span></div>
        <div><strong>Target Academic Years:</strong> <span>${escapeHtml(opp.academicYears || "All")}</span></div>
        <div><strong>Eligible Branches/Majors:</strong> <span>${escapeHtml(opp.branches || "All")}</span></div>
        <div><strong>Eligibility Rule:</strong> <span>${escapeHtml(opp.eligibility || "Open")}</span></div>
      </div>
    </div>

    <!-- Required Actions Checklist -->
    <div class="detail-section">
      <div class="detail-section-title">Required Action Checklist</div>
      <ul class="action-checklist">
        ${actionsList.map((action, i) => `
          <li class="action-check-item">
            <input type="checkbox" id="action_check_${i}">
            <label for="action_check_${i}">${escapeHtml(action)}</label>
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Personal Student Notes -->
    <div class="detail-section">
      <div class="detail-section-title">Personal Follow-Up Notes</div>
      <textarea id="modalNotesInput" class="form-input" rows="2" placeholder="Record interview prep dates, team member contacts, or essay status...">${escapeHtml(opp.notes || "")}</textarea>
      <button class="btn btn-secondary btn-sm" id="btnSaveNotes" style="margin-top: 8px;">Save Notes</button>
    </div>
  `;

  // Bind note saver
  document.getElementById("btnSaveNotes").addEventListener("click", async () => {
    const notes = document.getElementById("modalNotesInput").value;
    opp.notes = notes;
    await fetch(`/api/opportunities/${opp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    showToast("Notes saved to opportunity!", "success");
  });

  // Footer Actions
  const footerEl = document.getElementById("detailModalFooter");
  footerEl.innerHTML = `
    <button class="btn btn-secondary" id="btnExportICS">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      Export .ICS Reminder
    </button>
    ${opp.registrationUrl ? `
      <a href="${escapeHtml(opp.registrationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        Go to Application Link &rarr;
      </a>
    ` : ""}
  `;

  document.getElementById("btnExportICS").addEventListener("click", () => exportCalendarEvent(opp));

  modal.classList.add("active");
}

function openProfileModal() {
  document.getElementById("profName").value = state.profile.name;
  document.getElementById("profEmail").value = state.profile.email;
  document.getElementById("profDept").value = state.profile.department;
  document.getElementById("profYear").value = state.profile.academicYear;
  document.getElementById("profGpa").value = state.profile.gpa;
  document.getElementById("profUrgency").value = state.profile.minUrgencyAlert || 70;
  document.getElementById("profSkills").value = state.profile.skills;
  document.getElementById("profInterests").value = state.profile.interests;

  openModal("profileModal");
}

async function openDigestModal() {
  const container = document.getElementById("digestContent");
  container.innerHTML = `<div class="ai-running-box"><div class="ai-spinner"></div><span>Compiling Personalized Briefing...</span></div>`;
  openModal("digestModal");

  try {
    const res = await fetch("/api/digest");
    if (res.ok) {
      const digest = await res.json();
      renderDigest(digest);
    }
  } catch (err) {
    console.error("Failed to load digest:", err);
  }
}

function renderDigest(d) {
  const container = document.getElementById("digestContent");
  document.getElementById("digestTitle").textContent = `Academic Briefing: ${d.date}`;

  let urgentHtml = "";
  if (d.urgentDeadlines && d.urgentDeadlines.length > 0) {
    urgentHtml = `
      <div class="digest-card-group">
        <div class="digest-group-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          URGENT ACTION ITEMS (${d.urgentDeadlines.length})
        </div>
        ${d.urgentDeadlines.map(u => `
          <div class="digest-item">
            <strong>${escapeHtml(u.title)}</strong> &bull; <span style="color: #f87171;">Due ${escapeHtml(u.deadlineText)}</span>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
              Required Action: ${escapeHtml(u.action)}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  let picksHtml = "";
  if (d.recommendedPicks && d.recommendedPicks.length > 0) {
    picksHtml = `
      <div class="digest-card-group">
        <div class="digest-group-title" style="color: #34d399;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          CURATED OPPORTUNITY PICKS
        </div>
        ${d.recommendedPicks.map(p => `
          <div class="digest-item match-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${escapeHtml(p.title)}</strong>
              <span class="badge badge-match">${p.matchScore}% Match</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 4px 0;">${escapeHtml(p.summary)}</p>
            ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" style="color: #38bdf8; font-size: 0.8rem; text-decoration: none;">Apply directly &rarr;</a>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="digest-lead">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 6px;">${escapeHtml(d.greeting)}</h3>
      <p style="color: var(--text-secondary); font-size: 0.94rem;">${escapeHtml(d.overview)}</p>
    </div>
    ${urgentHtml}
    ${picksHtml}
  `;
}

function copyDigestText() {
  const content = document.getElementById("digestContent").innerText;
  navigator.clipboard.writeText(content).then(() => {
    showToast("Digest copied to clipboard!", "success");
  });
}

async function openEmailsModal() {
  const container = document.getElementById("emailsListContainer");
  container.innerHTML = `<div class="ai-running-box"><div class="ai-spinner"></div><span>Loading Processed Emails...</span></div>`;
  openModal("emailsModal");

  try {
    const res = await fetch("/api/emails");
    if (res.ok) {
      const emailList = await res.json();
      state.emails = emailList;
      if (emailList.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No raw emails recorded yet.</p>`;
        return;
      }

      container.innerHTML = emailList.map(e => `
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--text-primary); font-size: 1rem;">${escapeHtml(e.subject)}</strong>
            <span style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-muted);">${escapeHtml(new Date(e.receivedAt || e.received_at).toLocaleDateString())}</span>
          </div>
          <div style="font-size: 0.82rem; color: #a5b4fc; margin-bottom: 8px;">From: ${escapeHtml(e.sender)}</div>
          <p style="font-size: 0.86rem; color: var(--text-secondary); white-space: pre-line; max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 4px;">${escapeHtml(e.body)}</p>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Error reading emails:", err);
  }
}

// ==================== Calendar (.ICS) Generator ====================
function exportCalendarEvent(opp) {
  const title = opp.title || "Academic Deadline";
  const desc = `${opp.summary}\n\nOrganization: ${opp.organization}\nAction: Review and submit before deadline.\nLink: ${opp.registrationUrl || ""}`;
  
  // Format iCalendar date
  const now = new Date();
  const targetDate = opp.deadline ? new Date(opp.deadline) : new Date(now.getTime() + 86400000 * 3);
  
  const formatDateToICS = (date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NexusInbox AI//Student Opportunity Manager//EN",
    "BEGIN:VEVENT",
    `UID:nexus-${opp.id}-${Date.now()}@university.edu`,
    `DTSTAMP:${formatDateToICS(now)}`,
    `DTSTART:${formatDateToICS(targetDate)}`,
    `DTEND:${formatDateToICS(new Date(targetDate.getTime() + 3600000))}`,
    `SUMMARY:DEADLINE: ${title}`,
    `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
    `URL:${opp.registrationUrl || ""}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: 24 hours until ${title} deadline!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `deadline-${opp.title.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Downloaded .ICS Calendar Event file!", "success");
}

// ==================== Helpers ====================
function setViewMode(mode) {
  state.viewMode = mode;
  document.getElementById("btnViewGrid").classList.toggle("active", mode === "grid");
  document.getElementById("btnViewTimeline").classList.toggle("active", mode === "timeline");
  filterAndRenderOpportunities();
}

function resetFilters() {
  state.filters = { category: "All", urgency: "All", status: "All", search: "", sort: "urgency" };
  document.getElementById("searchInput").value = "";
  document.getElementById("sortSelect").value = "urgency";
  document.querySelectorAll("#categoryPills .pill-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-category") === "All"));
  document.querySelectorAll("#urgencyChips .chip-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-urgency") === "All"));
  document.querySelectorAll("#statusChips .chip-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-status") === "All"));
  filterAndRenderOpportunities();
}

function getCategoryIcon(cat) {
  switch (cat) {
    case "Hackathon": return "⚡";
    case "Internship": return "💼";
    case "Scholarship": return "🎓";
    case "Research": return "🔬";
    case "Workshop": return "🛠️";
    case "Academic Deadline": return "📚";
    case "Campus Event": return "🏛️";
    default: return "📌";
  }
}

function showLoading(show) {
  const skel = document.getElementById("loadingSkeleton");
  if (skel) skel.style.display = show ? "grid" : "none";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
