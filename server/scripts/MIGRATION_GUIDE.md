# 데이터베이스 마이그레이션 가이드

`shoping-mall` 데이터베이스의 데이터를 `shopping-mall` 데이터베이스로 옮기는 방법입니다.

## 📋 방법 1: 자동 마이그레이션 스크립트 (추천)

가장 간단하고 안전한 방법입니다.

### 실행 방법:
```bash
cd server
npm run migrate
```

### 동작 방식:
- `shoping-mall` 데이터베이스에서 모든 사용자 데이터를 읽어옵니다
- `shopping-mall` 데이터베이스로 데이터를 복사합니다
- 중복된 이메일은 자동으로 건너뜁니다
- 상세한 진행 상황을 출력합니다

### 장점:
- ✅ 자동으로 처리
- ✅ 중복 방지
- ✅ 상세한 로그 제공
- ✅ 안전 (기존 데이터는 그대로 유지)

---

## 📋 방법 2: MongoDB Compass를 사용한 수동 마이그레이션

GUI를 사용하는 방법입니다.

### 단계:
1. **MongoDB Compass 열기**
   - `localhost:27017`에 연결

2. **기존 데이터 확인**
   - `shoping-mall` 데이터베이스 선택
   - `users` 컬렉션 선택
   - 모든 문서 확인

3. **데이터 복사**
   - 각 문서를 클릭하여 JSON 형태로 확인
   - JSON 데이터 복사

4. **새 데이터베이스에 붙여넣기**
   - `shopping-mall` 데이터베이스 선택
   - `users` 컬렉션 선택
   - "INSERT DOCUMENT" 클릭
   - 복사한 JSON 데이터 붙여넣기
   - "INSERT" 클릭

5. **반복**
   - 모든 문서에 대해 3-4단계 반복

### 장점:
- ✅ 시각적으로 확인 가능
- ✅ 데이터를 직접 확인하면서 작업

### 단점:
- ❌ 수동 작업 (시간 소요)
- ❌ 실수 가능성

---

## 📋 방법 3: MongoDB 셸(mongosh) 사용

명령줄을 사용하는 방법입니다.

### 실행 방법:
1. **MongoDB 셸 열기**
   ```bash
   mongosh
   ```

2. **기존 데이터베이스 선택**
   ```javascript
   use shoping-mall
   ```

3. **데이터 확인**
   ```javascript
   db.users.find().pretty()
   ```

4. **데이터 복사**
   ```javascript
   // 모든 사용자 데이터를 변수에 저장
   var users = db.users.find().toArray()
   ```

5. **새 데이터베이스로 전환**
   ```javascript
   use shopping-mall
   ```

6. **데이터 삽입**
   ```javascript
   // 각 사용자 데이터 삽입
   users.forEach(function(user) {
       delete user._id;  // _id는 새로 생성되도록 삭제
       db.users.insertOne(user);
   });
   ```

### 장점:
- ✅ 빠른 처리
- ✅ 한 번에 모든 데이터 처리 가능

### 단점:
- ❌ 명령어를 알아야 함
- ❌ 실수 시 위험

---

## ⚠️ 주의사항

1. **백업 권장**
   - 마이그레이션 전에 기존 데이터베이스를 백업하는 것을 권장합니다

2. **서버 중지**
   - 마이그레이션 중에는 서버를 중지하는 것이 좋습니다
   - 데이터 일관성을 위해

3. **확인 후 삭제**
   - 마이그레이션이 완료된 후
   - `shopping-mall` 데이터베이스에 모든 데이터가 있는지 확인
   - 확인 후에만 `shoping-mall` 데이터베이스 삭제

4. **기존 데이터베이스 삭제 방법**
   - MongoDB Compass에서 `shoping-mall` 데이터베이스 선택
   - 휴지통 아이콘 클릭
   - 또는 MongoDB 셸에서: `use shoping-mall` → `db.dropDatabase()`

---

## 🎯 추천 순서

1. **방법 1 (자동 스크립트)** 사용 ← 가장 추천
2. MongoDB Compass에서 결과 확인
3. 모든 데이터가 정상적으로 옮겨졌는지 확인
4. 기존 `shoping-mall` 데이터베이스 삭제







