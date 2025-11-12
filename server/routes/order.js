const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/orderController');

// 모든 주문 라우트는 인증이 필요함
router.use(authenticateToken);

// 주문 생성 (POST /api/orders)
router.post('/', createOrder);

// '주문 목록’ 페이지 (사용자용)  (GET /api/orders)
router.get('/', getUserOrders);

// '주문 관리’ 페이지 (관리자용) (GET /api/orders/all)
router.get('/all', getAllOrders);

// 특정 주문 조회 (GET /api/orders/:id)
router.get('/:id', getOrderById);

// 주문 상태 업데이트 - 관리자용 (PUT /api/orders/:id/status)
router.put('/:id/status', updateOrderStatus);
// 주문 상태 업데이트 - 관리자용 (PATCH /api/orders/:id/status)
router.patch('/:id/status', updateOrderStatus);

// 주문 취소 (PUT /api/orders/:id/cancel)
router.put('/:id/cancel', cancelOrder);

module.exports = router;



