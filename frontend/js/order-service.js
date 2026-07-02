/**
 * ==========================================================================
 * HAMBAK TECH & SERVICES - ORDER PLACEMENT ENGINE (PHASE 1)
 * ==========================================================================
 */

const BACKEND_SERVICE_API = "https://hambak-tech-services.onrender.com/api";
const parsedServiceTokenId = new URLSearchParams(window.location.search).get("id");

if (!parsedServiceTokenId) {
  alert("Operational Service Target Token is Missing. Routing to Directory Hub.");
  window.location.href = "services.html";
}

window.addEventListener("DOMContentLoaded", fetchTargetServiceInstance);

/**
 * Fetches the specific service cluster data from the API and maps it onto the UI
 */
async function fetchTargetServiceInstance() {
  try {
    const fetchResponse = await fetch(`${BACKEND_SERVICE_API}/services/${parsedServiceTokenId}`);
    const transactionPayload = await fetchResponse.json();
    
    if (!fetchResponse.ok || !transactionPayload.service) {
      throw new Error("Target cluster address returned negative values.");
    }

    const structuralServiceObj = transactionPayload.service;
    
    let cachedEcosystemProfile = { name: "", email: "", phone: "" };
    try {
      const userMetaPayload = localStorage.getItem("hambak_user") || localStorage.getItem("user");
      if (userMetaPayload) {
        cachedEcosystemProfile = JSON.parse(userMetaPayload);
      }
    } catch (storageErr) {
      console.error("Local data cache parsing bypass handled:", storageErr);
    }

    const imagePath = structuralServiceObj.image;
    const resolvedImage = imagePath.startsWith('http') ? imagePath : `${BACKEND_SERVICE_API}/../${imagePath}`.replace(/\/+/g, '/').replace('https:/', 'https://');

    // Inject layout structurally into target container
    document.getElementById("serviceContainer").innerHTML = `
      <div class="service-box">
        <div class="service-image-container">
          <img src="${resolvedImage}" class="service-image" alt="Hambak Asset">
        </div>

        <div class="service-details">
          <h2>${structuralServiceObj.name}</h2>
          <p>${structuralServiceObj.description}</p>
          
          <div class="calculation-summary-pane">
            <div class="summary-row">
              <span>Base Module Rate:</span>
              <span>₦${Number(structuralServiceObj.price).toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Quantity Variable:</span>
              <span id="summaryQty">1</span>
            </div>
            <div class="summary-row total">
              <span>Est. Price:</span>
              <span id="summaryTotal">₦${Number(structuralServiceObj.price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-box">
        <h2>Customer Verification Details</h2>
        
        <form id="orderForm" class="form-form-layout" enctype="multipart/form-data">
          <div class="form-group">
            <label for="customerName">Full Name</label>
            <input type="text" id="customerName" placeholder="Provide complete name criteria" value="${cachedEcosystemProfile.name || ''}" required>
          </div>

          <div class="form-group">
            <label for="customerEmail">Email Address</label>
            <input type="email" id="customerEmail" placeholder="verification@domain.com" value="${cachedEcosystemProfile.email || ''}" required>
          </div>

          <div class="form-group">
            <label for="customerPhone">Active Phone Number</label>
            <input type="text" id="customerPhone" placeholder="090XXXXXXXX" value="${cachedEcosystemProfile.phone || ''}" required>
          </div>

          <div class="form-group">
            <label for="quantity">Quantity Parameter</label>
            <input type="number" id="quantity" value="1" min="1" required>
          </div>

          <div class="form-group full-width">
            <label for="message">Detailed Task Instructions</label>
            <textarea id="message" placeholder="Provide distinct project briefs, formatting guides, or regional system requirements..."></textarea>
          </div>

          <div class="form-group full-width">
            <label>Reference Design Document / Passport Data (Max 15KB Target for Optimization)</label>
            <div class="file-upload-wrapper">
              <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--brand-gold); margin-bottom: 10px;"></i>
              <p style="margin:0; font-weight:600;">Click to explore directories or drop assets here</p>
              <p id="fileStatusTracker" class="file-info-text">No document attached yet</p>
              <input type="file" id="documentAssetFile">
            </div>
          </div>

          <button type="submit" class="submit-btn" id="checkoutActionBtn">Place Order</button>
        </form>
      </div>
    `;

    // Safely bind calculations and event streams once items exist inside the DOM tree
    attachDynamicCalculationEngine(structuralServiceObj);
    
    document.getElementById("documentAssetFile").addEventListener("change", function() {
      evaluateFileFootprint(this);
    });

  } catch (executionError) {
    console.error("Critical Asset Mapping Exception:", executionError);
    document.getElementById("serviceContainer").innerHTML = `
      <div class="loading" style="color:#ef4444;">
        <i class="fa-solid fa-triangle-exclamation"></i> Communication drop with Render cluster node. Please reload.
      </div>
    `;
  }
}

