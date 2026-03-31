const { prisma } = require('../config/db');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getProducts = async (query) => {
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
  } = query;

  const where = {
    isAvailable: available !== undefined ? available === 'true' : true
  };

  if (category) {
    where.category = category.toUpperCase();
  }

  if (organic) {
    where.isOrganic = organic === 'true';
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (minStock) {
    where.stock = { gte: parseInt(minStock) };
  }

  if (region) {
    where.farmer = {
      region: { contains: region, mode: 'insensitive' }
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } }
    ];
  }

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

  return {
    products,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getProductById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
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
    throw createError('Product not found', 404);
  }

  return product;
};

const createProduct = async (userId, payload) => {
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
  } = payload;

  return prisma.product.create({
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
      farmerId: userId
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
};

const updateProduct = async (productId, user, payload) => {
  let product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  if (product.farmerId !== user.id && user.role !== 'ADMIN') {
    throw createError('Not authorized to update this product', 403);
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
  } = payload;

  product = await prisma.product.update({
    where: { id: productId },
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

  return product;
};

const deleteProduct = async (productId, user) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  if (product.farmerId !== user.id && user.role !== 'ADMIN') {
    throw createError('Not authorized to delete this product', 403);
  }

  await prisma.product.delete({
    where: { id: productId }
  });
};

const getProductsByFarmer = async (farmerId) => {
  return prisma.product.findMany({
    where: { farmerId },
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
};

const getMyProducts = async (userId, query) => {
  const { category, available, page = 1, limit = 10 } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { farmerId: userId };

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

  return {
    products,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  };
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFarmer,
  getMyProducts
};
