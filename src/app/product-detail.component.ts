import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService, Product } from './store.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell page-body">
      <div class="breadcrumbs"><a routerLink="/">Home</a><span>/</span><a routerLink="/products">Products</a><span>/</span><span class="crumb-current">{{ product?.title || 'Details' }}</span></div>
      <p class="feedback error" *ngIf="error">{{ error }}</p>
      <div class="loading-state" *ngIf="loading"><span class="spinner"></span> Loading product…</div>
      <div class="detail-grid" *ngIf="product && !loading">
        <div class="detail-gallery card">
          <div class="detail-main-image">
            <span class="discount" *ngIf="product.priceAfterDiscount">-{{ discount }}%</span>
            <img [src]="selectedImage || product.imageCover" [alt]="product.title">
          </div>
          <div class="thumbnail-row" *ngIf="product.images?.length">
            <button type="button" *ngFor="let image of product.images" [class.active]="(selectedImage || product.imageCover) === image" (click)="selectedImage = image"><img [src]="image" alt="Product view"></button>
          </div>
        </div>
        <div class="detail-copy card">
          <div class="detail-tags">
            <a class="tag green" [routerLink]="product.category ? ['/categories', product.category._id] : '/categories'">{{ product.category?.name || 'Fresh picks' }}</a>
            <a class="tag" *ngIf="product.brand" [routerLink]="['/brands', product.brand._id]">{{ product.brand.name }}</a>
          </div>
          <h1>{{ product.title }}</h1>
          <div class="rating"><span class="stars"><i class="fa-solid fa-star"></i></span> {{ product.ratingsAverage || 0 }} <small>({{ product.ratingsQuantity || 0 }} reviews)</small></div>
          <div class="detail-price">
            <strong>{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong>
            <del *ngIf="product.priceAfterDiscount">{{ product.price | currency:'EGP ':'symbol':'1.0-0' }}</del>
            <span class="save-pill" *ngIf="product.priceAfterDiscount">Save {{ discount }}%</span>
          </div>
          <p class="stock-note"><i class="fa-solid fa-circle-check"></i> {{ product.quantity ? 'In Stock · ' + product.quantity + ' available' : 'Ready to order' }}</p>
          <p class="detail-description">{{ product.description || 'A quality pick, selected to bring a little joy to your routine.' }}</p>
          <div class="detail-actions">
            <button class="btn btn-primary" type="button" [disabled]="busy" (click)="addToCart()"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>
            <button class="btn btn-outline icon-only" type="button" [disabled]="busy" (click)="addToWishlist()" aria-label="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
          </div>
          <p class="feedback success" *ngIf="message">{{ message }}</p>
          <div class="detail-perks">
            <div><i class="fa-solid fa-truck"></i><span><strong>Free Delivery</strong><small>On orders over 500 EGP</small></span></div>
            <div><i class="fa-solid fa-arrow-rotate-left"></i><span><strong>14-Day Returns</strong><small>Easy return policy</small></span></div>
            <div><i class="fa-solid fa-shield-halved"></i><span><strong>Secure Payment</strong><small>100% protected</small></span></div>
          </div>
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

  get discount(): number {
    const p = this.product;
    return p?.priceAfterDiscount ? Math.round((1 - p.priceAfterDiscount / p.price) * 100) : 0;
  }

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
    this.runAction(this.store.addToCart(this.product._id), 'Added to your cart');
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
      next: () => { this.store.toast(success); this.changeDetector.markForCheck(); },
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