/**
 * Binds and runs pricing modifications dynamically based on typing exception criteria
 * @param {Object} serviceRef 
 */
function attachDynamicCalculationEngine(serviceRef) {
  const quantityInput = document.getElementById("quantity");
  const summaryQtyText = document.getElementById("summaryQty");
  const summaryTotalText = document.getElementById("summaryTotal");

  const lowerName = serviceRef.name.toLowerCase();
  
  // Note: Typing modifications utilize flat handling calculations based on business metrics
  const isTypingTask = lowerName.includes("typing") || lowerName.includes("transcription");

  function executePricingRecalculation() {
    let numericalQty = Math.max(1, parseInt(quantityInput.value) || 1);
    summaryQtyText.innerText = numericalQty;
    
    let calculatedOutputTotal = 0;
    if (isTypingTask) {
      calculatedOutputTotal = Number(serviceRef.price);
    } else {
      calculatedOutputTotal = Number(serviceRef.price) * numericalQty;
    }

    summaryTotalText.innerText = `₦${calculatedOutputTotal.toLocaleString()}`;
    return calculatedOutputTotal;
  }

  quantityInput.addEventListener("input", executePricingRecalculation);

  // Bind the isolated multi-part packet submit stream
  document.getElementById("orderForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const actionBtn = document.getElementById("checkoutActionBtn");
    actionBtn.disabled = true;
    actionBtn.innerText = "Transmitting Order Packet...";

    const finalizedTotalFee = executePricingRecalculation();
    const transportFormDataObject = new FormData();

    transportFormDataObject.append("customerName", document.getElementById("customerName").value.trim());
    transportFormDataObject.append("customerEmail", document.getElementById("customerEmail").value.trim());
    transportFormDataObject.append("customerPhone", document.getElementById("customerPhone").value.trim());
    transportFormDataObject.append("service", serviceRef._id);
    transportFormDataObject.append("quantity", quantityInput.value);
    transportFormDataObject.append("amount", finalizedTotalFee);
    transportFormDataObject.append("message", document.getElementById("message").value.trim());

    const primaryFileSelector = document.getElementById("documentAssetFile");
    if (primaryFileSelector.files.length > 0) {
      transportFormDataObject.append("file", primaryFileSelector.files[0]);
    }

    try {
      const pipelineToken = localStorage.getItem("token") || localStorage.getItem("hambak_token");
      const submissionHeaders = {};
      if (pipelineToken) {
        submissionHeaders["Authorization"] = `Bearer ${pipelineToken}`;
      }

      const processingResponse = await fetch(`${BACKEND_SERVICE_API}/orders`, {
        method: "POST",
        headers: submissionHeaders,
        body: transportFormDataObject
      });

      const dataFeedback = await processingResponse.json();

      if (processingResponse.ok || dataFeedback.success) {
        alert("Order placed successfully! Hambak Tech processing queue updated.");
        window.location.href = "services.html";
      } else {
        alert("Order compilation dropped: " + (dataFeedback.message || "Invalid validation context alignment."));
        actionBtn.disabled = false;
        actionBtn.innerText = "Place Order";
      }
    } catch (transmitErr) {
      console.error("Network Dispatch System Fault:", transmitErr);
      alert("Network execution failure. Couldn't clear cloud transmission nodes.");
      actionBtn.disabled = false;
      actionBtn.innerText = "Place Order";
    }
  });
}

/**
 * Tracks reference design file metrics to prevent heavy backend overheads
 * @param {HTMLInputElement} fileInputField 
 */
function evaluateFileFootprint(fileInputField) {
  const statusTrackerNode = document.getElementById("fileStatusTracker");
  const targetedFileObj = fileInputField.files[0];
  
  if (!targetedFileObj) {
    statusTrackerNode.innerText = "No document attached yet";
    statusTrackerNode.style.color = "#94a3b8";
    return;
  }

  const byteSizeInKb = targetedFileObj.size / 1024;
  statusTrackerNode.innerText = `${targetedFileObj.name} (${byteSizeInKb.toFixed(1)} KB)`;
  
  if (byteSizeInKb > 15) {
    statusTrackerNode.innerText += " - Note: Document exceeds recommended 15KB image optimization thresholds.";
    statusTrackerNode.style.color = "#f5b942";
  } else {
    statusTrackerNode.style.color = "#10b981";
  }
}
