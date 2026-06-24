/* ==========================================================================
   HAMBAK TECH SERVICES: RETAIL INVENTORY LOGIC & SHOPPING ENGINE
   ========================================================================== */

let internalCartItems = JSON.parse(localStorage.getItem("hambak_cart")) || [];

// Update Cart Badge Numbers Globally across UI views
function updateCartCounterUI() {
  const countLabel = document.getElementById("globalCartCount");
  if (countLabel) {
    const aggregatedSum = internalCartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
    countLabel.innerText = aggregatedSum;
  }
}

// Global scope instantiation for Add to Cart Button Actions
window.addToCart = function(productId, name, price) {
  const distinctCheck = internalCartItems.find(item => item.id === productId);
  if (distinctCheck) {
    distinctCheck.quantity += 1;
  } else {
    internalCartItems.push({ id: productId, name: name, price: Number(price), quantity: 1 });
  }
  localStorage.setItem("hambak_cart", JSON.stringify(internalCartItems));
  updateCartCounterUI();
  alert(`${name} added to cart successfully!`);
}

// Client Side UI filtering mechanisms
window.filterItems = function(targetCategory, event) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (event && event.target) {
    event.target.classList.add('active');
  }

  const itemCards = document.querySelectorAll('.product-card');
  itemCards.forEach(card => {
    if (targetCategory === 'all') {
      card.style.display = 'flex';
    } else {
      const cardCat = card.getAttribute('data-category') || '';
      cardCat.toLowerCase() === targetCategory.toLowerCase() ? card.style.display = 'flex' : card.style.display = 'none';
    }
  });
}

// API Ingestion Layer
async function ingestDatabaseProducts() {
  const catalogContainer = document.getElementById("productsGrid");
  if (!catalogContainer) return;

  const BACKEND_API = "https://hambak-tech-services.onrender.com/api";

  try {
    const networkResponse = await fetch(`${BACKEND_API}/products`);
    if (!networkResponse.ok) return; // Fall back to static items if endpoint is offline or asleep

    const dataPayload = await networkResponse.json();
    
    // Normalize data structure handling regardless if backend returns a direct array or wrapped inside an object
    const productsArray = Array.isArray(dataPayload) ? dataPayload : (dataPayload.products || null);

    if (productsArray && productsArray.length > 0) {
      catalogContainer.innerHTML = ""; // Safe to wipe hardcoded elements now

      productsArray.forEach(prod => {
        const layoutCard = document.createElement("div");
        layoutCard.className = "product-card";
        layoutCard.setAttribute("data-category", prod.category || "accessories");

        const assetImage = prod.image 
          ? (prod.image.startsWith('http') ? prod.image : `${BACKEND_API}/..${prod.image}`)
          : "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=500";

        layoutCard.innerHTML = `
          <div class="product-img" style="background: url('${assetImage}') center/cover;"></div>
          <div class="product-info">
            <div class="product-tag">${prod.category || "Accessories"}</div>
            <h3 class="product-title">${prod.name}</h3>
            <p class="product-desc">${prod.description || "Hambak certified technical retail item configuration product asset resource."}</p>
            <div class="product-meta">
              <div class="product-price">₦${Number(prod.price).toLocaleString()}</div>
              <button class="cart-btn" onclick="addToCart('${prod._id}', '${prod.name.replace(/'/g, "\\'")}', ${prod.price})">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
              </button>
            </div>
          </div>
        `;
        catalogContainer.appendChild(layoutCard);
      });
    }
  } catch (fault) {
    console.error("Retail product synchronization log trace fault context:", fault);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCounterUI();
  ingestDatabaseProducts();
});
