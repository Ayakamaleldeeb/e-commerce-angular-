import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SessionUser, StoreService } from './store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);
  user: SessionUser | null = this.store.getUser();
  searchText = '';
  menuOpen = false;

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.user = this.store.getUser();
      this.menuOpen = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  searchProducts(): void {
    const query = this.searchText.trim();
    void this.router.navigate(['/products'], { queryParams: query ? { q: query } : {} });
  }

  logout(): void {
    this.store.clearSession();
    this.user = null;
    void this.router.navigateByUrl('/');
  }
}
