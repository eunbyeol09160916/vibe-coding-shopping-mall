// API 서버 주소 설정
// Vercel 환경 변수에서 가져오기 (VITE_ 접두사 필요)
// 개발 환경에서는 localhost 사용
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// 디버깅: 프로덕션 환경에서만 로그 출력
if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
  console.log('🔗 API Configuration:', {
    API_BASE_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD
  });
}

// API 엔드포인트
export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CART: `${API_BASE_URL}/api/cart`,
  ORDERS: `${API_BASE_URL}/api/orders`,
};






