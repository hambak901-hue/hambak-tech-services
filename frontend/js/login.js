// ==========================================================================
// HAMBAK TECH & SERVICES - ECOSYSTEM AUTHENTICATION LOGIC ENGINE
// ==========================================================================

const authForm = document.getElementById("authForm");
const toggleForm = document.getElementById("toggleForm");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitBtn = document.getElementById("submitBtn");
const forgotPasswordWrapper = document.getElementById("forgotPasswordWrapper");

const nameWrapper = document.getElementById("nameWrapper");
const usernameWrapper = document.getElementById("usernameWrapper");
const phoneWrapper = document.getElementById("phoneWrapper");

const nameField = document.getElementById("nameField");
const usernameField = document.getElementById("usernameField");
const phoneField = document.getElementById("phoneField");
const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");
const togglePassword = document.getElementById("togglePassword");

const BASE_URL = "https://hambak-tech-services.onrender.com/api";

let loginMode = true;

// Password reveal visibility toggle module
if (togglePassword && passwordField) {
  togglePassword.addEventListener("click", () => {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      passwordField.type = "password";
      togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  });
}

// Layout field switcher (Login vs Register views)
if (toggleForm) {
  toggleForm.addEventListener("click", () => {
    loginMode = !loginMode;
    
    if (loginMode) {
      formTitle.innerHTML = "Customer Login";
      formSubtitle.innerHTML = "Access your dashboard & services";
      submitBtn.innerHTML = "Login";
      toggleForm.innerHTML = "Create New Account";
      if (forgotPasswordWrapper) forgotPasswordWrapper.style.display = "block";
      if (nameWrapper) nameWrapper.style.display = "none";
      if (usernameWrapper) usernameWrapper.style.display = "none";
      if (phoneWrapper) phoneWrapper.style.display = "none";
      
      if (emailField) emailField.placeholder = "Email Address or Username";
      if (nameField) nameField.removeAttribute("required");
      if (usernameField) usernameField.removeAttribute("required");
      if (phoneField) phoneField.removeAttribute("removeAttribute");
      
      if (passwordField) passwordField.setAttribute("autocomplete", "current-password");
    } else {
      formTitle.innerHTML = "Create Account";
      formSubtitle.innerHTML = "Join Hambak Tech & Services Ecosystem";
      submitBtn.innerHTML = "Register";
      toggleForm.innerHTML = "Already Have Account?";
      if (forgotPasswordWrapper) forgotPasswordWrapper.style.display = "none";
      if (nameWrapper) nameWrapper.style.display = "block";
      if (usernameWrapper) usernameWrapper.style.display = "block";
      if (phoneWrapper) phoneWrapper.style.display = "block";
      
      if (emailField) emailField.placeholder = "Email Address";
      if (nameField) nameField.setAttribute("required", "true");
      if (usernameField) usernameField.setAttribute("required", "true");
      if (phoneField) phoneField.setAttribute("required", "true");
      
      if (passwordField) passwordField.setAttribute("autocomplete", "new-password");
    }
  });
}

// Request processing stream
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputIdentityValue = emailField ? emailField.value.trim() : "";
    const password = passwordField ? passwordField.value : "";

    // PIPELINE WORKFLOW: USER REGISTRATION
    if (!loginMode) {
      const name = nameField ? nameField.value.trim() : "";
      const username = usernameField ? usernameField.value.trim() : "";
      const phone = phoneField ? phoneField.value.trim() : "";

      if (!name || !username || !phone || !inputIdentityValue || !password) {
        alert("Please clear all input parameter fields completely.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Registering Account...";

      try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email: inputIdentityValue, phone, password })
        });

        const data = await response.json();

        if (response.ok || data.success) {
          alert("Registration Successful!");
          // Safe form presentation switch back to login parameters
          loginMode = false; 
          toggleForm.click(); 
          if (emailField) emailField.value = inputIdentityValue;
          if (passwordField) passwordField.value = password;
        } else {
          alert("Registration Unsuccessful: " + (data.message || "Invalid setup metrics."));
        }
      } catch (error) {
        console.error("Critical Registry Interface Exception:", error);
        alert("Network execution failure or database sleeping. Please try again.");
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = "Register";
    }

    // PIPELINE WORKFLOW: USER SECURITY ACCESS LOGIN
    else {
      if (!inputIdentityValue || !password) {
        alert("Please fill your registered credential matrix values.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Authorizing Access...";

      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginIdentity: inputIdentityValue, password })
        });

        const data = await response.json();

        if (response.ok || data.success) {
          localStorage.setItem("hambak_user", JSON.stringify(data.user));
          localStorage.setItem("hambak_token", data.token);

          alert("Access Granted! Proceeding to Dashboard Area.");

          if (data.user && data.user.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "dashboard.html";
          }
        } else {
          alert("Authentication Denied: " + (data.message || "Mismatch password or identifier data parameters."));
        }
      } catch (error) {
        console.error("Critical Login Interface Exception:", error);
        alert("Database spin-up delay or connection dropped. Please wait a few seconds and re-submit.");
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = "Login";
    }
  });
}
