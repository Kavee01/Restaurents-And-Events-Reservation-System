const modelBooking = require("../models/booking");
const modelRestaurant = require("../models/restaurant");
const { sendEmail } = require("../util/sendEmail");
const dateTimeHandler = require("../util/datetime");

module.exports = {
  getAllByUserId,
  getAllByRestaurantId,
  getAllBySpecificRestaurantId,
  getOneById,
  createBooking,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
};

// @desc    Get all bookings(by user id)
// @route   GET /booking/
// @access  Private
async function getAllByUserId(req, res) {
  const bookings = await modelBooking.getAllByUserId(req.user.id);
  res.json(bookings);
}

// @desc    Get all bookings (by restaurant id)
// @route   GET /booking/restaurant?startDateTime=2024-02-01T00%3A00%3A00%2B08%3A00&endDateTime=2024-02-29T23%3A59%3A59%2B08%3A00
// @access  Private (bearer token passed in header/ check if user is an owner of restaurant)
async function getAllByRestaurantId(req, res) {
  // Check if the user has a restaurant
  const restaurant = await modelRestaurant.getRestaurantByOwnerId(req.user.id);
  if (!restaurant) {
    return res.json([]);
  }

  if (restaurant.owner != req.user.id) {
    return res.status(401).json("Unauthorized");
  }

  if (req.query.startDateTime > req.query.endDateTime) {
    return res
      .status(400)
      .json("startDateTime must be earlier than endDateTime");
  }

  if (!req.query.startDateTime && !req.query.endDateTime) {
    const bookings = await modelBooking.getAllByRestaurantId(restaurant._id);
    return res.json(bookings);
  }

  const bookings = await modelBooking.filterAllByRestaurantId({
    startDateTime: req.query.startDateTime,
    endDateTime: req.query.endDateTime,
    id: restaurant._id,
  });
  res.json(bookings);
}

