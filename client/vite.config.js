import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 확인
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  console.log('🔧 Vite Config - API Base URL:', apiBaseUrl);
  console.log('🔧 Vite Config - Mode:', mode);
  console.log('🔧 Vite Config - All env vars:', process.env);
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    // 환경 변수를 명시적으로 정의
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl)
    }
  }
})












