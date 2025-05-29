const daoActivity = require("../daos/activity");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};

function getAll() {
  return daoActivity.find().sort({ createdAt: -1 });
}

function getAllByOwnerId(id) {
  return daoActivity
    .find({
      owner: id,
    })
    .sort({ createdAt: -1 });
}

// This function is kept for backwards compatibility
function getAllByRestaurantId(id) {
  // Since activities are no longer tied to restaurants,
  // we return an empty array or all activities for public viewing
  return daoActivity.find().sort({ createdAt: -1 });
}

function getActivityById(id) {
  return daoActivity.findById(id);
}

async function createActivity(activity) {
  const createdActivity = await daoActivity.create(activity);
  return await daoActivity.findById(createdActivity._id);
}

function updateActivity(id, activity) {
  return daoActivity
    .findByIdAndUpdate(id, activity, { new: true });
}

function deleteActivity(id) {
  return daoActivity.findByIdAndDelete(id);
} 