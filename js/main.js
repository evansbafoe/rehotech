(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 1) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();



  let cart = [];
const cartDetails = document.getElementById('cart-details');
const cartItems = document.getElementById('cart-items');
const totalCost = document.getElementById('total-cost');
const cartCount = document.getElementById('cart-count');
// Load on page start
window.onload = () => {
  loadCartFromLocalStorage();
  loadStockFromLocalStorage();     // optional
  initializeStockDisplay();        // optional
};

// 🛒 Add to cart
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();

    const productItem = button.closest('.product-item');
    const productName = productItem.querySelector('a.d-block.h5.mb-2').textContent.trim();
    const productPrice = parseFloat(productItem.querySelector('.text-primary.me-1').textContent.replace('₵', ''));
    const stockCountEl = productItem.querySelector('.stock-count');
    let currentStock = parseInt(stockCountEl?.textContent || "0");

    // ✅ Check stock before adding
    if (currentStock <= 0) {
      showRestockMessage(`${productName} is out of stock. We will restock shortly.`);
      return;
    }

    // ✅ Add or update item in cart
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.timestamp = new Date().getTime();
    } else {
      cart.push({ name: productName, price: productPrice, quantity: 1, timestamp: new Date().getTime() });
    }

    updateCartCount();
    saveCartToLocalStorage();
    updateCartDetails();
  });
});

