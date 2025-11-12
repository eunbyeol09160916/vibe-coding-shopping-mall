const Product = require('../models/product');

// 모든 상품 조회
const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 3, 1);

    const totalItems = await Product.countDocuments();
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: safePage,
        limit,
        totalItems,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};

// 특정 상품 조회
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};

// 상품 생성
const createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;
    
    // 필수 필드 검증
    if (!sku || !name || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: '필수 필드(sku, name, price, category, image)를 모두 입력해주세요.'
      });
    }
    
    // 카테고리 검증
    if (!['구미', '젤리', '젤리빈'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: '카테고리는 구미, 젤리, 젤리빈 중 하나여야 합니다.'
      });
    }
    
    // 가격 검증
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상의 숫자여야 합니다.'
      });
    }
    
    // SKU 중복 확인
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 SKU입니다.'
      });
    }
    
    // 상품 생성
    const product = new Product({
      sku: sku.toUpperCase(),
      name,
      price,
      category,
      image,
      description: description || undefined
    });
    
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 생성되었습니다.',
      data: savedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 생성 실패',
      error: error.message
    });
  }
};

// 상품 업데이트
const updateProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;
    
    const updateData = {};
    
    if (sku) {
      // SKU 변경 시 중복 확인
      const existingProduct = await Product.findOne({ 
        sku: sku.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다.'
        });
      }
      updateData.sku = sku.toUpperCase();
    }
    if (name) updateData.name = name;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          success: false,
          message: '가격은 0 이상의 숫자여야 합니다.'
        });
      }
      updateData.price = price;
    }
    if (category) {
      if (!['구미', '젤리', '젤리빈'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: '카테고리는 구미, 젤리, 젤리빈 중 하나여야 합니다.'
        });
      }
      updateData.category = category;
    }
    if (image) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 업데이트되었습니다.',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 업데이트 실패',
      error: error.message
    });
  }
};

// 상품 삭제
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
      data: {
        id: product._id,
        sku: product.sku,
        name: product.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제 실패',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

