const daoEvent = require("../daos/event");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

function getAll() {
  return daoEvent.find().sort({ date: 1 });
}

function getAllByOwnerId(id) {
  return daoEvent
    .find({
      owner: id,
    })
    .sort({ date: 1 })
    .populate("restaurant", "name");
}

function getAllByRestaurantId(id) {
  return daoEvent
    .find({
      restaurant: id,
    })
    .sort({ date: 1 });
}

function getEventById(id) {
  return daoEvent.findById(id).populate("restaurant");
}

async function createEvent(event) {
  const createdEvent = await daoEvent.create(event);
  return await daoEvent.findById(createdEvent._id).populate("restaurant");
}

function updateEvent(id, event) {
  return daoEvent
    .findByIdAndUpdate(id, event, { new: true })
    .populate("restaurant");
}

function deleteEvent(id) {
  return daoEvent.findByIdAndDelete(id);
} 