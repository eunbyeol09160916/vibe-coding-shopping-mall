const mongoose = require('mongoose');
require('dotenv').config();

async function migrateData() {
  let oldDB, newDB;
  
  try {
    console.log('🔄 데이터 마이그레이션 시작...\n');
    
    // 기존 데이터베이스와 새 데이터베이스 연결
    console.log('📡 데이터베이스 연결 중...');
    oldDB = mongoose.createConnection('mongodb://localhost:27017/shoping-mall', {
      serverSelectionTimeoutMS: 5000
    });
    newDB = mongoose.createConnection('mongodb://localhost:27017/shopping-mall', {
      serverSelectionTimeoutMS: 5000
    });
    
    // 연결 대기
    await Promise.all([
      oldDB.asPromise(),
      newDB.asPromise()
    ]);
    console.log('✅ 두 데이터베이스 연결 성공\n');
    
    // User 스키마 (두 데이터베이스 모두에서 사용)
    const userSchema = new mongoose.Schema({
      email: String,
      name: String,
      password: String,
      user_type: String,
      address: String,
      createdAt: Date,
      updatedAt: Date
    }, { 
      strict: false,  // strict: false로 모든 필드 허용
      collection: 'users'  // 컬렉션 이름 명시
    });

    const OldUser = oldDB.model('User', userSchema);
    const NewUser = newDB.model('User', userSchema);
    
    // 기존 데이터베이스에서 모든 사용자 가져오기
    console.log('📦 기존 데이터베이스에서 데이터 조회 중...');
    const oldUsers = await OldUser.find({}).lean(); // lean()으로 일반 객체로 변환
    console.log(`   발견된 사용자: ${oldUsers.length}개\n`);
    
    if (oldUsers.length === 0) {
      console.log('⚠️  옮길 데이터가 없습니다.');
      return;
    }
    
    // 기존 데이터 확인
    console.log('📋 기존 데이터 목록:');
    oldUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name})`);
    });
    console.log('');
    
    // 새 데이터베이스의 기존 데이터 확인
    const existingNewUsers = await NewUser.find({}).lean();
    console.log(`📋 새 데이터베이스의 기존 데이터: ${existingNewUsers.length}개`);
    if (existingNewUsers.length > 0) {
      existingNewUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name})`);
      });
      console.log('');
    }
    
    // 새 데이터베이스로 데이터 복사
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    console.log('🔄 데이터 마이그레이션 진행 중...\n');
    
    for (const user of oldUsers) {
      try {
        // 새 데이터베이스에 이미 같은 이메일이 있는지 확인
        const existingUser = await NewUser.findOne({ email: user.email });
        
        if (existingUser) {
          console.log(`⏭️  ${user.email} - 이미 존재 (건너뜀)`);
          skipCount++;
          continue;
        }
        
        // 새 데이터베이스에 사용자 추가
        const userData = { ...user };
        delete userData._id; // _id는 새로 생성되도록
        delete userData.__v; // __v 버전 필드 제거
        
        const newUser = await NewUser.create(userData);
        successCount++;
        console.log(`✅ ${user.email} - 마이그레이션 완료 (ID: ${newUser._id})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ ${user.email} - 마이그레이션 실패:`, error.message);
      }
    }
    
    // 최종 확인
    const finalNewUsers = await NewUser.find({}).lean();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 마이그레이션 결과:');
    console.log('='.repeat(50));
    console.log(`   ✅ 성공적으로 추가: ${successCount}개`);
    console.log(`   ⏭️  건너뜀 (이미 존재): ${skipCount}개`);
    console.log(`   ❌ 실패: ${errorCount}개`);
    console.log(`   📦 원본 데이터: ${oldUsers.length}개`);
    console.log(`   📦 새 데이터베이스 총 데이터: ${finalNewUsers.length}개`);
    console.log('='.repeat(50));
    
    if (successCount > 0 || skipCount > 0) {
      console.log('\n✨ 마이그레이션이 완료되었습니다!');
      console.log('💡 MongoDB Compass에서 "shopping-mall" 데이터베이스를 확인해보세요.');
      console.log('💡 확인 후 기존 "shoping-mall" 데이터베이스를 삭제해도 됩니다.');
    } else {
      console.log('\n⚠️  마이그레이션할 데이터가 없거나 모두 이미 존재합니다.');
    }
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 중 오류 발생:');
    console.error('   오류 내용:', error.message);
    if (error.stack) {
      console.error('\n   상세 오류:');
      console.error(error.stack);
    }
  } finally {
    if (oldDB) {
      await oldDB.close();
      console.log('\n🔌 기존 데이터베이스 연결 종료');
    }
    if (newDB) {
      await newDB.close();
      console.log('🔌 새 데이터베이스 연결 종료');
    }
    process.exit(0);
  }
}

// 마이그레이션 실행
migrateData();