// @desc    Get all bookings (by specific restaurant id in URL)
// @route   GET /booking/restaurant/:restId?startDateTime=2024-02-01T00%3A00%3A00%2B08%3A00&endDateTime=2024-02-29T23%3A59%3A59%2B08%3A00
// @access  Private (bearer token passed in header/ check if user is an owner of restaurant)
async function getAllBySpecificRestaurantId(req, res) {
  try {
    // Check if the restaurant exists
    const restaurant = await modelRestaurant.getRestaurantById(req.params.restId);
    if (!restaurant) {
      return res.status(404).json({ errorMsg: "Restaurant not found" });
    }

    // Check if user owns this restaurant
    const userRestaurants = await modelRestaurant.getAllRestaurantsByOwnerId(req.user.id);
    const isOwner = userRestaurants.some(r => r._id.toString() === req.params.restId);
    
    if (!isOwner) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }

    if (req.query.startDateTime && req.query.endDateTime) {
      if (req.query.startDateTime > req.query.endDateTime) {
        return res.status(400).json({ errorMsg: "startDateTime must be earlier than endDateTime" });
      }

      const bookings = await modelBooking.filterAllByRestaurantId({
        startDateTime: req.query.startDateTime,
        endDateTime: req.query.endDateTime,
        id: req.params.restId,
      });
      return res.json(bookings);
    } else {
      const bookings = await modelBooking.getAllByRestaurantId(req.params.restId);
      return res.json(bookings);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one booking by ID
// @route   GET /booking/:id
// @access  Private
async function getOneById(req, res) {
  // Check if the user who made the booking matches the token user
  const user = req.user.id;
  const booking = await modelBooking.getOneById(req.params.id);
  if (booking.user != user) {
    return res.status(401).json("Unauthorized");
  }

  res.json(booking);
}

// @desc    Create a booking (Restaurant ID is passed in the body)
// @route   POST /booking/create
// @access  Private (bearer token passed in header)
async function createBooking(req, res) {
  const user = req.user.id;
  let booking;
  const errors = [];

  try {
    // check if the restaurant exists
    const restaurant = await modelRestaurant.getRestaurantById(
      req.body.restaurant
    );
    if (!restaurant) return res.status(400).json("no restaurant with such id");

    // Input validation
    const validationErrors = validateInput(req.body, restaurant);
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    // If no errors, create booking
    booking = await modelBooking.createBooking({
      ...req.body,
      user,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }

  try {
    await sendEmail({
      type: "reservationCompleted",
      payload: {
        userName: req.user.name,
        userEmail: req.user.email,
        pax: booking.pax,
        restaurant: booking.restaurant.name,
        dateTime: booking.dateTime,
      },
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }
}

// @desc    Update a booking by ID
// @route   POST /booking/:id
// @access  Private
async function updateBooking(req, res) {
  const user = req.user.id;
  let updatedBooking;
  const errors = [];

  try {
    if (req.body.restaurant) {
      return res.status(400).json("restaurant cannot be updated");
    }

    // Check if the user who made the booking matches the token user
    const currBooking = await modelBooking.getOneById(req.params.id);
    if (currBooking.user != user) {
      return res.status(401).json("Unauthorized");
    }

    // Input validation
    const restaurant = await modelRestaurant.getRestaurantById(
      currBooking.restaurant._id
    );
    const validationErrors = validateInput(req.body, restaurant);
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    // If no errors, update booking
    updatedBooking = await modelBooking.updateBooking(req.params.id, req.body);
    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }

  try {
    await sendEmail({
      type: "reservationChanged",
      payload: {
        userName: req.user.name,
        userEmail: req.user.email,
        pax: updatedBooking.pax,
        restaurant: updatedBooking.restaurant.name,
        dateTime: updatedBooking.dateTime,
      },
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }
}

// @desc    Delete a booking by ID
// @route   DELETE /booking/:id
// @access  Private
async function deleteBooking(req, res) {
  // Check if the user who made the booking matches the token user
  const user = req.user.id;
  const booking = await modelBooking.getOneById(req.params.id);
  if (booking.user != user) {
    return res.status(401).json("Unauthorized");
  }

  try {
    await modelBooking.deleteBooking(req.params.id);
    res.status(200).json("booking deleted");
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }

  try {
    await sendEmail({
      type: "reservationCancelled",
      payload: {
        userName: req.user.name,
        userEmail: req.user.email,
      },
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }
}

// @desc    Approve a booking by ID
// @route   POST /booking/:id/approve
// @access  Private (restaurant owner only)
async function approveBooking(req, res) {
  try {
    // Get the booking
    const booking = await modelBooking.getOneById(req.params.id);
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }

    // Make sure we have user information
    if (!booking.user || !booking.user._id || !booking.user.email) {
      console.error("Missing user info in booking:", booking);
      return res.status(400).json({ errorMsg: "Booking has incomplete user information" });
    }

    // Get user's name - handle both formats
    const userName = booking.user.name || 
      (booking.user.firstName && booking.user.lastName ? 
        `${booking.user.firstName} ${booking.user.lastName}` : 
        null);

    if (!userName) {
      console.error("Missing user name in booking:", booking);
      return res.status(400).json({ errorMsg: "Booking has incomplete user information - name is required" });
    }

    // Check if user owns the restaurant
    const userRestaurants = await modelRestaurant.getAllRestaurantsByOwnerId(req.user.id);
    const isOwner = userRestaurants.some(r => r._id.toString() === booking.restaurant._id.toString());
    
    if (!isOwner) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }

    // Update booking status
    const updatedBooking = await modelBooking.updateBooking(req.params.id, { 
      status: 'approved'
    });

    // Send email notification
    try {
      console.log("Sending approval email for booking:", booking._id);
      console.log("Email will be sent to:", booking.user.email);
      
      await sendEmail({
        type: "bookingApproved",
        payload: {
          userName: userName, // Use the computed userName
          userEmail: booking.user.email,
          pax: booking.pax,
          restaurant: booking.restaurant.name,
          dateTime: booking.dateTime,
        },
      });
      console.log("Approval email sent successfully");
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Continue despite email error - booking is still approved
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error("Error approving booking:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Reject a booking by ID
// @route   POST /booking/:id/reject
// @access  Private (restaurant owner only)
async function rejectBooking(req, res) {
  try {
    // Get the booking
    const booking = await modelBooking.getOneById(req.params.id);
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }

    // Check if user owns the restaurant
    const userRestaurants = await modelRestaurant.getAllRestaurantsByOwnerId(req.user.id);
    const isOwner = userRestaurants.some(r => r._id.toString() === booking.restaurant._id.toString());
    
    if (!isOwner) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }

    // Validate rejection reason if provided
    if (req.body.rejectionReason && req.body.rejectionReason.length > 200) {
      return res.status(400).json({ errorMsg: "Rejection reason must be less than 200 characters" });
    }

    // Update booking status
    const updatedBooking = await modelBooking.updateBooking(req.params.id, { 
      status: 'rejected',
      rejectionReason: req.body.rejectionReason || "No reason provided"
    });

    // Send email notification
    try {
      await sendEmail({
        type: "bookingRejected",
        payload: {
          userName: booking.user.name,
          userEmail: booking.user.email,
          pax: booking.pax,
          restaurant: booking.restaurant.name,
          dateTime: booking.dateTime,
          rejectionReason: req.body.rejectionReason || "No reason provided"
        },
      });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

function validateInput(body, restaurant) {
  const errors = [];
  console.log(body.dateTime);

  // Pax
  if (body.pax > restaurant.maxPax) {
    errors.push("pax must be less than maxPax");
  }
  if (body.pax < 1) {
    errors.push("pax must be more than 0");
  }
  if (body.pax > 10) {
    errors.push("For large group, please contact the restaurant directly");
  }
  // DateTime
  if (body.dateTime < new Date()) {
    errors.push("dateTime must be in the future");
  }
  if (body.dateTime > new Date().setDate(new Date().getDate() + 14)) {
    errors.push("dateTime must be within 14 days");
  }
  const isInputDayClosed = dateTimeHandler.isInputDayClosed(
    restaurant.daysClose,
    body.dateTime
  );
  if (isInputDayClosed) {
    errors.push("restaurant is closed on this day");
  }
  const isInputTimeClosed = dateTimeHandler.isInputTimeClosed(
    body.dateTime,
    restaurant.timeOpen,
    restaurant.timeClose
  );
  if (isInputTimeClosed) {
    errors.push("restaurant is closed at this time");
  }

  if (errors.length > 0) {
    return errors;
  }
}
