// North & Oak — store logic: listing, filters, sort and cart.
// Product data lives in products.js (PRODUCTS).

const grid = document.getElementById("productGrid");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filtersEl = document.getElementById("categoryFilters");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartFootEl = document.getElementById("cartFoot");
const cartCountEl = document.getElementById("cartCount");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const shippingNoteEl = document.getElementById("shippingNote");
const cartHeadCountEl = document.getElementById("cartHeadCount");

const toastEl = document.getElementById("toast");
const checkoutModal = document.getElementById("checkoutModal");

const CART_KEY = "north-oak-cart-v1";
const FREE_SHIPPING_OVER = 75;

const state = {
  category: "All",
  search: "",
  sort: "featured",
  // cart is a list of { id, qty } — product details are looked up from PRODUCTS
  cart: loadCart()
};

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

function productById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) return [];
    // drop anything that no longer exists in the catalogue
    return saved.filter((item) => productById(item.id) && item.qty > 0);
  } catch (err) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

// ---------- Product listing ----------

function starRow(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getVisibleProducts() {
  const term = state.search.trim().toLowerCase();

  let list = PRODUCTS.filter((p) => {
    const inCategory = state.category === "All" || p.category === state.category;
    const inSearch = term === "" || p.name.toLowerCase().includes(term);
    return inCategory && inSearch;
  });

  // "featured" just keeps the order from products.js
  if (state.sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return list;
}

function renderProducts() {
  const list = getVisibleProducts();

  resultsCount.textContent =
    "Showing " + list.length + (list.length === 1 ? " product" : " products");
  noResults.hidden = list.length !== 0;
  grid.hidden = list.length === 0;

  grid.innerHTML = list.map((p) => `
    <article class="card">
      <div class="card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="badge ${p.badge === "Sale" ? "badge-sale" : ""}">${p.badge}</span>` : ""}
      </div>
      <div class="card-body">
        <p class="card-category">${p.category}</p>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-blurb">${p.blurb}</p>
        <p class="card-rating">
          <span class="stars" aria-hidden="true">${starRow(p.rating)}</span>
          <span class="rating-num">${p.rating.toFixed(1)} / 5</span>
        </p>
        <div class="card-foot">
          <span class="price">${formatMoney(p.price)}${p.oldPrice ? `<span class="price-old">${formatMoney(p.oldPrice)}</span>` : ""}</span>
          <button type="button" class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ---------- Cart ----------

function cartTotals() {
  let count = 0;
  let subtotal = 0;
  for (const item of state.cart) {
    const product = productById(item.id);
    count += item.qty;
    subtotal += product.price * item.qty;
  }
  return { count, subtotal };
}

function renderCart() {
  const { count, subtotal } = cartTotals();

  cartCountEl.textContent = count;
  cartHeadCountEl.textContent = count ? `(${count})` : "";

  const isEmpty = state.cart.length === 0;
  cartEmptyEl.hidden = !isEmpty;
  cartFootEl.hidden = isEmpty;

  cartItemsEl.innerHTML = state.cart.map((item) => {
    const p = productById(item.id);
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="">
        <div>
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${formatMoney(p.price)} each</p>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-dec="${p.id}" aria-label="Decrease quantity of ${p.name}">−</button>
            <span aria-label="Quantity">${item.qty}</span>
            <button type="button" class="qty-btn" data-inc="${p.id}" aria-label="Increase quantity of ${p.name}">+</button>
          </div>
          <br>
          <button type="button" class="remove-btn" data-remove="${p.id}">Remove</button>
        </div>
        <span class="cart-item-total">${formatMoney(p.price * item.qty)}</span>
      </div>`;
  }).join("");

  cartSubtotalEl.textContent = formatMoney(subtotal);
  shippingNoteEl.textContent = subtotal >= FREE_SHIPPING_OVER
    ? "Your order qualifies for free shipping."
    : "Add " + formatMoney(FREE_SHIPPING_OVER - subtotal) + " more for free shipping.";
}

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(productById(id).name + " added to cart");
}

function changeQty(id, delta) {
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((i) => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

// ---------- Drawer / modal / toast ----------

let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.hidden = false;
  document.getElementById("cartCloseBtn").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
}

// ---------- Events (delegation where it makes sense) ----------

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add);
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (!btn) return;
  state.category = btn.dataset.category;
  filtersEl.querySelectorAll(".pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill === btn);
  });
  renderProducts();
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderProducts();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderProducts();
});

document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  state.search = "";
  state.category = "All";
  searchInput.value = "";
  filtersEl.querySelectorAll(".pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill.dataset.category === "All");
  });
  renderProducts();
});

cartItemsEl.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const rem = e.target.closest("[data-remove]");
  if (inc) changeQty(inc.dataset.inc, 1);
  if (dec) changeQty(dec.dataset.dec, -1);
  if (rem) removeFromCart(rem.dataset.remove);
});

document.getElementById("cartOpenBtn").addEventListener("click", openCart);
document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
document.getElementById("keepShoppingBtn").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.getElementById("checkoutBtn").addEventListener("click", () => {
  checkoutModal.hidden = false;
  document.getElementById("checkoutCloseBtn").focus();
});

document.getElementById("checkoutCloseBtn").addEventListener("click", () => {
  checkoutModal.hidden = true;
});

checkoutModal.addEventListener("click", (e) => {
  if (e.target === checkoutModal) checkoutModal.hidden = true;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    checkoutModal.hidden = true;
  }
});

// First render
renderProducts();
renderCart();
