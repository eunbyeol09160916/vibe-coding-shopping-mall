// API 서버 주소 설정
// Vercel 환경 변수에서 가져오기 (VITE_ 접두사 필요)
// 개발 환경에서는 localhost 사용

// 환경 변수를 여러 방법으로 시도
const getApiBaseUrl = () => {
  // 1. import.meta.env에서 직접 가져오기 (Vite 기본 방식)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('localhost')) {
    console.log('✅ Using VITE_API_BASE_URL from env:', envUrl);
    return envUrl;
  }
  
  // 2. window 객체에서 가져오기 (런타임 주입용)
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    console.log('✅ Using API_BASE_URL from window:', window.__API_BASE_URL__);
    return window.__API_BASE_URL__;
  }
  
  // 3. 프로덕션 환경에서 자동 감지
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Vercel 도메인에서 실행 중이면 Heroku URL 사용
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      // Heroku URL (임시 해결책 - 나중에 Vercel 환경 변수로 교체 권장)
      const herokuUrl = 'https://vibecoding-shoppingmall-454a9153ae83.herokuapp.com';
      console.warn('⚠️ VITE_API_BASE_URL이 설정되지 않아 기본 Heroku URL을 사용합니다.');
      console.warn('⚠️ Vercel에서 VITE_API_BASE_URL 환경 변수를 설정해주세요.');
      return herokuUrl;
    }
  }
  
  // 4. 프로덕션 환경에서는 localhost 사용 금지
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    console.error('❌ ERROR: VITE_API_BASE_URL is not set in production!');
    console.error('❌ Please set VITE_API_BASE_URL in Vercel environment variables!');
  }
  
  // 5. 기본값 (개발 환경)
  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();

// 디버깅: 항상 로그 출력
console.log('🔗 API Configuration:', {
  API_BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  allEnv: import.meta.env
});

// 프로덕션 환경에서 localhost를 사용하면 경고
if ((import.meta.env.MODE === 'production' || import.meta.env.PROD) && API_BASE_URL.includes('localhost')) {
  console.error('⚠️ WARNING: Using localhost in production!');
  console.error('⚠️ Please set VITE_API_BASE_URL environment variable in Vercel!');
  console.error('⚠️ Current API_BASE_URL:', API_BASE_URL);
}

// API 엔드포인트
export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CART: `${API_BASE_URL}/api/cart`,
  ORDERS: `${API_BASE_URL}/api/orders`,
};






