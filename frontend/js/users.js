// ==========================================================================
// HAMBAK TECH & SERVICES - LIVE ECOSYSTEM USER DIRECTORY FETCH ENGINE
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const usersGridElement = document.querySelector(".users-grid");
    const searchInputElement = document.getElementById("userSearch");
    const BASE_URL = "https://hambak-tech-services.onrender.com/api";

    // 1. SECURE GATEWAY CHECK: Retrieve authentication tokens from localStorage
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
        usersGridElement.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff4081; font-weight: 700;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
                <p>Access Revoked: Please log in with a valid administrator session to view platform system records.</p>
            </div>`;
        return;
    }

    let ecosystemUsersRegistry = [];

    // 2. RUN REAL-TIME DATA ACQUISITION
    try {
        usersGridElement.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #f5b942;">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
                <p>Querying dynamic MongoDB cloud infrastructure databases...</p>
            </div>`;

        const response = await fetch(`${BASE_URL}/admin/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${savedToken}`,
                "Content-Type": "application/json"
            }
        });

        const outcomeData = await response.json();

        // Check response array pattern based on your existing backend layout
        ecosystemUsersRegistry = Array.isArray(outcomeData) ? outcomeData : (outcomeData.users || []);

        if (!response.ok || ecosystemUsersRegistry.length === 0) {
            usersGridElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                    <p>No functional system nodes or registered users discovered in cluster.</p>
                </div>`;
            return;
        }

        // 3. EXECUTE INITIAL RENDER
        renderUserClusterCards(ecosystemUsersRegistry);

    } catch (error) {
        console.error("Dynamic User Acquisition Crash Trace:", error);
        usersGridElement.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff4081;">
                <p>Internal network pipeline aggregation error parsing MongoDB records.</p>
            </div>`;
    }

    // 4. CLIENT-SIDE LIVE INTERACTION SEARCH LOGIC
    if (searchInputElement) {
        searchInputElement.addEventListener("input", () => {
            const searchString = searchInputElement.value.toLowerCase().trim();
            const filteredUsers = ecosystemUsersRegistry.filter(user => {
                return (
                    (user.name && user.name.toLowerCase().includes(searchString)) ||
                    (user.username && user.username.toLowerCase().includes(searchString)) ||
                    (user.email && user.email.toLowerCase().includes(searchString)) ||
                    (user.role && user.role.toLowerCase().includes(searchString))
                );
            });
            renderUserClusterCards(filteredUsers);
        });
    }

    // 5. RENDERING CORE STRUCTURAL LAYOUT BUILDER
    function renderUserClusterCards(usersList) {
        usersGridElement.innerHTML = ""; // Clear loader/previous data

        usersList.forEach(user => {
            const userCardNode = document.createElement("div");
            userCardNode.className = "profile-card";

            // Define badge states cleanly based on database roles
            const isSystemOwner = user.role === "admin";
            const badgeClass = isSystemOwner ? "status-badge active" : "status-badge offline";
            const badgeLabel = isSystemOwner ? "System Owner" : "Platform Node";
            const iconMarkup = isSystemOwner ? '<i class="fa-solid fa-user-gear"></i>' : '<i class="fa-solid fa-user-tie"></i>';

            userCardNode.innerHTML = `
                <span class="${badgeClass}" style="${!isSystemOwner ? 'border-color: #f5b942; color: #f5b942; background: rgba(245,185,66,0.1);' : ''}">${badgeLabel}</span>
                <div class="avatar-wrapper" style="${!isSystemOwner ? 'border-color: #f5b942;' : ''}">
                    ${iconMarkup}
                </div>
                <h3>${user.name || "Anonymous Node"}</h3>
                <span class="profile-role">${user.role ? user.role.toUpperCase() : "CUSTOMER"}</span>
                <div class="profile-details">
                    <p><span class="label">Username:</span> <span>@${user.username || "n/a"}</span></p>
                    <p><span class="label">Email Link:</span> <span style="font-size: 0.8rem; word-break: break-all;">${user.email || "n/a"}</span></p>
                    <p><span class="label">Wallet Balance:</span> <span style="color: #10b981; font-weight: 700;">₦${(user.walletBalance || 0).toLocaleString()}</span></p>
                </div>
                <button class="action-btn" onclick="alert('Targeting user system reference ID: ${user._id}')">Manage Node</button>
            `;
            usersGridElement.appendChild(userCardNode);
        });
    }
});
