/* ==========================================================================
   HAMBAK TECH SERVICES: UNIFIED CATALOG MATRIX & RENDER ENGINE
   ========================================================================== */

async function loadDynamicServices() {
  const servicesContainer = document.getElementById("servicesGrid");
  if (!servicesContainer) return;

  const RENDER_ROOT = "https://hambak-tech-services.onrender.com";
  const BACKEND_SERVICE_API = `${RENDER_ROOT}/api`;

  try {
    const queryPipelineUrl = `${BACKEND_SERVICE_API}/services`;
    const fetchStreamResponse = await fetch(queryPipelineUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!fetchStreamResponse.ok) return; // Pristine HTML fallback static fallback preservation

    const servicesArray = await fetchStreamResponse.json();

    if (Array.isArray(servicesArray) && servicesArray.length > 0) {
      servicesContainer.innerHTML = ""; // Clear fallback block safely

      servicesArray.forEach(item => {
        const parsedCardWrapper = document.createElement("div");
        parsedCardWrapper.className = "service-card";

        // Category-driven icon selection matrix engine
        let iconClass = "fa-solid fa-briefcase";
        const category = item.category ? item.category.toLowerCase() : "";
        
        if (category.includes("nin")) iconClass = "fa-solid fa-id-card";
        if (category.includes("print") || category.includes("photocopy")) iconClass = "fa-solid fa-print";
        if (category.includes("vtu") || category.includes("data") || category.includes("airtime")) iconClass = "fa-solid fa-sim-card";
        if (category.includes("exam") || category.includes("jamb") || category.includes("waec") || category.includes("training") || category.includes("computer")) iconClass = "fa-solid fa-graduation-cap";
        if (category.includes("design") || category.includes("graphics")) iconClass = "fa-solid fa-palette";

        // Direct static route normalization 
        let graphicBannerAsset = "";
        if (item.image) {
          const imagePath = item.image.startsWith("http") ? item.image : `${RENDER_ROOT}${item.image.startsWith("/") ? "" : "/"}${item.image}`;
          graphicBannerAsset = `<img src="${imagePath}" style="width:100%; height:200px; object-fit:cover; border-radius:14px; margin-bottom:20px; border: 1px solid rgba(255, 255, 255, 0.1);">`;
        }

        const fallbackDesc = "Custom digital workspace utility configuration deployed on live server cluster infrastructure.";

        parsedCardWrapper.innerHTML = `
          ${graphicBannerAsset}
          <div class="service-icon">
            <i class="${iconClass}"></i>
          </div>
          <h3>${item.name || 'Custom Service'}</h3>
          <p>${item.description || fallbackDesc}</p>
          <div class="price-tag">₦${Number(item.price || 0).toLocaleString()}</div>
          <button onclick="checkoutService('${item._id || item.id}', '${item.category || ''}')" class="service-btn">Instantiate Order Node</button>
        `;
        servicesContainer.appendChild(parsedCardWrapper);
      });
    }
  } catch (err) {
    console.error("Upstream ingestion bypassed; keeping static fallback structural cards functional:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDynamicServices);
