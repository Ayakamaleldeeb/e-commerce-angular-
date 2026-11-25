import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  results?: number;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images?: string[];
  ratingsAverage?: number;
  ratingsQuantity?: number;
  quantity?: number;
  category?: Category;
  brand?: Brand;
}

export interface CartItem {
  _id: string;
  count: number;
  price: number;
  product: Product;
}

export interface Cart {
  _id: string;
  cartId?: string;
  products: CartItem[];
  totalCartPrice: number;
  totalAfterDiscount?: number;
  numOfCartItems?: number;
}

export interface Order {
  _id: string;
  createdAt: string;
  totalOrderPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  cartItems?: CartItem[];
}

export interface CheckoutSessionResponse {
  status: string;
  session: { url: string };
}

export interface SessionUser {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: SessionUser;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  readonly apiUrl = 'https://ecommerce.routemisr.com/api/v1';

  products(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`);
  }

  product(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`);
  }

  categories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`);
  }

  category(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`);
  }

  brands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.apiUrl}/brands`);
  }

  brand(id: string): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.apiUrl}/brands/${id}`);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signin`, credentials);
  }

  register(details: { name: string; email: string; password: string; rePassword: string; phone?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, details);
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/auth/forgotPasswords`, { email });
  }

  verifyResetCode(resetCode: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/auth/verifyResetCode`, { resetCode });
  }

  resetPassword(email: string, newPassword: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/auth/resetPassword`, { email, newPassword });
  }

  changePassword(currentPassword: string, password: string, passwordConfirm: string): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(`${this.apiUrl}/users/changeMyPassword`, { currentPassword, password, passwordConfirm });
  }

  cart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${this.apiUrl}/cart`);
  }

  addToCart(productId: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/cart`, { productId });
  }

  removeFromCart(productId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/cart/${productId}`);
  }

  updateCartItem(productId: string, count: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/cart/${productId}`, { count });
  }

  wishlist(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/wishlist`);
  }

  addToWishlist(productId: string): Observable<ApiResponse<Product[]>> {
    return this.http.post<ApiResponse<Product[]>>(`${this.apiUrl}/wishlist`, { productId });
  }

  removeFromWishlist(productId: string): Observable<ApiResponse<Product[]>> {
    return this.http.delete<ApiResponse<Product[]>>(`${this.apiUrl}/wishlist/${productId}`);
  }

  orders(userId: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders/user/${userId}`);
  }

  cashOrder(cartId: string, shippingAddress: ShippingAddress): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/orders/${cartId}`, { shippingAddress });
  }

  onlineOrder(cartId: string, shippingAddress: ShippingAddress, origin: string): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/orders/checkout-session/${cartId}?url=${encodeURIComponent(origin)}`,
      { shippingAddress },
    );
  }

  getUser(): SessionUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('freshcart-user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch (error) {
      console.error('Unable to read the saved user session.', error);
      return null;
    }
  }

  saveSession(token: string, user: SessionUser): void {
    localStorage.setItem('freshcart-token', token);
    localStorage.setItem('freshcart-user', JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem('freshcart-token');
    localStorage.removeItem('freshcart-user');
  }
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}
