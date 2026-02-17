const { prisma } = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // Build where clause
    const where = {};

    // Filter by category
    if (req.query.category) {
      where.category = req.query.category.toUpperCase();
    }

    // Filter by availability
    if (req.query.available) {
      where.isAvailable = req.query.available === 'true';
    }

    // Filter by organic
    if (req.query.organic) {
      where.isOrganic = req.query.organic === 'true';
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price.gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price.lte = parseFloat(req.query.maxPrice);
    }

    // Search by name/description
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

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
    const {
      name,
      description,
      price,
      unit,
      category,
      stock,
      images,
      location,
      isOrganic,
      harvestDate,
      expiryDate
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        unit: unit ? unit.toUpperCase() : 'KG',
        category: category.toUpperCase(),
        stock: parseInt(stock),
        images: images || [],
        location,
        isOrganic: isOrganic || false,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        farmerId: req.user.id
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

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
    let product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const {
      name,
      description,
      price,
      unit,
      category,
      stock,
      images,
      location,
      isOrganic,
      harvestDate,
      expiryDate,
      isAvailable
    } = req.body;

    product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(unit && { unit: unit.toUpperCase() }),
        ...(category && { category: category.toUpperCase() }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(images && { images }),
        ...(location && { location }),
        ...(isOrganic !== undefined && { isOrganic }),
        ...(harvestDate && { harvestDate: new Date(harvestDate) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

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
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

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
    const products = await prisma.product.findMany({
      where: { farmerId: req.params.farmerId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
