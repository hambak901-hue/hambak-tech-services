/**
 * HAMBAK TECH & SERVICES - Unified Admin Session Guard
 * Restricts page access to authorized admin accounts and boots unauthorized clients.
 */
(function () {
  // 1. Immediately read security parameters from the local storage layer
  const userToken = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") ? localStorage.getItem("role").toLowerCase() : null;

  console.log("[SessionGuard] Initializing system firewall validation...");

  // 2. Clear out any spacing or corrupted string markers from the role token
  const cleanRole = userRole ? userRole.trim() : "";

  // 3. Execution Check: If no token exists or the role parameter isn't exactly 'admin'
  if (!userToken || cleanRole !== "admin") {
    console.warn(`[SessionGuard] Security Breach: Unauthorized role attempt detected ("${cleanRole}"). Redirecting node...`);
    
    // Clear out any corrupt or partial session parameters to be completely safe
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // Immediately kick them out to the primary portal entrance
    window.location.replace("/login.html");
  } else {
    console.log("[SessionGuard] Handshake Verified. Administrative access cleared.");
    
    // 4. Dom Content Safeguard: Force reveal hidden admin assets if page styling defaults to hidden
    document.addEventListener("DOMContentLoaded", () => {
      const adminElements = document.querySelectorAll(".admin-block-section, .admin-only-tab");
      adminElements.forEach(element => {
        // Override the 'display: none' blocker smoothly since this is a validated Admin instance
        if (element.tagName === 'A' || element.tagName === 'DIV' || element.tagName === 'BUTTON') {
          element.style.display = "flex"; // or 'block' / 'inline-block' depending on your design setup
        } else {
          element.style.display = "block";
        }
      });
    });
  }
})();
