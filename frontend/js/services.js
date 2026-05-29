/* =========================
API URL CONFIGURATION
========================= */
const API_URL = "https://hambak-tech-services.onrender.com/api/services";

/* =========================
LOAD SERVICES FROM DATABASE
========================= */
async function loadServices() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const servicesContainer = document.getElementById("servicesContainer");

    if (!servicesContainer) return; // Prevent crashes if element isn't on the current page
    servicesContainer.innerHTML = "";

    if (data.success && data.services.length > 0) {
      data.services.forEach(service => {
        servicesContainer.innerHTML += `
          <div class="service-card glass">
            <div class="service-image">
              <img src="${service.image || 'https://via.placeholder.com/400x250'}" alt="${service.name}">
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="service-price">₦${service.price.toLocaleString()}</div>
            <button class="service-btn" onclick="window.location.href='order-service.html?id=${service._id}'">
              View Service
            </button>
          </div>
        `;
      });
    } else {
      servicesContainer.innerHTML = "<p>No services found at the moment.</p>";
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    const servicesContainer = document.getElementById("servicesContainer");
    if (servicesContainer) {
      servicesContainer.innerHTML = "<p>Unable to load services. Please try again later.</p>";
    }
  }
}

/* =========================
INITIALIZE CORE METHOD
========================= */
document.addEventListener("DOMContentLoaded", loadServices);
