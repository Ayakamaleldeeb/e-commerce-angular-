import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from './product-card.component';
import { Category, Product, StoreService } from './store.service';

interface Slide {
  title: string;
  text: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductCardComponent],
  template: `
    <section class="hero" aria-label="Featured offers">
      @for (slide of slides; track slide.title; let i = $index) {
        <div class="hero-slide" [class.active]="i === current()" [style.background-image]="'url(' + slide.image + ')'">
          <div class="page-shell hero-content">
            <h1>{{ slide.title }}</h1>
            <p>{{ slide.text }}</p>
            <div class="hero-actions">
              <a class="btn btn-white" routerLink="/products">Shop Now</a>
              <a class="btn btn-ghost" routerLink="/categories">View Deals</a>
            </div>
          </div>
        </div>
      }
      <button class="hero-arrow prev" type="button" (click)="go(-1)" aria-label="Previous slide"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="hero-arrow next" type="button" (click)="go(1)" aria-label="Next slide"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="hero-dots">
        @for (slide of slides; track slide.title; let i = $index) {
          <button type="button" [class.active]="i === current()" (click)="setSlide(i)" [attr.aria-label]="'Go to slide ' + (i + 1)"></button>
        }
      </div>
    </section>

    <section class="page-shell feature-cards">
      <div><span class="feature-icon blue"><i class="fa-solid fa-truck"></i></span><span><strong>Free Shipping</strong><small>On orders over 500 EGP</small></span></div>
      <div><span class="feature-icon green"><i class="fa-solid fa-shield-halved"></i></span><span><strong>Secure Payment</strong><small>100% secure transactions</small></span></div>
      <div><span class="feature-icon orange"><i class="fa-solid fa-arrow-rotate-left"></i></span><span><strong>Easy Returns</strong><small>14-day return policy</small></span></div>
      <div><span class="feature-icon purple"><i class="fa-solid fa-headset"></i></span><span><strong>24/7 Support</strong><small>Dedicated support team</small></span></div>
    </section>

    <section class="page-shell home-section">
      <div class="section-heading">
        <h2>Shop By <span>Category</span></h2>
        <a class="link-arrow" routerLink="/categories">View All Categories <i class="fa-solid fa-arrow-right"></i></a>
      </div>
      @if (categoryError()) { <p class="feedback error">{{ categoryError() }}</p> }
      <div class="category-circles">
        @for (category of categories(); track category._id) {
          <a class="category-circle" [routerLink]="['/categories', category._id]">
            <span class="circle-img"><img [src]="category.image" [alt]="category.name" loading="lazy"></span>
            <strong>{{ category.name }}</strong>
          </a>
        } @empty {
          @if (!categoryError()) { <div class="loading-state"><span class="spinner"></span></div> }
        }
      </div>
    </section>

    <section class="page-shell promo-grid">
      <article class="promo green">
        <span class="promo-pill"><i class="fa-solid fa-fire"></i> Deal of the Day</span>
        <h3>Fresh Organic Fruits</h3>
        <p>Get up to 40% off on selected organic fruits</p>
        <div class="promo-offer"><strong>40% OFF</strong><span>Use code: <b>ORGANIC40</b></span></div>
        <a class="btn btn-white small" routerLink="/products">Shop Now <i class="fa-solid fa-arrow-right"></i></a>
      </article>
      <article class="promo orange">
        <span class="promo-pill"><i class="fa-solid fa-star"></i> New Arrivals</span>
        <h3>Exotic Vegetables</h3>
        <p>Discover our latest collection of premium vegetables</p>
        <div class="promo-offer"><strong>25% OFF</strong><span>Use code: <b>FRESH25</b></span></div>
        <a class="btn btn-white small" routerLink="/products">Explore Now <i class="fa-solid fa-arrow-right"></i></a>
      </article>
    </section>

    <section class="page-shell home-section">
      <div class="section-heading">
        <h2>Featured <span>Products</span></h2>
        <a class="link-arrow" routerLink="/products">View All Products <i class="fa-solid fa-arrow-right"></i></a>
      </div>
      @if (productError()) { <p class="feedback error">{{ productError() }}</p> }
      <div class="product-grid">
        @for (product of featured(); track product._id) {
          <app-product-card [product]="product" />
        } @empty {
          @if (!productError()) { <div class="loading-state"><span class="spinner"></span> Loading products…</div> }
        }
      </div>
    </section>

    <section class="page-shell newsletter-wrap">
      <div class="newsletter">
        <div class="newsletter-main">
          <div class="newsletter-badge"><span class="feature-icon solid"><i class="fa-regular fa-envelope"></i></span><span><b>NEWSLETTER</b><small>50,000+ subscribers</small></span></div>
          <h2>Get the Freshest Updates <span>Delivered Free</span></h2>
          <p>Weekly recipes, seasonal offers &amp; exclusive member perks.</p>
          <div class="chips">
            <span><i class="fa-solid fa-leaf"></i> Fresh Picks Weekly</span>
            <span><i class="fa-solid fa-truck"></i> Free Delivery Codes</span>
            <span><i class="fa-solid fa-tag"></i> Members-Only Deals</span>
          </div>
          <form class="subscribe" (submit)="$event.preventDefault(); subscribe()">
            <input type="email" name="newsletter" [(ngModel)]="email" placeholder="you@example.com" aria-label="Email address" required>
            <button class="btn btn-primary" type="submit">Subscribe <i class="fa-solid fa-arrow-right"></i></button>
          </form>
          <small class="fine-print"><i class="fa-solid fa-lock"></i> Unsubscribe anytime. No spam, ever.</small>
        </div>
        <div class="app-card">
          <span class="app-pill"><i class="fa-solid fa-mobile-screen"></i> MOBILE APP</span>
          <h3>Shop Faster on Our App</h3>
          <p>Get app-exclusive deals &amp; 15% off your first order.</p>
          <a class="store-btn" href="https://www.apple.com/app-store/" target="_blank" rel="noopener"><i class="fa-brands fa-apple"></i><span><small>DOWNLOAD ON THE</small>App Store</span></a>
          <a class="store-btn" href="https://play.google.com" target="_blank" rel="noopener"><i class="fa-brands fa-google-play"></i><span><small>GET IT ON</small>Google Play</span></a>
          <div class="app-rating"><span>★★★★★</span> 4.9 · 100K+ downloads</div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly store = inject(StoreService);
  readonly slides: Slide[] = [
    { title: 'Fresh Products Delivered to your Door', text: 'Get 20% off your first order', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80' },
    { title: 'Premium Quality Guaranteed', text: 'Fresh from farm to your table', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80' },
    { title: 'Fast & Free Delivery', text: 'Same day delivery available', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&w=1800&q=80' },
  ];
  readonly current = signal(0);
  readonly categories = signal<Category[]>([]);
  readonly featured = signal<Product[]>([]);
  readonly categoryError = signal('');
  readonly productError = signal('');
  email = '';
  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.timer = setInterval(() => this.go(1), 6000);
    this.store.categories().subscribe({
      next: (response) => this.categories.set(response.data),
      error: (error: unknown) => this.categoryError.set(this.errorText(error)),
    });
    this.store.products().subscribe({
      next: (response) => this.featured.set(response.data.slice(0, 20)),
      error: (error: unknown) => this.productError.set(this.errorText(error)),
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  go(step: number): void {
    this.current.set((this.current() + step + this.slides.length) % this.slides.length);
  }

  setSlide(index: number): void {
    this.current.set(index);
  }

  subscribe(): void {
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.store.toast('Please enter a valid email address');
      return;
    }
    this.email = '';
    this.store.toast('Thanks for subscribing!');
  }

  private errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
    }
    return 'Some content is unavailable right now. Please try again later.';
  }
}
