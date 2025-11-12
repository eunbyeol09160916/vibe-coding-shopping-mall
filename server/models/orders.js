const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  _id: true
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  shippingAddress: {
    type: String,
    required: true,
    trim: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientPhone: {
    type: String,
    required: true,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipping_started', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  merchantUid: {
    type: String,
    unique: true,
    sparse: true  // null 값은 중복으로 간주하지 않음
  },
  impUid: {
    type: String,
    unique: true,
    sparse: true  // null 값은 중복으로 간주하지 않음
  }
}, {
  timestamps: true  // createdAt과 updatedAt 자동 생성
});

// 주문번호 생성 (YYYYMMDD + 랜덤 6자리)
orderSchema.statics.generateOrderNumber = function() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
  return dateStr + randomStr;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;



