import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { ProductCardComponent } from './product-card.component';
import { StoreService, Brand, Category, Product } from './store.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <section class="page-banner">
      <div class="page-shell">
        <div class="breadcrumbs light"><a routerLink="/">Home</a><span>/</span><span>{{ title }}</span></div>
        <div class="banner-title">
          <span class="banner-icon"><i [class]="icon"></i></span>
          <div><h1>{{ title }}</h1><p>{{ description }}</p></div>
        </div>
      </div>
    </section>

    <section class="page-shell page-body">
      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Loading…</div>

      <div class="toolbar" *ngIf="showProducts && !loading">
        <span>Showing <b>{{ products.length }}</b> products</span>
        <a class="link-arrow" [routerLink]="kind === 'brand-detail' ? '/brands' : '/categories'" *ngIf="kind !== 'products'"><i class="fa-solid fa-arrow-left"></i> Back to {{ kind === 'brand-detail' ? 'brands' : 'categories' }}</a>
      </div>

      <div class="tile-grid" *ngIf="kind === 'brands' && !loading">
        <a class="tile brand" *ngFor="let brand of brands" [routerLink]="['/brands', brand._id]">
          <span class="tile-img"><img [src]="brand.image || placeholder" [alt]="brand.name" loading="lazy"></span>
          <strong>{{ brand.name }}</strong><small>View Products <i class="fa-solid fa-arrow-right"></i></small>
        </a>
        <p class="empty-state" *ngIf="!brands.length">No brands to show right now.</p>
      </div>

      <div class="tile-grid" *ngIf="kind === 'categories' && !loading">
        <a class="tile" *ngFor="let category of categories" [routerLink]="['/categories', category._id]">
          <span class="tile-img cover"><img [src]="category.image || placeholder" [alt]="category.name" loading="lazy"></span>
          <strong>{{ category.name }}</strong><small>View Products <i class="fa-solid fa-arrow-right"></i></small>
        </a>
        <p class="empty-state" *ngIf="!categories.length">No categories to show right now.</p>
      </div>

      <div class="product-grid" *ngIf="showProducts && !loading">
        <app-product-card *ngFor="let product of products" [product]="product" />
        <div class="empty-state" *ngIf="!products.length">
          <span class="empty-icon"><i class="fa-solid fa-box-open"></i></span>
          <h2>No products found</h2><p>Try a different search or browse our categories.</p>
          <a class="btn btn-primary" routerLink="/products">View All Products</a>
        </div>
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
  icon = 'fa-solid fa-store';
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
      this.icon = 'fa-solid fa-tags';
      this.title = 'All Brands';
      this.eyebrow = 'BRANDS WE LOVE';
      this.description = 'Shop your favorite brands in one place';
      this.store.brands().subscribe({
        next: (response) => { this.brands = response.data; this.changeDetector.markForCheck(); },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }
    if (this.kind === 'categories') {
      this.icon = 'fa-solid fa-layer-group';
      this.title = 'All Categories';
      this.eyebrow = 'A LITTLE BIT OF EVERYTHING';
      this.description = 'Browse our wide range of categories';
      this.store.categories().subscribe({
        next: (response) => { this.categories = response.data; this.changeDetector.markForCheck(); },
        error: (error: unknown) => this.fail(error),
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
      return;
    }

    this.icon = this.kind === 'products' ? 'fa-solid fa-box-open' : this.kind === 'brand-detail' ? 'fa-solid fa-tag' : 'fa-solid fa-layer-group';
    this.title = 'All Products';
    this.eyebrow = 'MADE FOR YOUR EVERYDAY';
    this.description = 'Explore our complete product collection';
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
        this.title = this.search ? `Search results for “${this.search}”` : 'All Products';
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
