// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM MATRIX INTERACTIVE LOGIC ENGINE
// ==========================================================================

// Track active tab visibility states
function switchPortalTab(event, activeTabId) {
  const panelNodes = document.querySelectorAll('.portal-panel');
  const tabButtonNodes = document.querySelectorAll('.tab-btn');

  panelNodes.forEach(panel => panel.classList.remove('active'));
  tabButtonNodes.forEach(button => button.classList.remove('active'));

  document.getElementById(activeTabId).classList.add('active');
  if (event) {
    event.currentTarget.classList.add('active');
  }

  // Refresh data dynamic lists when tabs are clicked
  if (activeTabId === 'member-tab') {
    initializeAjoAnalyticsChart();
    renderMemberDashboard();
  } else if (activeTabId === 'admin-tab') {
    renderAdminValidationPipeline();
  }
}

// --------------------------------------------------------------------------
// DATA STORE ENGINE (Local Browser Storage System Matrix)
// --------------------------------------------------------------------------
const STORAGE_KEY = 'HAMBAK_AJO_MEMBERS';

// Seed initial system tracking records if storage is empty
function getStoredMembers() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultData = [
      {
        id: "AJO-2026-001",
        fullName: "Adegoke Gbadamosi",
        phone: "08034561122",
        email: "adegoke@hambak.com",
        address: "Ibeju-Lekki, Lagos",
        tierCategory: "Category A - Individual (₦100,000/mo)",
        idType: "NIN",
        idNumber: "12345678901",
        guarantorName: "Samuel Alao",
        guarantorPhone: "08122334455",
        nextOfKin: "Oluchi Gbadamosi (Wife)",
        verificationStatus: "Pending",
        totalContributed: 0,
        rotationGroup: "Unassigned"
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(data);
}

function saveMembers(memberArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memberArray));
}

// --------------------------------------------------------------------------
// FORM DISPATCH HANDLING ENGINE
// --------------------------------------------------------------------------
function handleFormSubmission(event) {
  event.preventDefault();
  
  const form = event.target;
  const members = getStoredMembers();
  
  // Safely grab the form inputs directly using selectors so form values don't scramble
  const newMember = {
    id: "AJO-2026-0" + (members.length + 1),
    fullName: form.querySelector('input[placeholder="Surname Firstname"]').value,
    phone: form.querySelector('input[placeholder="08012345678"]').value,
    email: form.querySelector('input[type="email"]').value,
    address: form.querySelector('input[placeholder="Full street layout state coordinates"]').value,
    tierCategory: form.querySelectorAll('select')[0].value,
    idType: form.querySelectorAll('select')[1].value,
    idNumber: form.querySelector('input[placeholder="Enter number sequence"]').value,
    guarantorName: form.querySelector('input[placeholder="Guarantor Name"]').value,
    guarantorPhone: form.querySelector('input[placeholder="Guarantor Phone"]').value,
    nextOfKin: form.querySelector('input[placeholder="Next of Kin Name & Link"]').value,
    verificationStatus: "Pending",
    totalContributed: 0,
    rotationGroup: "Unassigned"
  };

  members.push(newMember);
  saveMembers(members);

  alert('Success! Your verification payload has been saved securely to the Hambak Data Registry. Navigate to the Admin Control Matrix tab to review it.');
  form.reset();
  
  // Auto switch views to see the result inside the Admin validation queue
  switchPortalTab(null, 'admin-tab');
  const adminBtn = document.querySelector('button[onclick*="admin-tab"]');
  if(adminBtn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    adminBtn.classList.add('active');
  }
}

// --------------------------------------------------------------------------
// DYNAMIC UI RENDERING ENGINES
// --------------------------------------------------------------------------

function renderMemberDashboard() {
  const members = getStoredMembers();
  let totalPoolLiquidity = 400000; 
  
  members.forEach(m => {
    if(m.verificationStatus === 'Approved') {
      totalPoolLiquidity += m.totalContributed;
    }
  });
}

function renderAdminValidationPipeline() {
  const members = getStoredMembers();
  const tbody = document.querySelector('#admin-tab table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const pendingMembers = members.filter(m => m.verificationStatus === 'Pending');

  if(pendingMembers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:30px;">All entry pipelines fully checked. No pending applicants in verification tracking.</td></tr>`;
    return;
  }

  pendingMembers.forEach(member => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${member.fullName}</strong><br><small style="color:#64748b;">ID: ${member.id}</small></td>
      <td>${member.phone}</td>
      <td>${member.tierCategory ? member.tierCategory.split(' - ')[0] : 'Custom'}</td>
      <td><span style="color: var(--brand-gold);"><i class="fa-solid fa-file-shield"></i> Verified_${member.idType}.dat</span></td>
      <td>
        <div class="action-btn-suite">
          <button class="mini-btn approve" onclick="executeAdminApproval('${member.id}')">Verify</button>
          <button class="mini-btn remind" style="background:#475569; color:white;" onclick="executeAdminDecline('${member.id}')">Decline</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --------------------------------------------------------------------------
// ADMIN CONTROLLER ACTION VECTORS
// --------------------------------------------------------------------------
function executeAdminApproval(memberId) {
  let members = getStoredMembers();
  const index = members.findIndex(m => m.id === memberId);
  
  if (index !== -1) {
    members[index].verificationStatus = 'Approved';
    members[index].rotationGroup = 'Group B-10'; 
    members[index].totalContributed = 100000; 
    saveMembers(members);
    alert('Member account state authorized. Data ledger updated successfully.');
    renderAdminValidationPipeline();
  }
}

function executeAdminDecline(memberId) {
  let members = getStoredMembers();
  members = members.filter(m => m.id !== memberId);
  saveMembers(members);
  alert('Applicant payload rejected and cleared from registry tracking.');
  renderAdminValidationPipeline();
}

// --------------------------------------------------------------------------
// CHART VISUALIZATION MODULE CORE
// --------------------------------------------------------------------------
let chartInstanceReference = null;
function initializeAjoAnalyticsChart() {
  const ctxNode = document.getElementById("ajoPoolChart");
  if (!ctxNode) return;
  
  if (chartInstanceReference !== null) {
    chartInstanceReference.destroy();
  }

  const renderingContext = ctxNode.getContext("2d");
  const linearGradientTrack = renderingContext.createLinearGradient(0, 0, 0, 250);
  linearGradientTrack.addColorStop(0, 'rgba(13, 71, 161, 0.4)');
  linearGradientTrack.addColorStop(1, 'rgba(13, 71, 161, 0.0)');

  chartInstanceReference = new Chart(renderingContext, {
    type: "line",
    data: {
      labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10"],
      datasets: [{
        label: "Total Pool Capital Velocity Staged (Millions ₦)",
        data: [1.0, 1.0, 1.0, 1.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        borderColor: "#f5b942",
        borderWidth: 3,
        backgroundColor: linearGradientTrack,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#0d47a1"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// Initialize system pipelines immediately upon browser runtime initialization
document.addEventListener("DOMContentLoaded", () => {
  getStoredMembers();
  
  const regForm = document.querySelector('#register-tab form');
  if(regForm) {
    regForm.removeAttribute('onsubmit');
    regForm.addEventListener('submit', handleFormSubmission);
  }
});
