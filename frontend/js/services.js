/* ==========================================================
   HAMBAK TECH SERVICES: SERVICES RENDER ENGINE
   ========================================================== */
const API_URL = "https://hambak-tech-services.onrender.com/api/services";

async function loadServices() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const servicesContainer = document.getElementById("servicesContainer");

    if (!servicesContainer) return; // Guard clause against multi-page asset execution crashes
    servicesContainer.innerHTML = "";

    if (data.success && data.services.length > 0) {
      data.services.forEach(service => {
        // Determine icons dynamically based on category
        let iconClass = "fas fa-laptop-code";
        if (service.category.toLowerCase().includes("nin")) iconClass = "fas fa-id-card";
        if (service.category.toLowerCase().includes("print")) iconClass = "fas fa-print";
        if (service.category.toLowerCase().includes("vtu")) iconClass = "fas fa-mobile-alt";
        if (service.category.toLowerCase().includes("exam")) iconClass = "fas fa-user-graduate";

        servicesContainer.innerHTML += `
          <div class="service-card glass">
            <i class="${iconClass}"></i>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
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
      servicesContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to resolve catalog services architecture.</p>`;
    }
  }
}

// Window attachment point to tie into order modal forms later
window.initiateOrderPlacement = (serviceId, price) => {
  console.log(`Routing interaction flow to service ID: ${serviceId} with price ₦${price}`);
  // If your frontend uses an ordering modal setup, toggle it open here
};

// Fire on document context generation
document.addEventListener("DOMContentLoaded", loadServices);
