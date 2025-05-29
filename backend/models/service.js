const daoService = require("../daos/service");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getServiceById,
  createService,
  updateService,
  deleteService,
};

function getAll() {
  return daoService.find().sort({ createdAt: -1 });
}

function getAllByOwnerId(id) {
  return daoService
    .find({
      owner: id,
    })
    .sort({ createdAt: -1 });
}

// This function is kept for backwards compatibility
function getAllByRestaurantId(id) {
  // Since services are no longer tied to restaurants,
  // we return an empty array or all services for public viewing
  return daoService.find().sort({ createdAt: -1 });
}

function getServiceById(id) {
  return daoService.findById(id);
}

async function createService(service) {
  const createdService = await daoService.create(service);
  return await daoService.findById(createdService._id);
}

function updateService(id, service) {
  return daoService
    .findByIdAndUpdate(id, service, { new: true });
}

function deleteService(id) {
  return daoService.findByIdAndDelete(id);
} 