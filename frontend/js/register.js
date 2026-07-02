// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM REGISTRATION LOGIC ENGINE
// ==========================================================================

const BASE_URL = "https://hambak-tech-services.onrender.com/api";

/**
 * Intercepts input type state transformations to toggle visual masking
 */
function togglePasswordVisibility(targetInputId, controllerElement) {
  const fieldInstance = document.getElementById(targetInputId);
  if (!fieldInstance) return;
  const iconInstance = controllerElement.querySelector("i");

  if (fieldInstance.type === "password") {
    fieldInstance.type = "text";
    if (iconInstance) iconInstance.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    fieldInstance.type = "password";
    if (iconInstance) iconInstance.classList.replace("fa-eye-slash", "fa-eye");
  }
}

/**
 * Visual tracking update hook for local file staging events
 */
function updateUploadBoxStatus(inputField) {
  const indicatorText = document.getElementById("uploadStatusText");
  if (!indicatorText) return;

  if (inputField.files && inputField.files[0]) {
    indicatorText.innerText = `Asset Staged: ${inputField.files[0].name}`;
    indicatorText.style.color = "var(--brand-gold)";
  } else {
    indicatorText.innerText = "Drag files or click to upload avatar PNG/JPG";
    indicatorText.style.color = "#cbd5e1";
  }
}

// Make functions globally available since they are called from HTML attributes
window.togglePasswordVisibility = togglePasswordVisibility;
window.updateUploadBoxStatus = updateUploadBoxStatus;

const formElement = document.getElementById("registerForm");
const communicationBanner = document.getElementById("messageBanner");
const submitBtn = document.getElementById("submitBtn");

if (formElement) {
  formElement.addEventListener("submit", async (submissionEvent) => {
    submissionEvent.preventDefault();

    if (!communicationBanner) return;

    // Clear existing UI alert banners
    communicationBanner.className = "message-banner";
    communicationBanner.innerText = "";
    communicationBanner.style.display = "none";

    /* ACQUIRE FIELD MATRIX VALUE SCOPES */
    const name = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
    const username = document.getElementById("username") ? document.getElementById("username").value.trim() : "";
    const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
    const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
    const role = document.getElementById("role") ? document.getElementById("role").value : "";
    const password = document.getElementById("password") ? document.getElementById("password").value : "";
    const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : "";
    const termsCheckbox = document.getElementById("termsCheckbox");
    const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;
    const avatarInput = document.getElementById("avatarFile");

    /* NATIVE FORM COMPLETENESS RULE VALIDATION */
    if (!name || !username || !email || !phone || !role || !password) {
      communicationBanner.innerText = "Error: All mandatory fields must be populated.";
      communicationBanner.classList.add("error");
      return;
    }

    if (password !== confirmPassword) {
      communicationBanner.innerText = "Security Conflict: Passwords do not match verification output.";
      communicationBanner.classList.add("error");
      return;
    }

    if (!termsAccepted) {
      communicationBanner.innerText = "Authorization Blocked: You must accept our network usage policies.";
      communicationBanner.classList.add("error");
      return;
    }

    /* DISABLE CONTROLS DURING RUNTIME TRANSIT */
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Instantiating Credentials...";
    }

    /* BUILD MULTI-PART FORM DATA LAYOUT */
    try {
      const formPayload = new FormData();
      formPayload.append("name", name);
      formPayload.append("username", username);
      formPayload.append("email", email);
      formPayload.append("phone", phone);
      formPayload.append("role", role);
      formPayload.append("password", password);

      // Append binary asset file payload if it exists inside the drag block node
      if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formPayload.append("avatarFile", avatarInput.files[0]);
      }

      // CONNECTS EXACTLY TO YOUR BACKEND API SERVER
      // Note: Content-Type header must NOT be specified when passing FormData to fetch; 
      // the browser will automatically declare it with the required boundary tokens.
      const serverTransportStream = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: formPayload
      });

      const processingResultData = await serverTransportStream.json();

      /* VALIDATE TRANSACTION RESPONSE METRICS */
      if (!serverTransportStream.ok || !processingResultData.success) {
        communicationBanner.innerText = `Registration Failure: ${processingResultData.message || "Invalid field parameters configuration."}`;
        communicationBanner.classList.add("error");
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Establish Ecosystem Identity";
        }
        return;
      }

      /* SUCCESS LEDGER TRANSACTION LOG COMMITTED */
      communicationBanner.innerText = "Ecosystem Token Staged Successfully. Mapping profile environment...";
      communicationBanner.classList.add("success");

      // Commit user data metrics to browser local storage
      if (processingResultData.user) {
        localStorage.setItem("hambak_user", JSON.stringify(processingResultData.user));
      }
      
      // Ensure both authentication string variations mirror throughout storage targets safely
      if (processingResultData.token) {
        localStorage.setItem("token", processingResultData.token);
        localStorage.setItem("hambak_token", processingResultData.token);
      }

      /* DISPATCH INTER-PAGE ROUTING REDIRECTS */
      setTimeout(() => {
        const exactRole = processingResultData.user?.role || role;
        if (exactRole === "admin") {
          window.location.href = "admin.html";
        } else if (exactRole === "student") {
          window.location.href = "dashboard.html?context=training";
        } else {
          window.location.href = "dashboard.html";
        }
      }, 1800);

    } catch (externalNetworkFaultError) {
      communicationBanner.innerText = "Fatal Infrastructure Defect: Upstream processing server returned an unhandled fault.";
      communicationBanner.classList.add("error");
      console.error("Transport Fault Framework Trace Log:", externalNetworkFaultError);
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Establish Ecosystem Identity";
      }
    }
  });
}
