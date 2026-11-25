import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService, Product } from './store.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell detail-shell">
      <div class="breadcrumbs"><a routerLink="/">Home</a><span>/</span><a routerLink="/products">Products</a><span>/</span><span>{{ product?.title || 'Details' }}</span></div>
      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Loading product…</div>
      <div class="detail-grid" *ngIf="product && !loading">
        <div class="detail-gallery">
          <div class="detail-main-image"><span class="detail-badge" *ngIf="product.priceAfterDiscount">SPECIAL PRICE</span><img [src]="selectedImage || product.imageCover" [alt]="product.title"></div>
          <div class="thumbnail-row" *ngIf="product.images?.length">
            <button *ngFor="let image of product.images" [class.active]="selectedImage === image" (click)="selectedImage = image"><img [src]="image" alt="Product view"></button>
          </div>
        </div>
        <div class="detail-copy">
          <a class="product-category" [routerLink]="product.category ? ['/categories', product.category._id] : '/categories'">{{ product.category?.name || 'Fresh picks' }}</a>
          <h1>{{ product.title }}</h1>
          <div class="rating detail-rating"><span>★</span> {{ product.ratingsAverage || 4.5 }} <small>({{ product.ratingsQuantity || 0 }} reviews)</small></div>
          <p class="detail-description">{{ product.description || 'A thoughtful everyday pick, selected for quality and made to bring a little joy to your routine.' }}</p>
          <div class="detail-price"><strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong><del *ngIf="product.priceAfterDiscount">{{ product.price | currency:'EGP ':'symbol':'1.0-0' }}</del></div>
          <p class="stock-note"><span>✓</span> {{ product.quantity ? 'In stock · ' + product.quantity + ' available' : 'Ready to order' }}</p>
          <div class="detail-actions"><button class="primary-btn" [disabled]="busy" (click)="addToCart()">Add to cart <span>→</span></button><button class="heart-btn" [disabled]="busy" (click)="addToWishlist()" aria-label="Add to wishlist">♡</button></div>
          <div class="detail-divider"></div>
          <p class="detail-meta"><span>Thoughtful choice</span><strong>Picked for everyday</strong></p>
          <p class="detail-meta" *ngIf="product.brand"><span>Brand</span><a [routerLink]="['/brands', product.brand._id]">{{ product.brand.name }} ↗</a></p>
          <p class="feedback success" *ngIf="message">{{ message }}</p>
        </div>
      </div>
    </section>
  `,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  product: Product | null = null;
  selectedImage = '';
  loading = true;
  busy = false;
  error = '';
  message = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.error = 'This product could not be found.';
        this.loading = false;
        return;
      }
      this.store.product(id).subscribe({
        next: (response) => { this.product = response.data; this.changeDetector.markForCheck(); },
        error: (error: unknown) => { this.error = this.errorText(error); this.loading = false; this.changeDetector.markForCheck(); },
        complete: () => { this.loading = false; this.changeDetector.markForCheck(); },
      });
    });
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.requireSignIn()) return;
    this.runAction(this.store.addToCart(this.product._id), 'Added to your cart.');
  }

  addToWishlist(): void {
    if (!this.product) return;
    if (!this.requireSignIn()) return;
    this.runAction(this.store.addToWishlist(this.product._id), 'Saved to your wishlist.');
  }

  private requireSignIn(): boolean {
    if (this.store.getUser()) return true;
    void this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url },
    });
    return false;
  }

  private runAction<T>(request: import('rxjs').Observable<T>, success: string): void {
    this.busy = true;
    this.error = '';
    this.message = '';
    request.subscribe({
      next: () => { this.message = success; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = this.errorText(error); this.busy = false; this.changeDetector.markForCheck(); },
      complete: () => { this.busy = false; this.changeDetector.markForCheck(); },
    });
  }

  private errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { message?: string } }).error;
      if (body?.message) return body.message;
    }
    return 'We could not complete that request. Please try again.';
  }
}
