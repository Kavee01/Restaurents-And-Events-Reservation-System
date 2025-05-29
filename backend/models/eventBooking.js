const EventBooking = require("../daos/eventBooking");
const User = require("../daos/user");
const Event = require("../daos/event");

module.exports = {
  getAllByUserId,
  getAllByEventId,
  getAllByOwnerId,
  getEventBookingById,
  createEventBooking,
  updateEventBooking,
  deleteEventBooking,
  confirmBooking,
  cancelBooking
};

async function getAllByUserId(userId) {
  try {
    return await EventBooking.find({ user: userId })
      .populate("event")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByEventId(eventId) {
  try {
    return await EventBooking.find({ event: eventId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getAllByOwnerId(ownerId) {
  try {
    // Find all events owned by this owner
    const events = await Event.find({ owner: ownerId });
    const eventIds = events.map(event => event._id);
    
    // Find all bookings for these events
    return await EventBooking.find({ event: { $in: eventIds } })
      .populate("event")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function getEventBookingById(id) {
  try {
    return await EventBooking.findById(id)
      .populate("event")
      .populate("user", "firstName lastName email");
  } catch (err) {
    throw err;
  }
}

async function createEventBooking(bookingData) {
  try {
    // Fetch the event to check availability
    const event = await Event.findById(bookingData.event);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Check if the number of tickets requested is available
    const existingBookings = await EventBooking.find({ 
      event: bookingData.event,
      status: { $ne: 'cancelled' }
    });
    
    const totalTicketsBooked = existingBookings.reduce(
      (sum, booking) => sum + booking.numberOfTickets, 0
    );
    
    if (totalTicketsBooked + bookingData.numberOfTickets > event.maxCapacity) {
      throw new Error("Not enough tickets available");
    }
    
    // Calculate the total price
    bookingData.totalPrice = event.ticketPrice * bookingData.numberOfTickets;
    
    // Handle payment validation
    if (bookingData.paymentDetails) {
      // Verify payment details if needed (could add additional validation here)
      if (bookingData.paymentDetails.paymentStatus === 'COMPLETED') {
        bookingData.isPaid = true;
        bookingData.status = 'confirmed'; // Auto-confirm paid bookings
      }
    }
    
    // Create the booking
    const booking = new EventBooking(bookingData);
    return await booking.save();
  } catch (err) {
    throw err;
  }
}

async function updateEventBooking(id, updates) {
  try {
    return await EventBooking.findByIdAndUpdate(id, updates, { new: true });
  } catch (err) {
    throw err;
  }
}

async function deleteEventBooking(id) {
  try {
    return await EventBooking.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

async function confirmBooking(id) {
  try {
    return await EventBooking.findByIdAndUpdate(
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
    return await EventBooking.findByIdAndUpdate(
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