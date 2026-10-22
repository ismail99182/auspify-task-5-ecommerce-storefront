# North & Oak — E-commerce Storefront (Task 5)

This is my Task 5 submission for the Auspify front-end internship: a small
storefront for a fictional home goods shop called North & Oak. It is plain
HTML, CSS and vanilla JavaScript — no framework, no build step.

The shop sells a short, realistic range: lamps, mugs, notebooks, a backpack,
candles and a few other things I would actually buy. Prices are in USD and a
couple of items are on sale so the old-price display gets used.

## What it does

- Product grid rendered from a data array (nothing is hard-coded in the HTML)
- Filter by category (All, Lighting, Kitchen, Stationery, Carry, Home)
- Search by product name, as you type
- Sort by Featured, price low to high, price high to low, or rating
- Results count ("Showing X products") and a proper "no results" state with
  a button to clear the search and filters
- Product cards with image, category, rating stars, price (and old price on
  sale items) and badges for Sale / New / Bestseller items
- Responsive grid: 4 columns on desktop, 2 on tablet, 1 on small phones

## How the cart works

The cart is the part I spent the most time on:

- Clicking **Add to cart** adds the item and shows a small toast at the
  bottom of the screen. The count badge on the Cart button updates straight away.
- The cart opens as a drawer sliding in from the right. The overlay behind it,
  the close button, the Escape key or "Keep shopping" all close it again.
- Inside the drawer you can increase/decrease quantity (going down to zero
  removes the item) or remove an item outright. Each line shows its own total.
- The subtotal is worked out from the product data and the quantities every
  time the cart changes — it is never typed in by hand. There is also a note
  telling you how far you are from free shipping (over $75).
- The cart is saved to `localStorage` under the key `north-oak-cart-v1`, so
  it is still there after a refresh. Only the product id and quantity are
  saved; prices are always looked up from the product data, so a stale price
  can never sneak in from storage.
- An empty cart shows an empty state instead of a blank drawer.
- **Checkout** opens a small modal explaining that checkout is a demo. There
  is no payment form and nothing is charged — this is a front-end task only.

## Project structure

```
task-5-ecommerce-storefront/
├── index.html        Page layout, toolbar, cart drawer and checkout modal
├── css/
│   └── style.css     All styling, including the drawer and responsive grid
├── js/
│   ├── products.js   The product data (PRODUCTS array) on its own
│   └── app.js        Rendering, filtering/search/sort, cart state and events
└── README.md
```

I kept `products.js` separate on purpose: adding a product should mean adding
one object to an array, not editing rendering code.

## How to run

Open `index.html` in a browser. That is it — no server or install needed.
(If your browser is strict about local files, running any tiny static server
from this folder, e.g. `npx serve .`, works too.)

## Notes

- Product photos are hot-linked from Unsplash (`images.unsplash.com`), so an
  internet connection is needed for the images to load.
- Ratings are shown as filled/empty stars with the numeric rating next to
  them, rounded to the nearest star.
- Everything here is sample data for the internship task — North & Oak is not
  a real shop and no orders can actually be placed.
