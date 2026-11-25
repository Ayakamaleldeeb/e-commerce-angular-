import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof localStorage === 'undefined') return next(request);
  const token = localStorage.getItem('freshcart-token');
  if (!token) return next(request);
  return next(request.clone({ setHeaders: { token } }));
};
