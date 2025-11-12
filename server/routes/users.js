const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser
} = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// 모든 유저 조회 (GET /api/users)
router.get('/', getAllUsers);

// 현재 로그인된 유저 정보 조회 (GET /api/users/me) - 인증 필요
router.get('/me', authenticateToken, getCurrentUser);

// 특정 유저 조회 (GET /api/users/:id)
router.get('/:id', getUserById);

// 유저 생성 (POST /api/users)
router.post('/', createUser);

// 로그인 (POST /api/users/login)
router.post('/login', loginUser);

// 유저 업데이트 (PUT /api/users/:id)
router.put('/:id', updateUser);

// 유저 삭제 (DELETE /api/users/:id)
router.delete('/:id', deleteUser);

module.exports = router;

