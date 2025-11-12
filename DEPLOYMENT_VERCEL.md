# Vercel 배포 설정 가이드

## 필수 Vercel 설정

### 1. Root Directory 설정
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **General**
3. **Root Directory** 섹션 찾기
4. `client` 입력
5. **Save** 클릭

### 2. Build & Development Settings 확인
Settings → General에서 자동으로 설정되어야 함:
- **Framework Preset**: Vite (또는 Other)
- **Root Directory**: `client`
- **Build Command**: `npm run build` (자동)
- **Output Directory**: `dist` (자동)
- **Install Command**: `npm install` (자동)

### 3. Environment Variables 설정
Settings → Environment Variables에서 추가:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://your-heroku-app.herokuapp.com` (Heroku 앱 URL)
- **Environment**: Production, Preview, Development 모두 선택

### 4. 배포
1. Git에 푸시하면 자동 배포
2. 또는 Deployments 탭에서 수동으로 **Redeploy**

## 문제 해결

### 빌드 실패 시
- Root Directory가 `client`로 설정되어 있는지 확인
- Build Command가 `npm run build`인지 확인
- Output Directory가 `dist`인지 확인

### 빈 화면이 보일 때
- 브라우저 콘솔(F12)에서 에러 확인
- Network 탭에서 API 호출 확인
- `VITE_API_BASE_URL` 환경 변수가 올바르게 설정되었는지 확인

