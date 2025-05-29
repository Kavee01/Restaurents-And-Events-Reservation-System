const ActivityBooking = require("../daos/activityBooking");
const User = require("../daos/user");
const Activity = require("../daos/activity");

module.exports = {
  getAllByUserId,
  getAllByActivityId,
  getAllByOwnerId,
  getActivityBookingById,
  createActivityBooking,
  updateActivityBooking,
  deleteActivityBooking,
  confirmBooking,
  cancelBooking
};

async function getAllByUserId(userId) {
  try {
    return await ActivityBooking.find({ user: userId })
      .populate("activity")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByActivityId(activityId) {
  try {
    return await ActivityBooking.find({ activity: activityId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByOwnerId(ownerId) {
  try {
    // Find all activities owned by this owner
    const activities = await Activity.find({ owner: ownerId });
    const activityIds = activities.map(activity => activity._id);
    
    // Find all bookings for these activities
    return await ActivityBooking.find({ activity: { $in: activityIds } })
      .populate("activity")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getActivityBookingById(id) {
  try {
    return await ActivityBooking.findById(id)
      .populate("activity")
      .populate("user", "firstName lastName email");
  } catch (err) {
    throw err;
  }
}

async function createActivityBooking(bookingData) {
  try {
    // Fetch the activity to check availability
    const activity = await Activity.findById(bookingData.activity);
    if (!activity) {
      throw new Error("Activity not found");
    }
    
    // Check if the selected date is available
    const selectedDate = new Date(bookingData.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const isDateAvailable = activity.date.some(date => {
      const activityDate = new Date(date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === selectedDate.getTime();
    });
    
    if (!isDateAvailable) {
      throw new Error("Selected date is not available for this activity");
    }
    
    // Check if there's enough capacity
    const existingBookings = await ActivityBooking.find({
      activity: bookingData.activity,
      date: {
        $gte: new Date(selectedDate),
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'cancelled' }
    });
    
    const totalParticipants = existingBookings.reduce(
      (sum, booking) => sum + booking.participants, 0
    );
    
    if (totalParticipants + bookingData.participants > activity.capacity) {
      throw new Error("Not enough capacity available on the selected date");
    }
    
    // Calculate total price
    bookingData.totalPrice = activity.price * bookingData.participants;
    
    // Create the booking
    const booking = new ActivityBooking(bookingData);
    return await booking.save();
  } catch (err) {
    throw err;
  }
}

async function updateActivityBooking(id, updates) {
  try {
    return await ActivityBooking.findByIdAndUpdate(id, updates, { new: true });
  } catch (err) {
    throw err;
  }
}

async function deleteActivityBooking(id) {
  try {
    return await ActivityBooking.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

async function confirmBooking(id) {
  try {
    return await ActivityBooking.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true }
    );
  } catch (err) {
    throw err;
  }
}

async function cancelBooking(id, reason) {
  try {
    return await ActivityBooking.findByIdAndUpdate(
      id, 
      { 
        status: 'cancelled',
        cancellationReason: reason
      },
      { new: true }
    );
  } catch (err) {
    throw err;
  }
} 