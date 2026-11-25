# FreshCart

FreshCart is an Angular storefront connected to the Route E-commerce API.

## Run locally

```bash
npm install
npm start
```

The app runs at `http://localhost:4200`. The API base URL is configured in `src/app/store.service.ts` as `https://ecommerce.routemisr.com/api/v1`.

## Included pages and API operations

- Home, product listings and search, product details, brand listings/details, and category listings/details.
- Sign in, registration, forgot-password verification/reset, and authenticated password changes.
- Authenticated cart display, add/remove/update quantities, and wishlist display/add/remove.
- Cash-on-delivery orders, hosted online checkout, and order history.

Protected account routes redirect visitors to sign in and return them to their requested page afterward. The API requires a valid account for cart, wishlist, checkout, and order operations.
