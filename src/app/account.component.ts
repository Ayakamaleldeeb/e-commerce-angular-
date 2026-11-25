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
    <section class="page-shell account-shell">
      <div class="breadcrumbs"><a routerLink="/">Home</a><span>/</span><span>{{ title }}</span></div>
      <header class="page-heading"><div><p class="eyebrow">YOUR FRESHCART</p><h1>{{ title }}</h1><p class="muted">{{ subtitle }}</p></div></header>
      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <p class="feedback success" *ngIf="message">{{ message }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Loading your FreshCart…</div>

      <div class="cart-layout" *ngIf="view === 'cart' && !loading">
        <div class="cart-list">
          <div class="cart-row" *ngFor="let item of cart?.products">
            <a class="cart-thumb" [routerLink]="['/product', item.product._id]"><img [src]="item.product.imageCover || placeholder" [alt]="item.product.title"></a>
            <div class="cart-product"><a [routerLink]="['/product', item.product._id]">{{ item.product.title }}</a><small>{{ item.product.category?.name || 'Fresh picks' }}</small><button class="remove-link" (click)="removeCartItem(item.product._id)">Remove</button></div>
            <div class="quantity-control"><button (click)="setQuantity(item.product._id, item.count - 1)" [disabled]="busy || item.count <= 1" aria-label="Decrease quantity">−</button><span>{{ item.count }}</span><button (click)="setQuantity(item.product._id, item.count + 1)" [disabled]="busy" aria-label="Increase quantity">+</button></div>
            <strong class="line-price">{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="empty-state" *ngIf="!cart?.products?.length"><span class="empty-icon">🛍</span><h2>Your cart is taking a little break</h2><p>Find something lovely to bring home.</p><a class="primary-btn" routerLink="/products">Explore products →</a></div>
        </div>
        <aside class="summary-card" *ngIf="cart?.products?.length">
          <h2>Order summary</h2><p><span>Subtotal</span><strong>{{ cart?.totalCartPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></p><p><span>Delivery</span><strong class="free-label">Calculated at checkout</strong></p><div class="summary-total"><span>Total</span><strong>{{ cart?.totalAfterDiscount || cart?.totalCartPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></div><a class="primary-btn wide" routerLink="/checkout">Continue to checkout <span>→</span></a><a class="continue-link" routerLink="/products">← Continue shopping</a>
        </aside>
      </div>

      <div class="wishlist-grid" *ngIf="view === 'wishlist' && !loading">
        <article class="product-card" *ngFor="let product of wishlist">
          <a class="product-picture" [routerLink]="['/product', product._id]"><img [src]="product.imageCover || placeholder" [alt]="product.title" loading="lazy"></a>
          <div class="product-info"><a class="product-category" [routerLink]="product.category ? ['/categories', product.category._id] : '/categories'">{{ product.category?.name || 'Fresh picks' }}</a><a class="product-title" [routerLink]="['/product', product._id]">{{ product.title }}</a><div class="product-bottom"><strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong><button class="add-mini" (click)="removeWishlistItem(product._id)" aria-label="Remove from wishlist">×</button></div><button class="outline-btn" (click)="moveToCart(product)">Move to cart</button></div>
        </article>
        <div class="empty-state full-span" *ngIf="!wishlist.length"><span class="empty-icon">♡</span><h2>Save a little something</h2><p>Tap the heart on anything you love and it’ll be here.</p><a class="primary-btn" routerLink="/products">Discover products →</a></div>
      </div>

      <div class="orders-list" *ngIf="view === 'orders' && !loading">
        <article class="order-card" *ngFor="let order of orders">
          <div class="order-heading"><div><small>ORDER PLACED</small><strong>{{ order.createdAt | date:'mediumDate' }}</strong></div><div><small>ORDER NUMBER</small><strong>#{{ order._id.slice(-8) | uppercase }}</strong></div><div><small>PAYMENT</small><strong>{{ order.isPaid ? 'Paid online' : 'Cash on delivery' }}</strong></div><div class="order-status" [class.delivered]="order.isDelivered">{{ order.isDelivered ? 'Delivered' : 'Processing' }}</div></div>
          <div class="order-footer"><span>{{ order.cartItems?.length || 0 }} items</span><strong>{{ order.totalOrderPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong><button class="text-btn" (click)="toggleOrder(order._id)">{{ expandedOrder === order._id ? 'Hide details' : 'View details' }} ↗</button></div>
          <div class="order-items" *ngIf="expandedOrder === order._id"><p *ngFor="let item of order.cartItems"><span>{{ item.count }} × {{ item.product.title }}</span><strong>{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong></p></div>
        </article>
        <div class="empty-state" *ngIf="!orders.length"><span class="empty-icon">✳</span><h2>Your next favourite is out there</h2><p>Your orders will show up here once you find something you love.</p><a class="primary-btn" routerLink="/products">Start exploring →</a></div>
      </div>

      <div class="checkout-layout" *ngIf="view === 'checkout' && !loading">
        <form class="checkout-form" [formGroup]="form" (ngSubmit)="placeOrder()">
          <section class="checkout-section"><span class="step-number">01</span><div><h2>Delivery details</h2><p>Where should we bring the good stuff?</p></div></section>
          <label>Street address<input formControlName="details" placeholder="Building, street, apartment"></label>
          <div class="form-pair"><label>City<input formControlName="city" placeholder="Your city"></label><label>Phone number<input formControlName="phone" type="tel" placeholder="+20 100 000 0000"></label></div>
          <section class="checkout-section payment-title"><span class="step-number">02</span><div><h2>Payment method</h2><p>Choose what works best for you.</p></div></section>
          <label class="payment-option"><input type="radio" formControlName="payment" value="cash"><span class="payment-icon">✳</span><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span><i>✓</i></label>
          <label class="payment-option"><input type="radio" formControlName="payment" value="online"><span class="payment-icon">▤</span><span><strong>Pay online</strong><small>Secure checkout with card</small></span><i>✓</i></label>
          <button class="primary-btn wide" type="submit" [disabled]="busy || !cart?.products?.length">{{ busy ? 'Processing…' : form.value.payment === 'online' ? 'Continue to secure payment →' : 'Place cash-on-delivery order →' }}</button>
        </form>
        <aside class="summary-card checkout-summary"><h2>Your order</h2><p class="muted">{{ cart?.products?.length || 0 }} items</p><div class="checkout-items"><p *ngFor="let item of cart?.products"><span>{{ item.count }} × {{ item.product.title }}</span><strong>{{ item.price * item.count | currency:'EGP ':'symbol':'1.0-0' }}</strong></p></div><div class="summary-total"><span>Total</span><strong>{{ cart?.totalAfterDiscount || cart?.totalCartPrice | currency:'EGP ':'symbol':'1.0-0' }}</strong></div></aside>
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
    phone: ['', [Validators.required, Validators.pattern(/^[+()\d\s-]{7,20}$/)]],
    payment: ['cash' as 'cash' | 'online', Validators.required],
  });

  get title(): string {
    return { cart: 'Your cart', wishlist: 'Your wishlist', orders: 'Your orders', checkout: 'Checkout' }[this.view];
  }

  get subtitle(): string {
    return {
      cart: 'A few good things, all in one place.',
      wishlist: 'A little list of things you love.',
      orders: 'All the good things you’ve brought home.',
      checkout: 'Just a couple of details and you’re all set.',
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
