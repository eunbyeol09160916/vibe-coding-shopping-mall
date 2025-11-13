const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
} = require('../controllers/cartController');

// 모든 장바구니 라우트는 인증이 필요함
router.use(authenticateToken);

// 장바구니 조회 (GET /api/cart)
router.get('/', getCart);

// 장바구니에 상품 추가 (POST /api/cart/items)
router.post('/items', addItemToCart);

// 장바구니에서 상품 수량 업데이트 (PUT /api/cart/items/:productId)
router.put('/items/:productId', updateCartItem);

// 장바구니에서 상품 제거 (DELETE /api/cart/items/:productId)
router.delete('/items/:productId', removeItemFromCart);

// 장바구니 비우기 (DELETE /api/cart)
router.delete('/', clearCart);

module.exports = router;





