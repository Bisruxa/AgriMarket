const productService = require('../services/product.service');

// @desc    Get all products for traders (with enhanced filters)
// @route   GET /api/products
// @access  Private/Trader
exports.getProducts = async (req, res, next) => {
  try {
    const { products, total, pagination } = await productService.getProducts(req.query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Farmer
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Farmer
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.user, req.body);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by farmer
// @route   GET /api/products/farmer/:farmerId
// @access  Public
exports.getProductsByFarmer = async (req, res, next) => {
  try {
    const products = await productService.getProductsByFarmer(req.params.farmerId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current farmer's products
// @route   GET /api/products/my-products
// @access  Private/Farmer
exports.getMyProducts = async (req, res, next) => {
  try {
    const { products, total, page, pages } = await productService.getMyProducts(
      req.user.id,
      req.query
    );

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
