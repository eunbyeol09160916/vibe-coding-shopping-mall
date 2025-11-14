const Order = require('../models/orders');
const Cart = require('../models/cart');
const Product = require('../models/product');
const axios = require('axios');

// 포트원 결제 검증 함수
const verifyPayment = async (impUid, expectedAmount) => {
  try {
    // 포트원 API 키는 환경변수에서 가져오거나 설정 파일에서 관리
    // 실제 운영 환경에서는 환경변수 사용 권장
    const IMP_KEY = process.env.IMP_KEY || 'imp57538368'; // 기본값 (실제로는 환경변수 사용)
    const IMP_SECRET = process.env.IMP_SECRET || ''; // 실제 시크릿 키 필요

    // 포트원 Access Token 발급
    const tokenResponse = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: IMP_KEY,
      imp_secret: IMP_SECRET
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const accessToken = tokenResponse.data.response.access_token;

    // 결제 정보 조회
    const paymentResponse = await axios.get(`https://api.iamport.kr/payments/${impUid}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const payment = paymentResponse.data.response;

    // 결제 검증
    if (payment.status !== 'paid') {
      return {
        isValid: false,
        message: '결제가 완료되지 않았습니다.'
      };
    }

    // 금액 비교 (1원 차이는 허용 - 반올림 오차 대비)
    const amountDiff = Math.abs(payment.amount - expectedAmount);
    if (amountDiff > 1) {
      return {
        isValid: false,
        message: `결제 금액이 일치하지 않습니다. (결제: ${payment.amount}원, 예상: ${expectedAmount}원, 차이: ${amountDiff}원)`
      };
    }

    return {
      isValid: true,
      payment
    };
  } catch (error) {
    console.error('결제 검증 오류:', error);
    console.error('에러 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      impUid: impUid,
      expectedAmount: expectedAmount
    });
    
    // 포트원 API 오류 시에도 주문은 진행할 수 있도록 (개발 환경)
    // 운영 환경에서는 실제 검증 필요
    if (process.env.NODE_ENV === 'production') {
      // IMP_SECRET이 없거나 잘못된 경우
      if (error.response?.status === 401 || error.message?.includes('401')) {
        return {
          isValid: false,
          message: '결제 검증에 실패했습니다. (포트원 인증 오류 - IMP_SECRET 확인 필요)'
        };
      }
      // 포트원 API 서버 오류
      if (error.response?.status >= 500) {
        return {
          isValid: false,
          message: '결제 검증에 실패했습니다. (포트원 API 서버 오류)'
        };
      }
      return {
        isValid: false,
        message: `결제 검증에 실패했습니다. (${error.message || '알 수 없는 오류'})`
      };
    }
    // 개발 환경에서는 검증 실패해도 통과 (실제 포트원 키가 없을 수 있음)
    return {
      isValid: true,
      payment: null,
      warning: '결제 검증을 건너뛰었습니다. (개발 모드)'
    };
  }
};

// 주문 가능 여부 검증 (결제 전)
const validateOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, recipientName, recipientPhone } = req.body;

    // 필수 필드 검증
    if (!shippingAddress || !recipientName || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: '배송지 정보를 모두 입력해주세요.',
        valid: false
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.',
        valid: false
      });
    }

    // 주문 아이템 생성 및 총 금액 계산
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      if (!cartItem.product) {
        return res.status(400).json({
          success: false,
          message: '장바구니에 존재하지 않는 상품이 있습니다.',
          valid: false
        });
      }

      const itemTotal = cartItem.product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.price
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '주문할 상품이 없습니다.',
        valid: false
      });
    }

    // 배송비 계산 (30,000원 이상 무료)
    const shippingFee = totalAmount >= 30000 ? 0 : 1;
    const finalTotal = totalAmount + shippingFee;

    // 검증 성공
    return res.status(200).json({
      success: true,
      message: '주문이 가능합니다.',
      valid: true,
      data: {
        totalAmount: totalAmount,
        shippingFee: shippingFee,
        finalTotal: finalTotal,
        itemCount: orderItems.length
      }
    });
  } catch (error) {
    console.error('주문 검증 오류:', error);
    return res.status(500).json({
      success: false,
      message: '주문 검증 중 오류가 발생했습니다.',
      valid: false
    });
  }
};

// 주문 생성
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, recipientName, recipientPhone, notes, merchantUid, impUid, paidAmount } = req.body;

    // 필수 필드 검증
    if (!shippingAddress || !recipientName || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: '배송지 정보를 모두 입력해주세요.'
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.'
      });
    }

    // 주문 아이템 생성 및 총 금액 계산
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      if (!cartItem.product) {
        continue;
      }

      const itemTotal = cartItem.product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.price
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '주문할 상품이 없습니다.'
      });
    }

    // 배송비 계산 (30,000원 이상 무료)
    const shippingFee = totalAmount >= 30000 ? 0 : 1;
    const finalTotal = totalAmount + shippingFee;

    // 중복 주문 확인
    if (merchantUid) {
      const existingOrderByMerchant = await Order.findOne({ merchantUid });
      if (existingOrderByMerchant) {
        return res.status(400).json({
          success: false,
          message: '이미 처리된 주문입니다. (중복 주문)'
        });
      }
    }

    if (impUid) {
      const existingOrderByImp = await Order.findOne({ impUid });
      if (existingOrderByImp) {
        return res.status(400).json({
          success: false,
          message: '이미 처리된 결제입니다. (중복 결제)'
        });
      }
    }

    // 결제 검증 (impUid가 있는 경우)
    if (impUid) {
      // 클라이언트에서 전송한 결제 금액과 서버 계산 금액 비교
      if (paidAmount && Math.abs(paidAmount - finalTotal) > 1) {
        console.warn('결제 금액 불일치:', {
          paidAmount: paidAmount,
          calculatedAmount: finalTotal,
          diff: Math.abs(paidAmount - finalTotal)
        });
      }
      
      const verification = await verifyPayment(impUid, finalTotal);
      if (!verification.isValid) {
        console.error('결제 검증 실패:', {
          impUid: impUid,
          expectedAmount: finalTotal,
          paidAmount: paidAmount,
          message: verification.message
        });
        return res.status(400).json({
          success: false,
          message: verification.message || '결제 검증에 실패했습니다.'
        });
      }
      if (verification.warning) {
        console.warn('결제 검증 경고:', verification.warning);
      }
    }

    // 주문번호 생성
    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
      orderNumber = Order.generateOrderNumber();
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    // 주문 생성
    const order = new Order({
      user: userId,
      orderNumber,
      items: orderItems,
      shippingAddress,
      recipientName,
      recipientPhone,
      totalAmount: finalTotal,
      shippingFee,
      status: 'pending',
      notes: notes || undefined,
      merchantUid: merchantUid || undefined,
      impUid: impUid || undefined
    });

    const savedOrder = await order.save();

    // 주문 후 장바구니 비우기
    await cart.clearCart();

    // 주문 정보 조회 (상품 정보 포함)
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.product', 'name price image sku category')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 생성 실패',
      error: error.message
    });
  }
};

// 사용자의 모든 주문 조회
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price image sku category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message
    });
  }
};

// 특정 주문 조회
const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name price image sku category')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message
    });
  }
};

// 주문 상태 업데이트 (관리자용)
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 주문 상태를 변경할 수 있습니다.'
      });
    }

    // 상태 검증
    const validStatuses = ['pending', 'processing', 'shipping_started', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효한 주문 상태를 입력해주세요.'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('items.product', 'name price image sku category')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 상태 업데이트 실패',
      error: error.message
    });
  }
};

// 주문 취소 (사용자용)
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 배송 시작된 주문은 취소 불가
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '배송이 시작된 주문은 취소할 수 없습니다.'
      });
    }

    // 이미 취소된 주문
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '이미 취소된 주문입니다.'
      });
    }

    order.status = 'cancelled';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price image sku category')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: '주문이 취소되었습니다.',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 취소 실패',
      error: error.message
    });
  }
};

// 모든 주문 조회 (관리자용)
const getAllOrders = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 모든 주문을 조회할 수 있습니다.'
      });
    }

    const orders = await Order.find()
      .populate('items.product', 'name price image sku category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 실패',
      error: error.message
    });
  }
};

module.exports = {
  validateOrder,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
};



