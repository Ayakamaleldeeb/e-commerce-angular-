import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AccountComponent } from './account.component';
import { AuthComponent } from './auth.component';
import { CatalogComponent } from './catalog.component';
import { HomeComponent } from './home.component';
import { ProductDetailComponent } from './product-detail.component';

const authGuard: CanActivateFn = (_route, state) => {
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('freshcart-token');
  return token ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'FreshCart — Good food. Good mood.' },
  { path: 'products', component: CatalogComponent, data: { kind: 'products' }, title: 'Shop all products — FreshCart' },
  { path: 'products/:id', component: ProductDetailComponent, title: 'Product details — FreshCart' },
  { path: 'product/:id', component: ProductDetailComponent, title: 'Product details — FreshCart' },
  { path: 'categories', component: CatalogComponent, data: { kind: 'categories' }, title: 'Categories — FreshCart' },
  { path: 'categories/:id', component: CatalogComponent, data: { kind: 'category-detail' }, title: 'Category — FreshCart' },
  { path: 'brands', component: CatalogComponent, data: { kind: 'brands' }, title: 'Brands — FreshCart' },
  { path: 'brands/:id', component: CatalogComponent, data: { kind: 'brand-detail' }, title: 'Brand — FreshCart' },
  { path: 'login', component: AuthComponent, data: { mode: 'login' }, title: 'Sign in — FreshCart' },
  { path: 'register', component: AuthComponent, data: { mode: 'register' }, title: 'Create account — FreshCart' },
  { path: 'forgot-password', component: AuthComponent, data: { mode: 'forgot' }, title: 'Reset password — FreshCart' },
  { path: 'change-password', component: AuthComponent, canActivate: [authGuard], data: { mode: 'change' }, title: 'Change password — FreshCart' },
  { path: 'cart', component: AccountComponent, canActivate: [authGuard], data: { view: 'cart' }, title: 'Your cart — FreshCart' },
  { path: 'wishlist', component: AccountComponent, canActivate: [authGuard], data: { view: 'wishlist' }, title: 'Your wishlist — FreshCart' },
  { path: 'checkout', component: AccountComponent, canActivate: [authGuard], data: { view: 'checkout' }, title: 'Checkout — FreshCart' },
  { path: 'orders', component: AccountComponent, canActivate: [authGuard], data: { view: 'orders' }, title: 'Your orders — FreshCart' },
  { path: '**', redirectTo: '' },
];
