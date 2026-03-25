const { prisma } = require('../config/db');

// @desc    Get all products for traders (with enhanced filters)
// @route   GET /api/products
// @access  Private/Trader
exports.getProducts = async (req, res, next) => {
  try {
    const { 
      category,
      available,
      organic,
      minPrice,
      maxPrice,
      minStock,
      search,
      region,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause - only show available products by default
    const where = {
      isAvailable: available !== undefined ? available === 'true' : true
    };

    // Filter by category
    if (category) {
      where.category = category.toUpperCase();
    }

    // Filter by organic
    if (organic) {
      where.isOrganic = organic === 'true';
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filter by minimum stock (important for traders)
    if (minStock) {
      where.stock = { gte: parseInt(minStock) };
    }

    // Filter by region (farmer's region)
    if (region) {
      where.farmer = {
        region: { contains: region, mode: 'insensitive' }
      };
    }

    // Search by name/description/location
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Sorting options
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      switch (sortBy) {
        case 'price':
          orderBy = { price: order };
          break;
        case 'stock':
          orderBy = { stock: order };
          break;
        case 'rating':
          orderBy = { ratingsAverage: order };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'harvest':
          orderBy = { harvestDate: order };
          break;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

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
              phone: true,
              region: true,
              woreda: true,
              isVerified: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy
      })
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
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

// @desc    Get current farmer's products
// @route   GET /api/products/my-products
// @access  Private/Farmer
exports.getMyProducts = async (req, res, next) => {
  try {
    const { category, available, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const where = { farmerId: req.user.id };
    
    if (category) {
      where.category = category.toUpperCase();
    }
    
    if (available !== undefined) {
      where.isAvailable = available === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    next(error);
  }
};