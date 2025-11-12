# 배포 가이드

## 배포 순서

### 1단계: Heroku (Server) 배포
1. Heroku 웹사이트 접속: https://dashboard.heroku.com
2. "New" → "Create new app" 클릭
3. 앱 이름 입력 후 "Create app"
4. "Settings" 탭 → "Config Vars" → "Reveal Config Vars" 클릭
5. 다음 환경 변수 추가:
   - `MONGODB_ATLAS_URL`: MongoDB Atlas 연결 문자열
   - `CLIENT_URL`: Vercel 배포 후 URL (나중에 업데이트)
   - `JWT_SECRET`: JWT 토큰 암호화 키 (선택사항)
6. "Deploy" 탭 → "Deployment method" → "GitHub" 선택
7. 저장소 연결 후 "Deploy branch" 클릭
8. 배포 완료 후 URL 확인 (예: https://your-app-name.herokuapp.com)

### 2단계: Vercel (Client) 배포
1. Vercel 웹사이트 접속: https://vercel.com
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. "Environment Variables" 섹션에서 추가:
   - `VITE_API_BASE_URL`: Heroku 서버 URL (예: https://your-app-name.herokuapp.com)
6. "Deploy" 클릭
7. 배포 완료 후 URL 확인

### 3단계: Heroku CORS 업데이트
1. Heroku 대시보드로 돌아가기
2. "Settings" → "Config Vars" → "Reveal Config Vars"
3. `CLIENT_URL` 값을 Vercel URL로 업데이트
4. "More" → "Restart all dynos" 클릭

## 환경 변수 요약

### Heroku (Server)
- `MONGODB_ATLAS_URL`: MongoDB Atlas 연결 문자열
- `CLIENT_URL`: Vercel 클라이언트 URL
- `PORT`: 자동 설정됨 (수정 불필요)

### Vercel (Client)
- `VITE_API_BASE_URL`: Heroku 서버 URL

## 배포 후 확인사항
1. Heroku 서버가 정상 작동하는지 확인
2. Vercel 클라이언트가 정상 작동하는지 확인
3. 브라우저 콘솔에서 CORS 오류 확인
4. API 호출이 정상 작동하는지 확인

