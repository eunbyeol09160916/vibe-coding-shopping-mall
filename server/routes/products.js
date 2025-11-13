const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

// 모든 상품 조회 (GET /api/products)
router.get('/', getAllProducts);

// 특정 상품 조회 (GET /api/products/:id)
router.get('/:id', getProductById);

// 상품 생성 (POST /api/products)
router.post('/', createProduct);

// 상품 업데이트 (PUT /api/products/:id)
router.put('/:id', updateProduct);

// 상품 삭제 (DELETE /api/products/:id)
router.delete('/:id', deleteProduct);

module.exports = router;






