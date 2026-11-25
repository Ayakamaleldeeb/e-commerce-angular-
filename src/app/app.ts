import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Category, SessionUser, StoreService } from './store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(StoreService);
  readonly user = signal<SessionUser | null>(this.store.getUser());
  readonly categories = signal<Category[]>([]);
  readonly menuOpen = signal(false);
  readonly year = new Date().getFullYear();
  searchText = '';

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const wasSignedIn = !!this.user();
      this.user.set(this.store.getUser());
      if (!wasSignedIn && this.user()) this.loadCounts();
      this.menuOpen.set(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.store.categories().subscribe({ next: (response) => this.categories.set(response.data.slice(0, 8)), error: () => undefined });
    if (this.user()) this.loadCounts();
  }

  searchProducts(): void {
    const query = this.searchText.trim();
    this.menuOpen.set(false);
    void this.router.navigate(['/products'], { queryParams: query ? { q: query } : {} });
  }

  logout(): void {
    this.store.clearSession();
    this.user.set(null);
    this.menuOpen.set(false);
    void this.router.navigateByUrl('/');
  }

  private loadCounts(): void {
    this.store.cart().subscribe({ error: () => undefined });
    this.store.wishlist().subscribe({ error: () => undefined });
  }
}
