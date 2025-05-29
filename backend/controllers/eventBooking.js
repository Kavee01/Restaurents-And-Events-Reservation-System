const modelEventBooking = require("../models/eventBooking");
const modelEvent = require("../models/event");

module.exports = {
  getAllByUserId,
  getAllByEventId,
  getAllByOwnerId,
  getOneById,
  createEventBooking,
  updateEventBooking,
  deleteEventBooking,
  confirmEventBooking,
  cancelEventBooking,
  getEventAvailability
};

// @desc    Get event availability information (number of tickets booked, remaining, etc.)
// @route   GET /eventbooking/event/:eventId/availability
// @access  Public
async function getEventAvailability(req, res) {
  try {
    // Get the event information
    const event = await modelEvent.getEventById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ errorMsg: "Event not found" });
    }
    
    // Get all confirmed/pending bookings for this event
    const bookings = await modelEventBooking.getAllByEventId(req.params.eventId);
    
    // Calculate total booked tickets (excluding cancelled ones)
    const bookedTickets = bookings.reduce(
      (total, booking) => booking.status !== 'cancelled' ? total + booking.numberOfTickets : total, 
      0
    );
    
    // Calculate remaining tickets
    const ticketsRemaining = event.maxCapacity - bookedTickets;
    
    // Return availability information
    res.json({
      eventId: event._id,
      maxCapacity: event.maxCapacity,
      bookedTickets,
      ticketsRemaining,
      isSoldOut: ticketsRemaining <= 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all event bookings by user ID
// @route   GET /eventbooking
// @access  Private (User only)
async function getAllByUserId(req, res) {
  try {
    const bookings = await modelEventBooking.getAllByUserId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all event bookings by event ID
// @route   GET /eventbooking/event/:eventId
// @access  Private (Owner only)
async function getAllByEventId(req, res) {
  try {
    // Check if the event belongs to the requesting owner
    const event = await modelEvent.getEventById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ errorMsg: "Event not found" });
    }
    
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const bookings = await modelEventBooking.getAllByEventId(req.params.eventId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all event bookings for all events owned by the requesting owner
// @route   GET /eventbooking/owner-bookings
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const bookings = await modelEventBooking.getAllByOwnerId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one event booking by ID
// @route   GET /eventbooking/:id
// @access  Private (User or Owner)
async function getOneById(req, res) {
  try {
    const booking = await modelEventBooking.getEventBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Check if the user is the booker or the owner of the event
    if (booking.user._id.toString() !== req.user.id && 
        booking.event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new event booking
// @route   POST /eventbooking
// @access  Private (User only)
async function createEventBooking(req, res) {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    
    // Check if payment details are included
    if (bookingData.paymentDetails) {
      console.log("PayPal payment details received:", JSON.stringify(bookingData.paymentDetails, null, 2));
      
      // Validate payment details - in production you'd verify with PayPal API
      if (!bookingData.paymentDetails.paypalOrderId || 
          !bookingData.paymentDetails.transactionId ||
          bookingData.paymentDetails.paymentStatus !== 'COMPLETED') {
        return res.status(400).json({ 
          errorMsg: "Invalid payment details or payment not completed" 
        });
      }
      
      // If payment details are valid, proceed with booking
      const booking = await modelEventBooking.createEventBooking(bookingData);
      
      // Send email confirmation for paid bookings
      if (booking.isPaid) {
        // You could send a confirmation email here
        console.log(`Payment confirmed for booking: ${booking._id}`);
      }
      
      res.status(201).json(booking);
    } else {
      // For unpaid bookings (should not happen in this flow)
      const booking = await modelEventBooking.createEventBooking(bookingData);
      res.status(201).json(booking);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update an event booking
// @route   PUT /eventbooking/:id
// @access  Private (User only)
async function updateEventBooking(req, res) {
  try {
    const booking = await modelEventBooking.getEventBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can update it
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Don't allow changing the event or user
    delete req.body.event;
    delete req.body.user;
    
    const updatedBooking = await modelEventBooking.updateEventBooking(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete an event booking
// @route   DELETE /eventbooking/:id
// @access  Private (User only)
async function deleteEventBooking(req, res) {
  try {
    const booking = await modelEventBooking.getEventBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can delete it
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    await modelEventBooking.deleteEventBooking(req.params.id);
    res.json({ message: "Event booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Confirm an event booking (by owner)
// @route   PUT /eventbooking/:id/confirm
// @access  Private (Owner only)
async function confirmEventBooking(req, res) {
  try {
    const booking = await modelEventBooking.getEventBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the event can confirm the booking
    if (booking.event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const confirmedBooking = await modelEventBooking.confirmBooking(req.params.id);
    res.json(confirmedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Cancel an event booking (by owner)
// @route   PUT /eventbooking/:id/cancel
// @access  Private (Owner only)
async function cancelEventBooking(req, res) {
  try {
    const booking = await modelEventBooking.getEventBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the event can cancel the booking
    if (booking.event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const cancelledBooking = await modelEventBooking.cancelBooking(
      req.params.id, 
      req.body.cancellationReason
    );
    res.json(cancelledBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 