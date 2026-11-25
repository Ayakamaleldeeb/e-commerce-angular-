import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Brand, Category, Product } from './store.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="home-hero page-shell">
      <div class="hero-copy">
        <span class="hero-pill"><i></i> FRESH FINDS, EVERY DAY</span>
        <h1>Good food.<br><em>Good mood.</em></h1>
        <p>Everyday essentials and little luxuries, picked just for you. Make your next shop a happy one.</p>
        <div class="hero-actions"><a class="primary-btn" routerLink="/products">Shop all products <span>→</span></a><a class="text-btn" routerLink="/categories">Explore categories</a></div>
        <div class="hero-note"><span class="avatar-stack"><b>🥑</b><b>🍓</b><b>🍋</b></span><span><strong>Fresh choices</strong><small>for your everyday</small></span></div>
      </div>
      <div class="hero-art">
        <div class="hero-circle"></div>
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=85" alt="Fresh produce at the market">
        <div class="hero-sticker"><span>picked<br>with care</span><b>✳</b></div>
        <div class="floating-note"><span>✦</span> A little freshness goes a long way</div>
      </div>
    </section>

    <section class="page-shell home-section">
      <div class="section-heading"><div><p class="eyebrow">FIND YOUR FAVOURITES</p><h2>Shop by category</h2></div><a class="text-btn" routerLink="/categories">All categories <span>→</span></a></div>
      <p class="feedback error" *ngIf="categoryError">{{ categoryError }}</p>
      <div class="category-row">
        <a class="category-card" *ngFor="let category of categories; let i = index" [routerLink]="['/categories', category._id]">
          <div class="category-image" [ngClass]="'tone-' + (i % 5)"><img [src]="category.image || placeholder" [alt]="category.name" loading="lazy"></div>
          <strong>{{ category.name }}</strong><small>Explore collection</small>
        </a>
        <div class="loading-state" *ngIf="!categories.length && !categoryError"><span class="spinner"></span></div>
      </div>
    </section>

    <section class="feature-strip page-shell">
      <div><span>✳</span><strong>Good things, thoughtfully picked</strong><small>Quality you'll feel good about</small></div>
      <div><span>♡</span><strong>Find your new favourites</strong><small>Fresh finds for every day</small></div>
      <div><span>↗</span><strong>Simple, joyful shopping</strong><small>Everything in one happy place</small></div>
    </section>

    <section class="page-shell home-section">
      <div class="section-heading"><div><p class="eyebrow">THE CROWD-PLEASERS</p><h2>Popular right now</h2></div><a class="text-btn" routerLink="/products">Shop all <span>→</span></a></div>
      <p class="feedback error" *ngIf="productError">{{ productError }}</p>
      <div class="product-grid">
        <article class="product-card" *ngFor="let product of featured">
          <a class="product-picture" [routerLink]="['/product', product._id]"><img [src]="product.imageCover || placeholder" [alt]="product.title" loading="lazy"><span class="discount" *ngIf="product.priceAfterDiscount">SPECIAL PICK</span></a>
          <div class="product-info">
            <a class="product-category" [routerLink]="product.category ? ['/categories', product.category._id] : '/categories'">{{ product.category?.name || 'Fresh picks' }}</a>
            <a class="product-title" [routerLink]="['/product', product._id]">{{ product.title }}</a>
            <div class="rating"><span>★</span> {{ product.ratingsAverage || 4.5 }} <small>({{ product.ratingsQuantity || 0 }})</small></div>
            <div class="product-bottom"><strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong><a class="add-mini" [routerLink]="['/product', product._id]" aria-label="View product">+</a></div>
          </div>
        </article>
        <div class="loading-state" *ngIf="!featured.length && !productError"><span class="spinner"></span> Loading the good stuff…</div>
      </div>
    </section>

    <section class="brand-band">
      <div class="page-shell">
        <div class="section-heading"><div><p class="eyebrow">GOOD COMPANY</p><h2>Brands we love</h2></div><a class="text-btn" routerLink="/brands">Meet all brands <span>→</span></a></div>
        <p class="feedback error" *ngIf="brandError">{{ brandError }}</p>
        <div class="brand-row"><a *ngFor="let brand of brands.slice(0, 6)" [routerLink]="['/brands', brand._id]"><img [src]="brand.image || placeholder" [alt]="brand.name" loading="lazy"><span>{{ brand.name }}</span></a></div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly store = inject(StoreService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly placeholder = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  categories: Category[] = [];
  featured: Product[] = [];
  brands: Brand[] = [];
  categoryError = '';
  productError = '';
  brandError = '';

  ngOnInit(): void {
    this.store.categories().subscribe({
      next: (response) => { this.categories = response.data.slice(0, 5); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.categoryError = this.errorText(error); this.changeDetector.markForCheck(); },
    });
    this.store.products().subscribe({
      next: (response) => { this.featured = response.data.slice(0, 4); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.productError = this.errorText(error); this.changeDetector.markForCheck(); },
    });
    this.store.brands().subscribe({
      next: (response) => { this.brands = response.data; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.brandError = this.errorText(error); this.changeDetector.markForCheck(); },
    });
  }

  private errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
    }
    return 'Some content is unavailable right now. Please try again later.';
  }
}
