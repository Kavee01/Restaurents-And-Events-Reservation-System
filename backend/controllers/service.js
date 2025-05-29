const modelService = require("../models/service");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getOneById,
  createService,
  updateService,
  deleteService,
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
async function getAll(req, res) {
  try {
    const services = await modelService.getAll();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all services by owner ID
// @route   GET /api/services/owner
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const services = await modelService.getAllByOwnerId(req.user.id);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all services by restaurant ID
// @route   GET /api/services/restaurant/:restId
// @access  Public
async function getAllByRestaurantId(req, res) {
  try {
    const services = await modelService.getAllByRestaurantId(req.params.restId);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one service by ID
// @route   GET /api/services/:id
// @access  Public
async function getOneById(req, res) {
  try {
    const service = await modelService.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ errorMsg: "Service not found" });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Owner only)
async function createService(req, res) {
  try {
    // Create the service
    const service = await modelService.createService({
      ...req.body,
      owner: req.user.id
    });
    
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
async function updateService(req, res) {
  try {
    // Check if the service exists
    const service = await modelService.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ errorMsg: "Service not found" });
    }
    
    // Check if the service belongs to the owner
    if (service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Update the service
    const updatedService = await modelService.updateService(req.params.id, req.body);
    res.json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
async function deleteService(req, res) {
  try {
    // Check if the service exists
    const service = await modelService.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ errorMsg: "Service not found" });
    }
    
    // Check if the service belongs to the owner
    if (service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Delete the service
    await modelService.deleteService(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 