const jwt = require('jsonwebtoken');
const User = require('../models/user');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" 형식

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 제공되지 않았습니다.'
      });
    }

    // JWT_SECRET 가져오기
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: '서버 설정 오류: JWT_SECRET이 설정되지 않았습니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);

    // 유저 정보 가져오기
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }

    // req.user에 유저 정보 저장
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '토큰 검증 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }
};

module.exports = { authenticateToken };