const orderBtn = document.getElementById("place-order-btn");
if (orderBtn) {
  orderBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("❌ Your cart is empty!");
      return;
    }

    let message = "🛒 *New Order from Website*\n\n";
    cart.forEach(item => {
      message += `• ${item.name} x${item.quantity} - ₵${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\n💰 *Total:* ₵${total.toFixed(2)}\n\nPlease confirm and process this order.`;

    const phoneNumber = "233542853424"; // 🔁 Replace with your real WhatsApp number (no + or spaces)
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank"); // ✅ Open in new tab

    
    cart = [];
    updateCartCount();
    updateCartDetails();
    saveCartToLocalStorage();
    saveStockToLocalStorage();

    alert("✅ Order opened in WhatsApp, Please proceed for payment. Thanks");
  });
}


  document.querySelector('.cart-icon').addEventListener('click', () => {
    cartDetails.style.display = cartDetails.style.display === 'none' ? 'block' : 'none';
  });

  function updateCartDetails() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} (x${item.quantity}) - ₵${(item.price * item.quantity).toFixed(2)}
      <button class="remove-item" data-index="${index}" style="margin-left:5px; color: red; cursor: pointer;">x</button>
    `;
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  totalCost.textContent = total.toFixed(2);

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeFromCart(index);
    });
  });
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const item = cart[index];
    item.quantity -= 1;

    
    // Remove product from cart if quantity is 0
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }

    updateCartCount();
    saveCartToLocalStorage();
    saveStockToLocalStorage();
    updateCartDetails();
  }
}
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalItems;
}


  function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    const currentTime = new Date().getTime();
    cart = cart.filter(item => (currentTime - item.timestamp) < 2 * 60 * 60 * 1000);
    updateCartCount();
    updateCartDetails();
  }
}

  

  function initializeStockDisplay() {
  const stockData = JSON.parse(localStorage.getItem("stock")) || {};

  document.querySelectorAll(".product-item").forEach(item => {
    const nameEl = item.querySelector("a.d-block.h5.mb-2");
    if (!nameEl) return;

    const name = nameEl.textContent.trim();
    let stock = stockData[name] ?? item.getAttribute("data-stock") ?? "0";

    // Create .stock element if missing
    let stockEl = item.querySelector(".stock");
    if (!stockEl) {
      stockEl = document.createElement("div");
      stockEl.className = "stock";
      item.appendChild(stockEl);
    }

    // Create .stock-count element if missing
    let countSpan = stockEl.querySelector(".stock-count");
    if (!countSpan) {
      countSpan = document.createElement("span");
      countSpan.className = "stock-count";
      stockEl.innerHTML = "Stock: ";
      stockEl.appendChild(countSpan);
    }

    // Set values
    countSpan.textContent = stock;
    item.setAttribute("data-stock", stock);

    // Optional: Disable "Add to Cart" if out of stock
    
  });
}


  // ✅ Add restockProduct function
  function restockProduct(productName, newStock) {
    document.querySelectorAll('.product-item').forEach(item => {
      const name = item.querySelector('a.d-block.h5.mb-2').textContent.trim();
      if (name === productName.trim()) {
        item.setAttribute('data-stock', newStock);
        const stockCountEl = item.querySelector('.stock-count');
        stockCountEl.textContent = newStock;

        const button = item.querySelector('.add-to-cart');
        if (newStock > 0) {
          button.disabled = false;
          button.textContent = "Add to Cart";
        }

        saveStockToLocalStorage();
      }
    });
  }

  // ✅ Add restockFromForm function
  window.restockFromForm = function () {
    const name = document.getElementById('restock-name').value;
    const value = parseInt(document.getElementById('restock-amount').value);
    if (name && !isNaN(value)) {
      restockProduct(name, value);
      alert(`"${name}" restocked to ${value}`);
    } else {
      alert("Enter a valid product name and stock number.");
    }
  };
 // WOW.js Animation
  new WOW().init();

  // Fixed Navbar
  $(window).scroll(function () {
    if ($(window).width() < 992) {
      $('.fixed-top').toggleClass('bg-white shadow', $(this).scrollTop() > 45);
    } else {
      $('.fixed-top').toggleClass('bg-white shadow', $(this).scrollTop() > 45)
                     .css('top', $(this).scrollTop() > 45 ? -45 : 0);
    }
  });

  // Back to top
  $(window).scroll(function () {
    $('.back-to-top').fadeToggle($(this).scrollTop() > 300);
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
    return false;
  });

  // Owl Carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 25,
    loop: true,
    center: true,
    dots: false,
    nav: true,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>'
    ],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 }
    }
  });
  
 
  // 🔍 Search functionality
const searchBox = document.getElementById('search-box');
const searchMessage = document.getElementById('search-message'); // make sure this exists in HTML

if (searchBox) {
  searchBox.addEventListener('input', () => {
    const searchTerm = searchBox.value.toLowerCase();
    const products = document.querySelectorAll('.product-item');
    let found = false;

    products.forEach(product => {
      const name = product.querySelector('a.d-block.h5.mb-2').textContent.toLowerCase();
      if (name.includes(searchTerm)) {
        product.style.display = 'block';
        found = true;
      } else {
        product.style.display = 'none';
      }
    });

    // Show or hide "Item not found" message
    if (searchTerm.trim() !== '' && !found) {
      if (searchMessage) searchMessage.style.display = 'block';
    } else {
      if (searchMessage) searchMessage.style.display = 'none';
    }
  });
}



  // WOW.js Animation
  new WOW().init();

  // Fixed Navbar
  $(window).scroll(function () {
    if ($(window).width() < 992) {
      $('.fixed-top').toggleClass('bg-white shadow', $(this).scrollTop() > 45);
    } else {
      $('.fixed-top').toggleClass('bg-white shadow', $(this).scrollTop() > 45)
                     .css('top', $(this).scrollTop() > 45 ? -45 : 0);
    }
  });

  // Back to top
  $(window).scroll(function () {
    $('.back-to-top').fadeToggle($(this).scrollTop() > 300);
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
    return false;
  });

  // Owl Carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 25,
    loop: true,
    center: true,
    dots: false,
    nav: true,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>'
    ],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 }
    }
  });
  

function showRestockPanelIfAdmin() {
  const password = prompt("Admin access only. Enter password:");

  if (password === "1E2E1133ba.,") {
    const panel = document.getElementById("restock-panel");
    const productSelect = document.getElementById("product-select");

    // Get existing stock and price data or default to empty
    let stockData = JSON.parse(localStorage.getItem("stock")) || {};
    let priceData = JSON.parse(localStorage.getItem("prices")) || {};

    // Ensure all products on the page are in stock and price data
    document.querySelectorAll(".product-item").forEach(item => {
      const nameEl = item.querySelector("a.d-block.h5.mb-2");
      const priceEl = item.querySelector(".text-primary.me-1");
      const stockCountEl = item.querySelector(".stock-count");

      if (!nameEl) return;

      const name = nameEl.textContent.trim();
      const price = priceEl ? parseFloat(priceEl.textContent.replace("₵", "")) : 0;
      const stock = stockCountEl ? parseInt(stockCountEl.textContent) : 0;

      // Add to stockData and priceData if missing
      if (!(name in stockData)) stockData[name] = stock;
      if (!(name in priceData)) priceData[name] = price;
    });

    // Update localStorage with complete product list
    localStorage.setItem("stock", JSON.stringify(stockData));
    localStorage.setItem("prices", JSON.stringify(priceData));

    // Now populate the dropdown
   productSelect.innerHTML = "";
for (const product in stockData) {
  const option = document.createElement("option");
  option.value = product;
  option.textContent = product;
  productSelect.appendChild(option);
}

    panel.style.display = "block";
  } else {
    alert("❌ Incorrect password!");
  }
}

window.showRestockPanelIfAdmin = showRestockPanelIfAdmin;

document.getElementById("restock-btn").addEventListener("click", () => {
  const product = document.getElementById("product-select").value;
  const qty = parseInt(document.getElementById("restock-qty").value);
  const newPrice = parseFloat(document.getElementById("new-price").value);

  if (!product || isNaN(qty) || qty < 0 || isNaN(newPrice) || newPrice < 0) {
    alert("❌ Please enter valid stock and price values.");
    return;
  }

  

  // Normalize product name for comparison
  const productNormalized = product.trim().toLowerCase();

  // Ensure all products on the page are in stock and price data
document.querySelectorAll(".product-item").forEach(item => {
  const nameEl = item.querySelector("a.d-block.h5.mb-2");
  const priceEl = item.querySelector(".text-primary.me-1");
  const stockCountEl = item.querySelector(".stock-count");

  if (!nameEl) return;

  const name = nameEl.textContent.trim();
  const price = priceEl ? parseFloat(priceEl.textContent.replace("₵", "")) : 0;
  const stock = stockCountEl ? parseInt(stockCountEl.textContent) : 0;

  // ✅ Add new products if missing
  if (!(name in stockData)) {
    stockData[name] = stock;
  }
  if (!(name in priceData)) {
    priceData[name] = price;
  }
});


     
   
  document.getElementById("restock-message").textContent = "✅ Stock and price updated!";
  setTimeout(() => {
    document.getElementById("restock-message").textContent = "";
  }, 3000);



// ✅ Confirmation
  document.getElementById("restock-message").textContent =
    `✅ ${product} updated: Stock = ${qty}, Price = ₵${newPrice.toFixed(2)}`;

  document.getElementById("restock-message").textContent = `✅ ${product} updated. Stock = ${qty}, Price = ₵${newPrice.toFixed(2)}`;
  // Update stock count on page
  document.querySelectorAll(".product-item").forEach(item => {
    const name = item.querySelector("a.d-block.h5.mb-2").textContent;
    if (name === product) {
      item.setAttribute("data-stock", stockData[product]);
      const stockCountEl = item.querySelector(".stock-count");
      const button = item.querySelector(".add-to-cart");
      if (stockCountEl) stockCountEl.textContent = stockData[product];
      if (button && stockData[product] > 0) {
        button.disabled = false;
        button.textContent = "Add to Cart";
      }
    }
  });
});
function updateCartDetails() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement('li');

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.style.marginLeft = '5px';
    removeBtn.style.color = 'black ';
    removeBtn.style.background = 'none';
    removeBtn.style.border = 'none';
    removeBtn.style.cursor = 'pointer';
    removeBtn.title = `Remove one ${item.name}`;

    // Add click handler
    removeBtn.addEventListener('click', () => {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart.splice(index, 1);
      }

      updateCartCount();
      updateCartDetails();
      saveCartToLocalStorage();
    });

    li.textContent = `${item.name} x${item.quantity} - ₵${(item.price * item.quantity).toFixed(2)}`;
    li.appendChild(removeBtn);
    cartItems.appendChild(li);

    total += item.price * item.quantity;
  });

  totalCost.textContent = total.toFixed(2);

  // ✅ Show/hide WhatsApp order button
  const orderSection = document.getElementById('order-section');
  if (orderSection) {
    orderSection.style.display = cart.length > 0 ? 'block' : 'none';
  }

  // ✅ Show/hide cart panel
  const cartDetails = document.getElementById('cart-details');
  if (cartDetails) {
    cartDetails.style.display = cart.length > 0 ? 'block' : 'none';
  }

  // ✅ Show/hide cart count badge
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'inline-block' : 'none';
  }
}


// ✅ Load stored prices and apply to product cards


const priceData = JSON.parse(localStorage.getItem("prices")) || {};
document.querySelectorAll(".product-item").forEach(item => {
  const name = item.querySelector("a.d-block.h5.mb-2").textContent.trim();
  const savedPrice = priceData[name];
  if (savedPrice !== undefined) {
    const priceSpan = item.querySelector(".text-primary.me-1");
    if (priceSpan) {
      priceSpan.textContent = `₵${parseFloat(savedPrice).toFixed(2)}`;
    }
  }
});


window.onload = () => {
  loadCartFromLocalStorage();
  loadStockFromLocalStorage();
  initializeStockDisplay();

  // ✅ Add this at the end
  const priceData = JSON.parse(localStorage.getItem("prices")) || {};
  document.querySelectorAll(".product-item").forEach(item => {
    const nameEl = item.querySelector("a.d-block.h5.mb-2");
    const priceEl = item.querySelector(".text-primary.me-1");

    if (!nameEl || !priceEl) return;

    const name = nameEl.textContent.trim();
    const savedPrice = priceData[name];
    if (savedPrice !== undefined) {
      priceEl.textContent = `₵${parseFloat(savedPrice).toFixed(2)}`;
    }
  });
};


 

function loadCartFromLocalStorage() {
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  if (savedCart && Array.isArray(savedCart)) {
    cart = savedCart;
    updateCartUI(); // Make sure this function displays cart items
  }
}


// Load on page load
window.onload = () => {
  loadCartFromLocalStorage();
  loadStockFromLocalStorage?.();     // Optional
  initializeStockDisplay?.();       // Optional
};

// Save cart
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/// Load from local storage
window.onload = () => {
  loadCartFromLocalStorage();
  loadStockFromLocalStorage?.(); // Optional, based on your existing stock system
  initializeStockDisplay?.();
};

function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
    updateCartDetails();
  }
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function updateCartDetails() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    const linePrice = item.price * item.quantity;
    li.innerHTML = `
      ${item.name} - ₵${item.price} × ${item.quantity} = ₵${linePrice.toFixed(2)}
      <button class="remove-item" data-index="${index}" style="margin-left:10px; color: red; cursor: pointer;">x</button>
    `;
    cartItems.appendChild(li);
    total += linePrice;
  });

  totalCost.textContent = total.toFixed(2);

  // Remove buttons
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', e => {
      const index = e.target.getAttribute('data-index');
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }

      updateCartCount();
      updateCartDetails();
      saveCartToLocalStorage();
    });
  });
}

// ✅ Add to cart
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();

    const productItem = button.closest('.product-item');
    const productName = productItem.querySelector('a.d-block.h5.mb-2').textContent.trim();
    const productPrice = parseFloat(productItem.querySelector('.text-primary.me-1').textContent.replace('₵', ''));
    
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
      existingItem.quantity += 0;
    } else {
      cart.push({ name: productName, price: productPrice, quantity: 0 });
    }

    updateCartCount();
    updateCartDetails();
    saveCartToLocalStorage();
  });
});
const searchIcon = document.getElementById('search-icon');
  const searchBoxWrapper = document.getElementById('search-box-wrapper');
  const searchInput = document.getElementById('search-box');

  searchIcon.addEventListener('click', () => {
    searchIcon.style.display = 'none';
    searchBoxWrapper.style.display = 'flex';
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchBoxWrapper.style.display = 'none';
      searchIcon.style.display = 'inline';
    }
  });

  searchInput.addEventListener('blur', () => {
    searchBoxWrapper.style.display = 'none';
    searchIcon.style.display = 'inline';
  });
  
})(jQuery);

