const Cart = require('../models/cart');
const Product = require('../models/product');

// 장바구니 조회 (현재 사용자의 장바구니)
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    // 장바구니가 없으면 생성
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    // 총 금액 계산
    const totalAmount = cart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        cart: cart,
        totalAmount: totalAmount,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 조회 실패',
      error: error.message
    });
  }
};

// 장바구니에 상품 추가
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // 필수 필드 검증
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID를 입력해주세요.'
      });
    }

    // 수량 검증
    const itemQuantity = quantity && quantity > 0 ? quantity : 1;

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 상품 추가
    await cart.addItem(productId, itemQuantity);

    // 업데이트된 장바구니 조회
    const updatedCart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    // 총 금액 계산
    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      message: '장바구니에 상품이 추가되었습니다.',
      data: {
        cart: updatedCart,
        totalAmount: totalAmount,
        itemCount: updatedCart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니에 상품 추가 실패',
      error: error.message
    });
  }
};

// 장바구니에서 상품 수량 업데이트
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // 수량 검증
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: '수량을 입력해주세요.'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: '수량은 0 이상이어야 합니다.'
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    // 수량 업데이트
    await cart.updateQuantity(productId, quantity);

    // 업데이트된 장바구니 조회
    const updatedCart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    // 총 금액 계산
    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      message: '장바구니가 업데이트되었습니다.',
      data: {
        cart: updatedCart,
        totalAmount: totalAmount,
        itemCount: updatedCart.items.length
      }
    });
  } catch (error) {
    if (error.message === '장바구니에 해당 상품이 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: '장바구니 업데이트 실패',
      error: error.message
    });
  }
};

// 장바구니에서 상품 제거
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 상품 존재 확인
    const itemExists = cart.items.some(
      item => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 상품이 없습니다.'
      });
    }

    // 상품 제거
    await cart.removeItem(productId);

    // 업데이트된 장바구니 조회
    const updatedCart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    // 총 금액 계산
    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      message: '장바구니에서 상품이 제거되었습니다.',
      data: {
        cart: updatedCart,
        totalAmount: totalAmount,
        itemCount: updatedCart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니에서 상품 제거 실패',
      error: error.message
    });
  }
};

// 장바구니 비우기
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 장바구니 비우기
    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: '장바구니가 비워졌습니다.',
      data: {
        cart: cart,
        totalAmount: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 비우기 실패',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
};





