// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM MATRIX INTERACTIVE GAME LOGIC ENGINE
// ==========================================================================

// State management storage array 
let players = [
  { id: "user", name: "Ahmad Hamahullah (You)", module: "Spelling Bee Module", points: 25500, highlight: true },
  { id: "fatimoh", name: "Fatimoh Alake", module: "Senior Secondary Quiz", points: 24200, highlight: false },
  { id: "aisha", name: "Aisha Hambak", module: "Math Brain Quiz", points: 21800, highlight: false }
];

/**
 * Renders and sorts the leaderboard ranks dynamically based on values
 */
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;
  
  // Sort array descending based on point bounds
  players.sort((a, b) => b.points - a.points);
  
  tbody.innerHTML = "";
  
  players.forEach((player, index) => {
    const tr = document.createElement('tr');
    if(player.highlight) {
      tr.style.background = "rgba(245, 185, 66, 0.05)";
    }
    
    const rankColor = index === 0 ? "style='color:#f5b942; font-weight:bold;'" : "";
    const pointsColor = player.highlight ? "style='color:#f5b942; font-weight:bold;'" : "";
    
    tr.innerHTML = `
      <td ${rankColor}>#${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.module}</td>
      <td ${pointsColor}>${player.points.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  // Update values in ticker feed dynamically
  const leader = players[0];
  const tickerContent = document.getElementById('tickerContent');
  if (tickerContent) {
    tickerContent.innerText = `Welcome to Hambak Game Center! • Track live score progress • Current Leader: ${leader.name} with ${leader.points.toLocaleString()} pts • Completing modules updates standings instantaneously!`;
  }
}

/**
 * Toggles layout visibility grids for target game engines
 */
function toggleEngine(engineKey) {
  const targetedEngine = document.getElementById(`${engineKey}Engine`);
  const targetTrigger = document.getElementById(`${engineKey}Trigger`);
  
  if (!targetedEngine || !targetTrigger) return;

  if (targetedEngine.style.display === "flex") {
    targetedEngine.style.display = "none";
    targetTrigger.innerText = "Launch Arena";
  } else {
    // Hide all open engine boxes first
    document.querySelectorAll('.live-engine-box').forEach(box => box.style.display = "none");
    
    // Reset all triggers back to "Launch Arena"
    document.querySelectorAll('.game-grid .game-button').forEach(btn => {
      if(btn.id && btn.id.includes('Trigger')) {
        btn.innerText = "Launch Arena";
      }
    });
    
    // Display our active game grid box
    targetedEngine.style.display = "flex";
    targetTrigger.innerText = "Close Active Arena";
  }
}

/**
 * Standardized internal wallet increment rendering sequence
 */
function creditGamingWallet(pointAmount, moduleName) {
  const userObj = players.find(p => p.id === "user");
  if (!userObj) return;

  userObj.points += pointAmount;
  userObj.module = moduleName;
  
  // Render layout wallet updates
  const walletDisplay = document.getElementById('walletDisplay');
  if (walletDisplay) {
    walletDisplay.innerText = `₦${userObj.points.toLocaleString()}`;
  }
  
  // Re-compile leaderboard matrices
  renderLeaderboard();
}

/**
 * VERIFICATION PIPELINE: Spelling Bee
 */
function verifySpellingBee() {
  const inputNode = document.getElementById('beeInput');
  const feedback = document.getElementById('beeFeedback');
  if (!inputNode || !feedback) return;

  const value = inputNode.value.trim().toLowerCase();
  
  if (value === "mongodb") {
    feedback.style.color = "#10b981";
    feedback.innerText = "Correct answer! +₦500 committed to account balance.";
    creditGamingWallet(500, "Spelling Bee Module");
    inputNode.disabled = true;
  } else {
    feedback.style.color = "#ef4444";
    feedback.innerText = "Incorrect configuration placement sequence. Try again.";
  }
}

/**
 * VERIFICATION PIPELINE: Academic Quiz Selection
 */
function verifyQuiz() {
  const selectNode = document.getElementById('quizSelect');
  const feedback = document.getElementById('quizFeedback');
  if (!selectNode || !feedback) return;

  const selectValue = selectNode.value;
  
  if (selectValue === "correct") {
    feedback.style.color = "#10b981";
    feedback.innerText = "Correct structural answer! +₦1,000 committed to account balance.";
    creditGamingWallet(1000, "Senior Secondary Quiz");
    selectNode.disabled = true;
  } else {
    feedback.style.color = "#ef4444";
    feedback.innerText = "Selection parameters incorrect. Review operational models.";
  }
}

/**
 * VERIFICATION PIPELINE: Math Array Calculation
 */
function verifyMath() {
  const inputNode = document.getElementById('mathInput');
  const feedback = document.getElementById('mathFeedback');
  if (!inputNode || !feedback) return;

  const inputVal = parseInt(inputNode.value);
  
  if (inputVal === 200) {
    feedback.style.color = "#10b981";
    feedback.innerText = "Calculation clear! +₦300 committed to account balance.";
    creditGamingWallet(300, "Math Brain Quiz");
    inputNode.disabled = true;
  } else {
    feedback.style.color = "#ef4444";
    feedback.innerText = "Mathematical bounds equation unverified. Try computation again.";
  }
}

// Initialize leaderboard layout parameters on boot sequence safely
document.addEventListener("DOMContentLoaded", () => {
  renderLeaderboard();
});
