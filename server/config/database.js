const mongoose = require('mongoose');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// MongoDB 서비스 시작 시도 (조용히 실행)
const startMongoDBService = async () => {
  try {
    await execAsync('net start MongoDB');
    return true;
  } catch (error) {
    // 서비스가 이미 실행 중인 경우는 정상
    if (error.message.includes('서비스가 이미 시작되었습니다') || 
        error.message.includes('service has already been started') ||
        error.message.includes('has already been started')) {
      return true;
    }
    // 권한이 없거나 다른 오류인 경우 그냥 넘어감 (연결 시도는 계속 진행)
    return false;
  }
};

const connectDB = async () => {
  try {
    // MONGODB_ATLAS_URL이 있으면 우선 사용, 없으면 로컬 주소 사용
    const mongoURI = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/shopping-mall';
    
    // 로컬 MongoDB를 사용하는 경우에만 서비스 시작 시도
    if (!process.env.MONGODB_ATLAS_URL) {
      // 먼저 MongoDB 서비스 시작 시도 (조용히)
      await startMongoDBService();
      
      // 서비스 시작 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10초 타임아웃
    });

    console.log('✅ MongoDB 연결 성공');
    if (process.env.MONGODB_ATLAS_URL) {
      console.log('   📡 MongoDB Atlas 사용 중');
    } else {
      console.log('   💻 로컬 MongoDB 사용 중');
    }
    return true;
  } catch (error) {
    console.log('❌ MongoDB 연결 실패');
    return false;
  }
};

module.exports = connectDB;

