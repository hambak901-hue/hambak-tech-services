// ==========================================================================
// HAMBAK TECH & SERVICES - ECOSYSTEM WALLET & SESSIONS SECURITY GUARD
// ==========================================================================

async function checkWalletAuthentication() {
    const savedToken = localStorage.getItem("token");
    const BASE_URL = "https://hambak-tech-services.onrender.com/api";

    // 1. If no token exists, immediately halt operation and redirect to login
    if (!savedToken) {
        alert("Authentication Required: Please sign in or create an account to perform wallet transactions.");
        window.location.href = "login.html";
        return null;
    }

    try {
        // 2. Query the exact logged-in individual's data matrix
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${savedToken}`,
                "Content-Type": "application/json"
            }
        });

        // 3. If the token has expired (401 error), redirect them to sign in again
        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Session Expired: Please log back in to verify your available balance.");
            window.location.href = "login.html";
            return null;
        }

        const data = await response.json();
        const activeUser = data.user || data;

        // 4. Update the wallet display on the current interface dynamically
        const walletDisplayElement = document.getElementById("walletBalanceDisplay");
        if (walletDisplayElement && activeUser) {
            walletDisplayElement.innerText = `₦${Number(activeUser.walletBalance || 0).toLocaleString()}`;
        }

        return activeUser; // Returns only the specific logged-in user's data array

    } catch (error) {
        console.error("Auth Guard Network Validation Error:", error);
        return null;
    }
}

// Automatically execute session confirmation on page initialization
document.addEventListener("DOMContentLoaded", checkWalletAuthentication);
