const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 모든 유저 조회
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // password 필드 제외
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// 특정 유저 조회
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// 유저 생성
const createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;
    
    // 필수 필드 검증
    if (!email || !name || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: '필수 필드(email, name, password, user_type)를 모두 입력해주세요.'
      });
    }
    
    // user_type 검증
    if (!['customer', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'user_type은 customer 또는 admin이어야 합니다.'
      });
    }
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    
    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 유저 생성
    const user = new User({
      email,
      name,
      password: hashedPassword,
      user_type,
      address: address || undefined
    });
    
    const savedUser = await user.save();
    
    // 비밀번호 제외하고 응답
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: '유저가 성공적으로 생성되었습니다.',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 생성 실패',
      error: error.message
    });
  }
};

// 유저 업데이트
const updateUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;
    
    const updateData = {};
    
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (user_type) {
      if (!['customer', 'admin'].includes(user_type)) {
        return res.status(400).json({
          success: false,
          message: 'user_type은 customer 또는 admin이어야 합니다.'
        });
      }
      updateData.user_type = user_type;
    }
    if (address !== undefined) updateData.address = address;
    
    // 비밀번호가 제공된 경우 해싱
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    // 이메일 변경 시 중복 확인
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 이메일입니다.'
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '유저가 성공적으로 업데이트되었습니다.',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 업데이트 실패',
      error: error.message
    });
  }
};

// 유저 삭제
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '유저가 성공적으로 삭제되었습니다.',
      data: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 삭제 실패',
      error: error.message
    });
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.'
      });
    }
    
    // 이메일 형식 검증 (간단한 검증)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }
    
    // 유저 찾기
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // JWT 토큰 생성
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: '서버 설정 오류: JWT_SECRET이 설정되지 않았습니다.'
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        user_type: user.user_type
      },
      JWT_SECRET,
      {
        expiresIn: '24h' // 토큰 만료 시간: 24시간
      }
    );
    
    // 비밀번호 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: {
        user: userResponse,
        token: token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '로그인 실패',
      error: error.message
    });
  }
};

// 현재 로그인된 유저 정보 조회
const getCurrentUser = async (req, res) => {
  try {
    // authenticateToken 미들웨어에서 req.user에 유저 정보가 저장됨
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증된 유저 정보를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 정보 조회 실패',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser
};





