import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService, Cart, Order, Product } from './store.service';

type AccountView = 'cart' | 'wishlist' | 'orders' | 'checkout';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell page-body">
      <div class="breadcrumbs"><a routerLink="/">Home</a><span>/</span><a routerLink="/cart" *ngIf="view === 'checkout'">Cart</a><span *ngIf="view === 'checkout'">/</span><span class="crumb-current">{{ title }}</span></div>
      <header class="page-title">
        <div class="page-title-main">
          <span class="title-icon"><i [class]="icon"></i></span>
          <div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
        </div>
        <a class="link-arrow" routerLink="/cart" *ngIf="view === 'checkout'"><i class="fa-solid fa-arrow-left"></i> Back to Cart</a>
        <a class="link-arrow" routerLink="/products" *ngIf="view !== 'checkout'"><i class="fa-solid fa-arrow-left"></i> Continue Shopping</a>
      </header>
      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <p class="feedback success" *ngIf="message">{{ message }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Loading…</div>

      <!-- CART -->
      <div class="two-col" *ngIf="view === 'cart' && !loading">
        <div class="card list-card" *ngIf="cart?.products?.length; else emptyCart">
          <div class="list-card-head"><strong>{{ cart?.products?.length }} item(s) in your cart</strong><button type="button" class="text-danger" (click)="clearCart()" [disabled]="busy"><i class="fa-regular fa-trash-can"></i> Clear Cart</button></div>
          <div class="cart-row" *ngFor="let item of cart?.products">
            <a class="cart-thumb" [routerLink]="['/product', item.product._id]"><img [src]="item.product.imageCover || placeholder" [alt]="item.product.title"></a>
            <div class="cart-product">
              <a [routerLink]="['/product', item.product._id]">{{ item.product.title }}</a>
              <small>{{ item.product.category?.name || 'Fresh picks' }}</small>
              <span class="unit-price">{{ item.price | currency:'EGP ':'symbol':'1.0-0' }} each</span>
            </div>
            <div class="quantity-control">
              <button type="button" (click)="setQuantity(item.product._id, item.count - 1)" [disabled]="busy || item.count <= 1" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
              <span>{{ item.count }}</span>
              <button type="button" (click)="setQuantity(item.product._id, item.count + 1)" [disabled]="busy" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
            </div>
            <strong class="line-price">{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong>
            <button type="button" class="icon-btn danger" (click)="removeCartItem(item.product._id)" [disabled]="busy" aria-label="Remove item"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
        <ng-template #emptyCart>
          <div class="card empty-state">
            <span class="empty-icon"><i class="fa-solid fa-cart-shopping"></i></span>
            <h2>Your cart is empty</h2><p>Looks like you haven't added anything to your cart yet.</p>
            <a class="btn btn-primary" routerLink="/products"><i class="fa-solid fa-store"></i> Start Shopping</a>
          </div>
        </ng-template>
        <aside class="card summary-card" *ngIf="cart?.products?.length">
          <div class="summary-head"><i class="fa-solid fa-receipt"></i><span><strong>Order Summary</strong><small>{{ cart?.products?.length }} item(s)</small></span></div>
          <div class="summary-body">
            <p><span>Subtotal</span><strong>{{ cart?.totalCartPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></p>
            <p><span>Shipping</span><strong class="free">FREE</strong></p>
            <div class="summary-total"><span>Total</span><strong>{{ (cart?.totalAfterDiscount || cart?.totalCartPrice) | currency:'EGP ':'symbol':'1.0-0' }}</strong></div>
            <a class="btn btn-primary wide" routerLink="/checkout"><i class="fa-solid fa-lock"></i> Proceed to Checkout</a>
            <div class="trust-row"><span><i class="fa-solid fa-shield-halved"></i> Secure</span><span><i class="fa-solid fa-truck"></i> Fast Delivery</span><span><i class="fa-solid fa-arrow-rotate-left"></i> Easy Returns</span></div>
          </div>
        </aside>
      </div>

      <!-- WISHLIST -->
      <ng-container *ngIf="view === 'wishlist' && !loading">
        <div class="product-grid" *ngIf="wishlist.length; else emptyWishlist">
          <article class="product-card" *ngFor="let product of wishlist">
            <div class="product-picture">
              <a class="product-image-link" [routerLink]="['/product', product._id]"><img [src]="product.imageCover || placeholder" [alt]="product.title" loading="lazy"></a>
              <div class="card-tools"><button type="button" (click)="removeWishlistItem(product._id)" [disabled]="busy" aria-label="Remove from wishlist" class="active"><i class="fa-solid fa-heart"></i></button></div>
            </div>
            <div class="product-info">
              <span class="product-category">{{ product.category?.name || 'Fresh picks' }}</span>
              <a class="product-title" [routerLink]="['/product', product._id]">{{ product.title }}</a>
              <div class="product-bottom"><div class="price"><strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong></div></div>
              <button type="button" class="btn btn-primary wide small" (click)="moveToCart(product)" [disabled]="busy"><i class="fa-solid fa-cart-shopping"></i> Move to Cart</button>
            </div>
          </article>
        </div>
        <ng-template #emptyWishlist>
          <div class="card empty-state">
            <span class="empty-icon"><i class="fa-regular fa-heart"></i></span>
            <h2>Your wishlist is empty</h2><p>Tap the heart on any product to save it here.</p>
            <a class="btn btn-primary" routerLink="/products"><i class="fa-solid fa-store"></i> Browse Products</a>
          </div>
        </ng-template>
      </ng-container>

      <!-- ORDERS -->
      <div class="orders-list" *ngIf="view === 'orders' && !loading">
        <article class="card order-card" *ngFor="let order of orders" [class.open]="expandedOrder === order._id">
          <div class="order-main">
            <span class="order-thumb"><img [src]="order.cartItems?.[0]?.product?.imageCover || placeholder" alt=""><b *ngIf="(order.cartItems?.length || 0) > 1">+{{ (order.cartItems?.length || 1) - 1 }}</b></span>
            <div class="order-info">
              <span class="status" [ngClass]="order.isDelivered ? 'delivered' : order.isPaid ? 'paid' : 'processing'"><i [class]="order.isDelivered ? 'fa-solid fa-circle-check' : order.isPaid ? 'fa-solid fa-credit-card' : 'fa-solid fa-clock'"></i> {{ order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Processing' }}</span>
              <strong class="order-number"># {{ order._id.slice(-6) | uppercase }}</strong>
              <div class="order-meta"><span><i class="fa-regular fa-calendar"></i> {{ order.createdAt | date:'MMM d, y' }}</span><span><i class="fa-solid fa-box"></i> {{ order.cartItems?.length || 0 }} items</span><span><i class="fa-solid fa-location-dot"></i> {{ order.shippingAddress?.city || '—' }}</span></div>
              <strong class="order-total">{{ order.totalOrderPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong>
            </div>
            <div class="order-side">
              <span class="pay-icon" [title]="order.paymentMethodType === 'card' ? 'Card' : 'Cash'"><i [class]="order.paymentMethodType === 'card' ? 'fa-regular fa-credit-card' : 'fa-solid fa-money-bill-wave'"></i></span>
              <button type="button" class="btn small" [class.btn-primary]="expandedOrder === order._id" [class.btn-light]="expandedOrder !== order._id" (click)="toggleOrder(order._id)">{{ expandedOrder === order._id ? 'Hide' : 'Details' }} <i class="fa-solid" [class.fa-chevron-up]="expandedOrder === order._id" [class.fa-chevron-down]="expandedOrder !== order._id"></i></button>
            </div>
          </div>
          <div class="order-details" *ngIf="expandedOrder === order._id">
            <h4><i class="fa-solid fa-receipt"></i> Order Items</h4>
            <div class="order-item" *ngFor="let item of order.cartItems">
              <img [src]="item.product.imageCover || placeholder" alt="">
              <span><strong>{{ item.product.title }}</strong><small>{{ item.count }} × {{ item.price | currency:'EGP ':'symbol':'1.0-0' }}</small></span>
              <strong>{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong>
            </div>
            <div class="order-boxes">
              <div class="info-box"><h5><i class="fa-solid fa-location-dot"></i> Delivery Address</h5><p><strong>{{ order.shippingAddress?.city || '—' }}</strong></p><p>{{ order.shippingAddress?.details }}</p><p><i class="fa-solid fa-phone"></i> {{ order.shippingAddress?.phone }}</p></div>
              <div class="info-box yellow"><h5><i class="fa-solid fa-clock"></i> Order Summary</h5><p><span>Subtotal</span><span>{{ order.totalOrderPrice | currency:'EGP ':'symbol':'1.0-0' }}</span></p><p><span>Shipping</span><span>Free</span></p><p class="total"><span>Total</span><strong>{{ order.totalOrderPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></p></div>
            </div>
          </div>
        </article>
        <div class="card empty-state" *ngIf="!orders.length">
          <span class="empty-icon"><i class="fa-solid fa-box-open"></i></span>
          <h2>No orders yet</h2><p>Your orders will show up here once you place one.</p>
          <a class="btn btn-primary" routerLink="/products"><i class="fa-solid fa-store"></i> Start Shopping</a>
        </div>
      </div>

      <!-- CHECKOUT -->
      <div class="two-col" *ngIf="view === 'checkout' && !loading">
        <form class="checkout-form" [formGroup]="form" (ngSubmit)="placeOrder()">
          <section class="card form-card">
            <div class="form-card-head"><i class="fa-solid fa-house"></i><span><strong>Shipping Address</strong><small>Where should we deliver your order?</small></span></div>
            <div class="form-card-body">
              <div class="info-note"><i class="fa-solid fa-circle-info"></i><span><strong>Delivery Information</strong><small>Please ensure your address is accurate for smooth delivery</small></span></div>
              <label>City <b>*</b><span class="input-icon"><i class="fa-solid fa-city"></i><input formControlName="city" placeholder="e.g. Cairo, Alexandria, Giza"></span></label>
              <label>Street Address <b>*</b><span class="input-icon textarea"><i class="fa-solid fa-location-dot"></i><textarea formControlName="details" rows="3" placeholder="Street name, building number, floor, apartment..."></textarea></span></label>
              <label>Phone Number <b>*</b><span class="input-icon"><i class="fa-solid fa-phone"></i><input formControlName="phone" type="tel" placeholder="01xxxxxxxxx"></span><small class="hint">Egyptian numbers only</small></label>
            </div>
          </section>
          <section class="card form-card">
            <div class="form-card-head"><i class="fa-regular fa-credit-card"></i><span><strong>Payment Method</strong><small>Choose how you'd like to pay</small></span></div>
            <div class="form-card-body">
              <label class="payment-option"><input type="radio" formControlName="payment" value="cash"><span class="payment-icon"><i class="fa-solid fa-money-bill-wave"></i></span><span><strong>Cash on Delivery</strong><small>Pay when your order arrives at your doorstep</small></span><i class="fa-solid fa-circle-check check"></i></label>
              <label class="payment-option"><input type="radio" formControlName="payment" value="online"><span class="payment-icon"><i class="fa-regular fa-credit-card"></i></span><span><strong>Pay Online</strong><small>Secure payment with Credit/Debit Card via Stripe</small></span><i class="fa-solid fa-circle-check check"></i></label>
              <div class="secure-note"><i class="fa-solid fa-shield-halved"></i><span><strong>Secure &amp; Encrypted</strong><small>Your payment info is protected with 256-bit SSL encryption</small></span></div>
            </div>
          </section>
        </form>
        <aside class="card summary-card">
          <div class="summary-head"><i class="fa-solid fa-bag-shopping"></i><span><strong>Order Summary</strong><small>{{ cart?.products?.length || 0 }} items</small></span></div>
          <div class="summary-body">
            <div class="summary-items">
              <div class="summary-item" *ngFor="let item of cart?.products">
                <img [src]="item.product.imageCover || placeholder" alt="">
                <span><strong>{{ item.product.title }}</strong><small>{{ item.count }} × {{ item.price | currency:'EGP ':'symbol':'1.0-0' }}</small></span>
                <strong>{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong>
              </div>
            </div>
            <p><span>Subtotal</span><strong>{{ cart?.totalCartPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></p>
            <p><span><i class="fa-solid fa-truck"></i> Shipping</span><strong class="free">FREE</strong></p>
            <div class="summary-total"><span>Total</span><strong>{{ (cart?.totalAfterDiscount || cart?.totalCartPrice) | currency:'EGP ':'symbol':'1.0-0' }}</strong></div>
            <button class="btn btn-primary wide" type="button" (click)="placeOrder()" [disabled]="busy || !cart?.products?.length">
              <span class="spinner small light" *ngIf="busy"></span>
              <i *ngIf="!busy" class="fa-solid fa-box"></i>
              {{ busy ? 'Processing…' : form.value.payment === 'online' ? 'Proceed to Payment' : 'Place Order' }}
            </button>
            <div class="trust-row"><span><i class="fa-solid fa-shield-halved"></i> Secure</span><span><i class="fa-solid fa-truck"></i> Fast Delivery</span><span><i class="fa-solid fa-arrow-rotate-left"></i> Easy Returns</span></div>
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class AccountComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly placeholder = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  view: AccountView = 'cart';
  loading = true;
  busy = false;
  error = '';
  message = '';
  cart: Cart | null = null;
  wishlist: Product[] = [];
  orders: Order[] = [];
  expandedOrder = '';
  readonly form = this.fb.group({
    details: ['', Validators.required],
    city: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    payment: ['cash' as 'cash' | 'online', Validators.required],
  });

  get title(): string {
    return { cart: 'Shopping Cart', wishlist: 'My Wishlist', orders: 'My Orders', checkout: 'Complete Your Order' }[this.view];
  }

  get icon(): string {
    return { cart: 'fa-solid fa-cart-shopping', wishlist: 'fa-solid fa-heart', orders: 'fa-solid fa-box', checkout: 'fa-solid fa-receipt' }[this.view];
  }

  get subtitle(): string {
    return {
      cart: 'Review your items before checkout',
      wishlist: 'Products you saved for later',
      orders: 'Track and manage your orders',
      checkout: 'Review your items and complete your purchase',
    }[this.view];
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.view = data['view'] as AccountView;
      this.load();
    });
  }

  setQuantity(productId: string, count: number): void {
    if (count < 1) return;
    this.busy = true;
    this.store.updateCartItem(productId, count).subscribe({
      next: (response) => { this.cart = response.data; },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; },
      complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  removeCartItem(productId: string): void {
    this.busy = true;
    this.store.removeFromCart(productId).subscribe({
      next: (response) => { this.cart = response.data; },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; },
      complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  removeWishlistItem(productId: string): void {
    this.busy = true;
    this.store.removeFromWishlist(productId).subscribe({
      next: (response) => { this.wishlist = response.data; },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; },
      complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  moveToCart(product: Product): void {
    this.busy = true;
    this.error = '';
    this.store.addToCart(product._id).subscribe({
      next: () => {
        this.store.removeFromWishlist(product._id).subscribe({
          next: (response) => {
            this.wishlist = response.data;
            this.message = 'Moved to your cart.';
            this.changeDetector.markForCheck();
          },
          error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
          complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
        });
      },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  clearCart(): void {
    this.busy = true;
    this.store.clearCart().subscribe({
      next: () => { if (this.cart) this.cart = { ...this.cart, products: [], totalCartPrice: 0 }; },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
      complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  toggleOrder(id: string): void {
    this.expandedOrder = this.expandedOrder === id ? '' : id;
  }

  placeOrder(): void {
    this.error = '';
    if (this.form.invalid || !this.cart?.products.length) {
      this.form.markAllAsTouched();
      this.error = this.form.invalid ? 'Please complete your delivery details.' : 'Your cart is empty.';
      return;
    }
    const shippingAddress = {
      details: this.form.value.details!,
      city: this.form.value.city!,
      phone: this.form.value.phone!,
    };
    const cartId = this.cart.cartId || this.cart._id;
    this.busy = true;
    if (this.form.value.payment === 'online') {
      this.store.onlineOrder(cartId, shippingAddress, window.location.origin).subscribe({
        next: (response) => {
          const checkoutUrl = response.session.url;
          if (!checkoutUrl) {
            this.error = 'The payment provider did not return a checkout link.';
            this.busy = false;
            this.changeDetector.markForCheck();
            return;
          }
          window.location.assign(checkoutUrl);
        },
        error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
      });
    } else {
      this.store.cashOrder(cartId, shippingAddress).subscribe({
        next: () => {
          this.message = 'Your order has been placed. Thank you!';
          this.busy = false;
          this.changeDetector.markForCheck();
          void this.router.navigateByUrl('/orders');
        },
        error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
      });
    }
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    if (this.view === 'wishlist') {
      this.store.wishlist().subscribe({
        next: (response) => { this.wishlist = response.data; },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }
    if (this.view === 'orders') {
      const user = this.store.getUser();
      if (!user?._id) {
        this.error = 'Your account details are missing. Please sign in again.';
        this.loading = false;
        this.store.clearSession();
        void this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
        return;
      }
      this.store.orders(user._id).subscribe({
        next: (response) => { this.orders = response.data; },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }
    this.store.cart().subscribe({
      next: (response) => { this.cart = response.data; },
      error: (error: unknown) => this.fail(error),
      complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
    });
  }

  private fail(error: unknown): void {
    this.error = this.errorText(error);
    this.loading = false;
    this.changeDetector.markForCheck();
  }

  private errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
    }
    return 'We could not complete that request. Please try again.';
  }
}
