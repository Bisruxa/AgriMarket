const { prisma } = require('../config/db');

// @desc    Get all farms for the logged-in farmer
// @route   GET /api/farms
// @access  Private (Farmer)
exports.getMyFarms = async (req, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { 
        farmerId: req.user.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm by ID
// @route   GET /api/farms/:id
// @access  Private (Farmer - own farms only)
exports.getFarm = async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Ensure farmer can only access their own farms
    if (farm.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this farm'
      });
    }

    res.status(200).json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm land
// @route   POST /api/farms
// @access  Private (Farmer)
exports.createFarm = async (req, res, next) => {
  try {
    const {
      name,
      description,
      size,
      sizeUnit,
      region,
      woreda,
      kebele,
      latitude,
      longitude,
      soilType,
      waterSource,
      crops
    } = req.body;

    // Validate required field
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Farm name is required'
      });
    }

    // Check if farmer already has a farm with the same name
    const existingFarm = await prisma.farm.findFirst({
      where: {
        farmerId: req.user.id,
        name: name.trim(),
        isActive: true
      }
    });

    if (existingFarm) {
      return res.status(400).json({
        success: false,
        message: 'You already have a farm with this name'
      });
    }

    const farm = await prisma.farm.create({
      data: {
        name: name.trim(),
        description,
        size,
        sizeUnit,
        region,
        woreda,
        kebele,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        soilType,
        waterSource,
        crops: crops || [],
        farmerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a farm
// @route   PUT /api/farms/:id
// @access  Private (Farmer - own farms only)
exports.updateFarm = async (req, res, next) => {
  try {
    const {
      name,
      description,
      size,
      sizeUnit,
      region,
      woreda,
      kebele,
      latitude,
      longitude,
      soilType,
      waterSource,
      crops
    } = req.body;

    let farm = await prisma.farm.findUnique({
      where: { id: req.params.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Ensure farmer can only update their own farms
    if (farm.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm'
      });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== farm.name) {
      const existingFarm = await prisma.farm.findFirst({
        where: {
          farmerId: req.user.id,
          name: name.trim(),
          isActive: true,
          NOT: { id: req.params.id }
        }
      });

      if (existingFarm) {
        return res.status(400).json({
          success: false,
          message: 'You already have a farm with this name'
        });
      }
    }

    farm = await prisma.farm.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(size !== undefined && { size }),
        ...(sizeUnit !== undefined && { sizeUnit }),
        ...(region !== undefined && { region }),
        ...(woreda !== undefined && { woreda }),
        ...(kebele !== undefined && { kebele }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(soilType !== undefined && { soilType }),
        ...(waterSource !== undefined && { waterSource }),
        ...(crops !== undefined && { crops })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a farm (soft delete by setting isActive to false)
// @route   DELETE /api/farms/:id
// @access  Private (Farmer - own farms only)
exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Ensure farmer can only delete their own farms
    if (farm.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm'
      });
    }

    // Soft delete
    await prisma.farm.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all farms for a specific farmer (Admin only)
// @route   GET /api/farms/farmer/:farmerId
// @access  Private (Admin)
exports.getFarmsByFarmer = async (req, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { 
        farmerId: req.params.farmerId
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    next(error);
  }
};
