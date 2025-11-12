const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, {
  _id: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true  // createdAt과 updatedAt 자동 생성
});

// 장바구니에 상품 추가 전 중복 체크
cartSchema.methods.addItem = function(productId, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // 이미 장바구니에 있는 상품이면 수량만 증가
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // 새로운 상품이면 추가
    this.items.push({
      product: productId,
      quantity: quantity
    });
  }

  return this.save();
};

// 장바구니에서 상품 제거
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// 장바구니에서 상품 수량 업데이트
cartSchema.methods.updateQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      // 수량이 0 이하면 제거
      return this.removeItem(productId);
    }
    item.quantity = quantity;
    return this.save();
  }

  throw new Error('장바구니에 해당 상품이 없습니다.');
};

// 장바구니 비우기
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;




