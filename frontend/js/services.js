/* ==========================================================
   HAMBAK TECH SERVICES: SERVICES RENDER ENGINE
   ========================================================== */
async function loadServices() {
  try {
    const servicesContainer = document.getElementById("servicesContainer");
    if (!servicesContainer) return; // Guard clause against multi-page execution crashes

    // Use unified matrix architecture layer instead of detached string endpoints
    if (!window.API || !window.API.services) {
      console.error("API Engine Missing: Ensure apiMatrix.js loads before services.js");
      return;
    }

    servicesContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>Syncing catalog matrix...</p></div>`;

    const data = await window.API.services.getAll();
    servicesContainer.innerHTML = "";

    if (data && data.services && data.services.length > 0) {
      data.services.forEach(service => {
        // Determine icons dynamically based on category
        let iconClass = "fas fa-laptop-code";
        const category = service.category ? service.category.toLowerCase() : "";
        
        if (category.includes("nin")) iconClass = "fas fa-id-card";
        if (category.includes("print") || category.includes("photocopy")) iconClass = "fas fa-print";
        if (category.includes("vtu") || category.includes("data") || category.includes("airtime")) iconClass = "fas fa-mobile-alt";
        if (category.includes("exam") || category.includes("jamb") || category.includes("waec")) iconClass = "fas fa-user-graduate";
        if (category.includes("design") || category.includes("graphics")) iconClass = "fas fa-paint-brush";

        servicesContainer.innerHTML += `
          <div class="service-card glass">
            <div class="service-icon-wrapper"><i class="${iconClass}"></i></div>
            <h3>${service.name}</h3>
            <p>${service.description || 'Premium digital utility processing service.'}</p>
            <span class="price-tag">₦${service.price.toLocaleString()}</span>
            <button class="service-btn" onclick="initiateOrderPlacement('${service._id}', ${service.price})">
              Order Service
            </button>
          </div>
        `;
      });
    } else {
      servicesContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p>No active workspace digital utilities available at this time.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Services Load Matrix Exception:", error);
    const servicesContainer = document.getElementById("servicesContainer");
    if (servicesContainer) {
      servicesContainer.innerHTML = `<p style="text-align:center; color:red; padding: 20px;">Failed to resolve catalog services architecture.</p>`;
    }
  }
}

// Window attachment point to tie into order modal forms later
window.initiateOrderPlacement = (serviceId, price) => {
  console.log(`Routing interaction flow to service ID: ${serviceId} with price ₦${price}`);
  // Custom hook point for triggering checkout system overlays
};

// Fire on document context generation
document.addEventListener("DOMContentLoaded", loadServices);
