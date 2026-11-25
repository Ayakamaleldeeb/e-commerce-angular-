import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { StoreService, Brand, Category, Product } from './store.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="breadcrumbs"><a routerLink="/">Home</a><span>/</span><span>{{ title }}</span></div>
      <header class="page-heading">
        <div><p class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p class="muted">{{ description }}</p></div>
        <span class="result-count" *ngIf="kind === 'products' && !loading">{{ products.length }} products</span>
      </header>

      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Finding the good stuff…</div>

      <div class="brand-grid" *ngIf="kind === 'brands' && !loading">
        <a class="brand-tile" *ngFor="let brand of brands" [routerLink]="['/brands', brand._id]">
          <img [src]="brand.image || placeholder" [alt]="brand.name" loading="lazy">
          <span>{{ brand.name }}</span><small>Explore collection →</small>
        </a>
        <p class="empty-state" *ngIf="!brands.length">No brands to show right now.</p>
      </div>

      <div class="category-grid" *ngIf="kind === 'categories' && !loading">
        <a class="category-tile" *ngFor="let category of categories" [routerLink]="['/categories', category._id]">
          <img [src]="category.image || placeholder" [alt]="category.name" loading="lazy">
          <span>{{ category.name }}</span>
        </a>
        <p class="empty-state" *ngIf="!categories.length">No categories to show right now.</p>
      </div>

      <section class="collection-banner" *ngIf="(kind === 'brand-detail' || kind === 'category-detail') && !loading">
        <div><span class="eyebrow">CURATED FOR YOU</span><h2>{{ collectionName }}</h2><p>Thoughtful picks, everyday favourites, all in one place.</p></div>
        <img [src]="collectionImage || placeholder" [alt]="collectionName">
      </section>

      <div class="product-grid" *ngIf="showProducts && !loading">
        <article class="product-card" *ngFor="let product of products">
          <a class="product-picture" [routerLink]="['/product', product._id]">
            <img [src]="product.imageCover || placeholder" [alt]="product.title" loading="lazy">
            <span class="discount" *ngIf="product.priceAfterDiscount">SAVE {{ discount(product) }}%</span>
          </a>
          <div class="product-info">
            <a class="product-category" [routerLink]="product.category ? ['/categories', product.category._id] : '/categories'">{{ product.category?.name || 'Fresh picks' }}</a>
            <a class="product-title" [routerLink]="['/product', product._id]">{{ product.title }}</a>
            <div class="rating"><span>★</span> {{ product.ratingsAverage || 4.5 }} <small>({{ product.ratingsQuantity || 0 }})</small></div>
            <div class="product-bottom"><strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong><del *ngIf="product.priceAfterDiscount">{{ product.price | currency:'EGP ':'symbol':'1.0-0' }}</del><a class="add-mini" [routerLink]="['/product', product._id]" aria-label="View product">+</a></div>
          </div>
        </article>
        <p class="empty-state" *ngIf="!products.length">No products match this collection yet.</p>
      </div>
    </section>
  `,
})
export class CatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(StoreService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly placeholder = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  kind = 'products';
  title = 'All products';
  eyebrow = 'MADE FOR YOUR EVERYDAY';
  description = 'Find something good for every day.';
  collectionName = '';
  collectionImage = '';
  loading = true;
  error = '';
  products: Product[] = [];
  brands: Brand[] = [];
  categories: Category[] = [];
  search = '';
  private baseProducts: Product[] = [];

  get showProducts(): boolean {
    return ['products', 'brand-detail', 'category-detail'].includes(this.kind);
  }

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.paramMap]).subscribe(([data, params]) => {
      this.kind = data['kind'] as string;
      this.load(params.get('id'));
    });
    this.route.queryParamMap.subscribe((params) => {
      this.search = (params.get('q') || '').trim().toLowerCase();
      this.applySearch();
    });
  }

  discount(product: Product): number {
    return product.priceAfterDiscount ? Math.round((1 - product.priceAfterDiscount / product.price) * 100) : 0;
  }

  private load(id: string | null): void {
    this.loading = true;
    this.error = '';
    this.baseProducts = [];
    if (this.kind === 'brands') {
      this.title = 'Our brands';
      this.eyebrow = 'BRANDS WE LOVE';
      this.description = 'Meet the makers behind your everyday favourites.';
      this.store.brands().subscribe({
        next: (response) => { this.brands = response.data; this.changeDetector.markForCheck(); },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }
    if (this.kind === 'categories') {
      this.title = 'Shop by category';
      this.eyebrow = 'A LITTLE BIT OF EVERYTHING';
      this.description = 'Browse our handpicked collections and find your next favourite.';
      this.store.categories().subscribe({
        next: (response) => { this.categories = response.data; this.changeDetector.markForCheck(); },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }

    this.title = 'All products';
    this.eyebrow = 'MADE FOR YOUR EVERYDAY';
    this.description = 'Thoughtful picks, everyday favourites, all in one place.';
    let collectionRequest = this.store.products();
    if (this.kind === 'brand-detail' && id) {
      this.store.brand(id).subscribe({
        next: (response) => {
          this.collectionName = response.data.name;
          this.collectionImage = response.data.image || '';
          this.title = response.data.name;
          this.changeDetector.markForCheck();
        },
        error: (error: unknown) => this.fail(error),
      });
      collectionRequest = this.store.products();
    }
    if (this.kind === 'category-detail' && id) {
      this.store.category(id).subscribe({
        next: (response) => {
          this.collectionName = response.data.name;
          this.collectionImage = response.data.image || '';
          this.title = response.data.name;
          this.changeDetector.markForCheck();
        },
        error: (error: unknown) => this.fail(error),
      });
      collectionRequest = this.store.products();
    }
    collectionRequest.subscribe({
      next: (response) => {
        this.baseProducts = response.data.filter((product) => {
          if (this.kind === 'brand-detail') return product.brand?._id === id;
          if (this.kind === 'category-detail') return product.category?._id === id;
          return true;
        });
        this.applySearch();
      },
      error: (error: unknown) => this.fail(error),
      complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
    });
  }

  private applySearch(): void {
    if (this.showProducts) {
      this.products = this.baseProducts.filter((product) =>
        !this.search || this.kind !== 'products' || product.title.toLowerCase().includes(this.search),
      );
      if (this.kind === 'products') {
        this.title = this.search ? `Search results for “${this.search}”` : 'All products';
        this.eyebrow = this.search ? 'SEARCH' : 'MADE FOR YOUR EVERYDAY';
      }
    }
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
    return 'We could not load this collection. Please try again.';
  }
}
