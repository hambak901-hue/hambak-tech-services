/* ==========================================================================
   HAMBAK TECH SERVICES: UNIFIED CATALOG MATRIX & RENDER ENGINE
   ========================================================================== */

async function loadDynamicServices() {
  // Target your grid layout using the correct ID from your HTML
  const servicesContainer = document.getElementById("servicesGrid");
  if (!servicesContainer) return;

  const BACKEND_SERVICE_API = "https://hambak-tech-services.onrender.com/api";

  try {
    const queryPipelineUrl = `${BACKEND_SERVICE_API}/services`;
    const fetchStreamResponse = await fetch(queryPipelineUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!fetchStreamResponse.ok) return; // Silent bounce to preserve pristine HTML fallback static cards

    const servicesArray = await fetchStreamResponse.json();

    // Check if the response is a valid raw array from the backend pipeline
    if (Array.isArray(servicesArray) && servicesArray.length > 0) {
      servicesContainer.innerHTML = ""; // Clear fallback block safely now that dynamic data is confirmed

      servicesArray.forEach(item => {
        const parsedCardWrapper = document.createElement("div");
        parsedCardWrapper.className = "service-card";

        // Category-driven icon selection engine
        let iconClass = "fa-solid fa-briefcase";
        const category = item.category ? item.category.toLowerCase() : "";
        
        if (category.includes("nin")) iconClass = "fa-solid fa-id-card";
        if (category.includes("print") || category.includes("photocopy")) iconClass = "fa-solid fa-print";
        if (category.includes("vtu") || category.includes("data") || category.includes("airtime")) iconClass = "fa-solid fa-sim-card";
        if (category.includes("exam") || category.includes("jamb") || category.includes("waec") || category.includes("training") || category.includes("computer")) iconClass = "fa-solid fa-graduation-cap";
        if (category.includes("design") || category.includes("graphics")) iconClass = "fa-solid fa-palette";

        const graphicBannerAsset = item.image 
          ? `<img src="${item.image.startsWith('http') ? '' : BACKEND_SERVICE_API + '/..'}${item.image}" style="width:100%; height:200px; object-fit:cover; border-radius:14px; margin-bottom:20px; border: 1px solid var(--glass-border);">` 
          : "";

        parsedCardWrapper.innerHTML = `
          ${graphicBannerAsset}
          <div class="service-icon">
            <i class="${iconClass}"></i>
          </div>
          <h3>${item.name}</h3>
          <p>${item.description || "Custom digital workspace utility configuration deployed on live server cluster infrastructure."}</p>
          <div class="price-tag">₦${Number(item.price).toLocaleString()}</div>
          <button onclick="checkoutService('${item._id}', '${item.category}')" class="service-btn">Instantiate Order Node</button>
        `;
        servicesContainer.appendChild(parsedCardWrapper);
      });
    }
  } catch (err) {
    console.error("Upstream ingestion bypassed; keeping static fallback structural cards functional:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDynamicServices);
