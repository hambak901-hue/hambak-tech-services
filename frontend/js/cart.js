/* ==========================================================================
   HAMBAK TECH SERVICES: SHOPPING CART MANAGEMENT ENGINE
   ========================================================================== */

let cartItems = JSON.parse(localStorage.getItem("hambak_cart")) || [];

// Render the cart items array dynamically to the view layer
function displayCartContents() {
  const tableBody = document.getElementById("cartTableBody");
  const emptyNotice = document.getElementById("emptyCartNotice");
  const checkoutSection = document.getElementById("cartSummarySection");
  const totalPriceElement = document.getElementById("cartTotalSum");

  if (!tableBody) return;

  // If cart is empty, toggle fallback presentation view blocks
  if (cartItems.length === 0) {
    emptyNotice.style.display = "block";
    checkoutSection.style.display = "none";
    tableBody.innerHTML = "";
    return;
  }

  emptyNotice.style.display = "none";
  checkoutSection.style.display = "block";
  tableBody.innerHTML = "";

  let totalSum = 0;

  cartItems.forEach((item, index) => {
    const itemCost = Number(item.price) * Number(item.quantity || 1);
    totalSum += itemCost;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="cart-item-meta">
          <strong>${item.name}</strong>
        </div>
      </td>
      <td>₦${Number(item.price).toLocaleString()}</td>
      <td>
        <div class="quantity-control-cluster">
          <button onclick="alterQuantity(${index}, -1)" class="qty-btn"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-display">${item.quantity || 1}</span>
          <button onclick="alterQuantity(${index}, 1)" class="qty-btn"><i class="fa-solid fa-plus"></i></button>
        </div>
      </td>
      <td>₦${itemCost.toLocaleString()}</td>
      <td>
        <button onclick="removeCartItem(${index})" class="remove-item-btn" aria-label="Delete Item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  totalPriceElement.innerText = `₦${totalSum.toLocaleString()}`;
}

// Increment or Decrement Quantities Safely
window.alterQuantity = function(index, delta) {
  if (cartItems[index]) {
    cartItems[index].quantity = (cartItems[index].quantity || 1) + delta;
    
    if (cartItems[index].quantity <= 0) {
      cartItems.splice(index, 1);
    }
    
    saveAndSyncCartState();
  }
};

// Remove a specific row line item entirely
window.removeCartItem = function(index) {
  if (cartItems[index]) {
    cartItems.splice(index, 1);
    saveAndSyncCartState();
  }
};

function saveAndSyncCartState() {
  localStorage.setItem("hambak_cart", JSON.stringify(cartItems));
  displayCartContents();
}

// Processing Checkout Nodes
window.instantiateCartCheckout = function() {
  if (cartItems.length === 0) return;

  const token = localStorage.getItem("token") || localStorage.getItem("hambak_token");
  
  // Build clean human-readable WhatsApp text string matching business specifications
  let manifestText = "Hello Hambak Tech and Services, I want to complete a purchase order for the following items:\n\n";
  let runningTotal = 0;

  cartItems.forEach((item, index) => {
    const cost = Number(item.price) * Number(item.quantity || 1);
    runningTotal += cost;
    manifestText += `${index + 1}. ${item.name} (x${item.quantity || 1}) - ₦${cost.toLocaleString()}\n`;
  });

  manifestText += `\n*Grand Total Aggregate:* ₦${runningTotal.toLocaleString()}`;

  // Redirect instantly to business WhatsApp customer channel routing profile
  const encodedUri = `https://wa.me/2349127469686?text=${encodeURIComponent(manifestText)}`;
  
  // Optional: Clear cart after handoff
  localStorage.removeItem("hambak_cart");
  window.location.href = encodedUri;
};

document.addEventListener("DOMContentLoaded", displayCartContents);
