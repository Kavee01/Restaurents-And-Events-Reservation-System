const ServiceBooking = require("../daos/serviceBooking");
const User = require("../daos/user");
const Service = require("../daos/service");

module.exports = {
  getAllByUserId,
  getAllByServiceId,
  getAllByOwnerId,
  getServiceBookingById,
  createServiceBooking,
  updateServiceBooking,
  deleteServiceBooking,
  confirmBooking,
  cancelBooking
};

async function getAllByUserId(userId) {
  try {
    return await ServiceBooking.find({ user: userId })
      .populate("service")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByServiceId(serviceId) {
  try {
    return await ServiceBooking.find({ service: serviceId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByOwnerId(ownerId) {
  try {
    console.log("Finding service bookings for owner:", ownerId);
    
    // First, let's check if there are any bookings at all
    const allBookings = await ServiceBooking.find({});
    console.log(`Total bookings in system: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      // Log first few bookings for debugging
      console.log("Sample bookings:", allBookings.slice(0, 2).map(b => ({
        id: b._id, 
        service: b.service,
        user: b.user,
        date: b.date,
        status: b.status
      })));
    }
    
    // Find all services owned by this owner
    const services = await Service.find({ owner: ownerId });
    console.log(`Found ${services.length} services for owner`);
    
    if (!services || services.length === 0) {
      console.log("No services found for owner, returning empty array");
      
      // TEMPORARY WORKAROUND: Try to get all service bookings directly
      // This is just to help us debug and should be removed after fixing the issue
      console.log("DEBUG - Looking for ALL service bookings in the system");
      return allBookings;
    }
    
    const serviceIds = services.map(service => service._id);
    console.log("Service IDs:", serviceIds);
    
    // Find all bookings for these services
    const bookings = await ServiceBooking.find({ service: { $in: serviceIds } })
      .populate("service")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
      
    console.log(`Found ${bookings.length} bookings for owner's services`);
    
    // If we found no bookings but there are bookings in the system,
    // let's check why they're not matching
    if (bookings.length === 0 && allBookings.length > 0) {
      console.log("DEBUG - No matched bookings. Checking service references...");
      
      // Check each booking to see if the service exists but isn't matching our query
      for (const booking of allBookings) {
        console.log(`Booking ${booking._id} service: ${booking.service}`);
        if (booking.service) {
          const service = await Service.findById(booking.service);
          if (service) {
            console.log(`Service exists, owner: ${service.owner}`);
          } else {
            console.log(`Service doesn't exist in DB`);
          }
        }
      }
    }
    
    return bookings;
  } catch (err) {
    console.error("Error in getAllByOwnerId:", err);
    throw err;
  }
}

async function getServiceBookingById(id) {
  try {
    return await ServiceBooking.findById(id)
      .populate("service")
      .populate("user", "firstName lastName email");
  } catch (err) {
    throw err;
  }
}

async function createServiceBooking(bookingData) {
  try {
    // Fetch the service to verify and calculate pricing
    const service = await Service.findById(bookingData.service);
    if (!service) {
      throw new Error("Service not found");
    }
    
    // Calculate the end time based on duration
    const bookingStartTime = bookingData.time;
    
    // Check for time conflicts with existing bookings
    const selectedDate = new Date(bookingData.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const existingBookings = await ServiceBooking.find({
      service: bookingData.service,
      date: {
        $gte: new Date(selectedDate),
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'cancelled' }
    });
    
    // Check for overlapping time slots
    const hasTimeConflict = existingBookings.some(booking => {
      const existingStartHour = parseInt(booking.time.split(':')[0]);
      const existingStartMinute = parseInt(booking.time.split(':')[1]);
      const existingEndHour = existingStartHour + booking.duration;
      
      const newStartHour = parseInt(bookingStartTime.split(':')[0]);
      const newStartMinute = parseInt(bookingStartTime.split(':')[1]);
      const newEndHour = newStartHour + bookingData.duration;
      
      // Convert to minutes for easier comparison
      const existingStartTime = existingStartHour * 60 + existingStartMinute;
      const existingEndTime = existingEndHour * 60 + existingStartMinute;
      const newStartTime = newStartHour * 60 + newStartMinute;
      const newEndTime = newEndHour * 60 + newStartMinute;
      
      // Check if times overlap
      return (newStartTime < existingEndTime && newEndTime > existingStartTime);
    });
    
    if (hasTimeConflict) {
      throw new Error("The requested time slot is already booked");
    }
    
    // Calculate total price
    bookingData.totalPrice = service.price * bookingData.duration;
    
    // Create the booking
    const booking = new ServiceBooking(bookingData);
    return await booking.save();
  } catch (err) {
    throw err;
  }
}

async function updateServiceBooking(id, updates) {
  try {
    return await ServiceBooking.findByIdAndUpdate(id, updates, { new: true });
  } catch (err) {
    throw err;
  }
}

async function deleteServiceBooking(id) {
  try {
    return await ServiceBooking.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

async function confirmBooking(id) {
  try {
    return await ServiceBooking.findByIdAndUpdate(
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
    return await ServiceBooking.findByIdAndUpdate(
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