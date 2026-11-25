import { Component, Input, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, StoreService } from './store.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <article class="product-card">
      <div class="product-picture">
        <a [routerLink]="['/product', product._id]" class="product-image-link">
          <img [src]="product.imageCover" [alt]="product.title" loading="lazy">
        </a>
        @if (discount) { <span class="discount">-{{ discount }}%</span> }
        <div class="card-tools">
          <button type="button" (click)="addToWishlist()" [disabled]="busy()" aria-label="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
          <a [routerLink]="product.category ? ['/categories', product.category._id] : '/products'" aria-label="Browse similar"><i class="fa-solid fa-arrows-rotate"></i></a>
          <a [routerLink]="['/product', product._id]" aria-label="Quick view"><i class="fa-regular fa-eye"></i></a>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">{{ product.category?.name || 'Fresh picks' }}</span>
        <a class="product-title" [routerLink]="['/product', product._id]">{{ product.title }}</a>
        <div class="rating">
          <span class="stars">
            @for (star of stars; track $index) {
              <i [class]="star"></i>
            }
          </span>
          <small>{{ product.ratingsAverage || 0 }} ({{ product.ratingsQuantity || 0 }})</small>
        </div>
        <div class="product-bottom">
          <div class="price">
            <strong [class.sale]="discount">{{ (product.priceAfterDiscount || product.price) | currency:'EGP ':'symbol':'1.0-0' }}</strong>
            @if (product.priceAfterDiscount) { <del>{{ product.price | currency:'EGP ':'symbol':'1.0-0' }}</del> }
          </div>
          <button type="button" class="add-mini" (click)="addToCart()" [disabled]="busy()" aria-label="Add to cart">
            @if (busy()) { <span class="spinner small light"></span> } @else { <i class="fa-solid fa-plus"></i> }
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  readonly busy = signal(false);

  get discount(): number {
    const p = this.product;
    return p.priceAfterDiscount ? Math.round((1 - p.priceAfterDiscount / p.price) * 100) : 0;
  }

  get stars(): string[] {
    const rating = this.product.ratingsAverage || 0;
    return [1, 2, 3, 4, 5].map((n) =>
      rating >= n ? 'fa-solid fa-star' : rating >= n - 0.5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star',
    );
  }

  addToCart(): void {
    this.run(this.store.addToCart(this.product._id), 'Added to your cart');
  }

  addToWishlist(): void {
    this.run(this.store.addToWishlist(this.product._id), 'Saved to your wishlist');
  }

  private run<T>(request: Observable<T>, success: string): void {
    if (!this.store.getUser()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.busy.set(true);
    request.subscribe({
      next: () => this.store.toast(success),
      error: () => { this.store.toast('Something went wrong. Please try again.'); this.busy.set(false); },
      complete: () => this.busy.set(false),
    });
  }
}
