const express = require('express');
const router = express.Router();
const { verifyToken, isCustomer, protect } = require('../middleware/auth');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Event = require('../models/Event');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');

// Protect all routes in this router
router.use(verifyToken);
router.use(isCustomer);

// Get customer profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer's reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id })
      .populate('restaurant', 'name')
      .sort({ date: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer's event bookings
router.get('/my-events', async (req, res) => {
  try {
    const events = await Event.find({ 
      'attendees.userId': req.user.id 
    }).populate('restaurant', 'name');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all restaurants
router.get('/restaurants', protect, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: 'active' });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all events
router.get('/events', protect, async (req, res) => {
  try {
    const events = await Event.find({ 
      status: 'scheduled',
      date: { $gte: new Date() } // Only show future events
    })
    .populate('restaurant', 'name address')
    .sort({ date: 1 }); // Sort by date ascending
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Book an event
router.post('/event-bookings', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.body.event);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event is full
    const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed').length;
    if (confirmedAttendees >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check if user already booked
    const existingBooking = event.attendees.find(
      a => a.userId.toString() === req.user._id.toString()
    );

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this event' });
    }

    // Add user to attendees with pending status
    event.attendees.push({
      userId: req.user._id,
      numberOfGuests: req.body.numberOfGuests,
      date: new Date(req.body.date),
      specialRequests: req.body.specialRequests,
      status: 'pending'
    });

    await event.save();

    // Create notification for event organizer
    await Notification.create({
      recipient: event.organizer,
      sender: req.user._id,
      type: 'event',
      title: 'New Event Booking Request',
      message: `New booking request for event "${event.name}"`,
      relatedTo: event._id
    });

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user's event bookings
router.get('/event-bookings', protect, async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user._id);
    
    // Find all events where the user is an attendee
    const events = await Event.find({
      'attendees.userId': req.user._id
    })
    .populate('restaurant', 'name')
    .populate('attendees.userId', 'name email');

    console.log('Found events:', events.length);

    // Format the bookings data
    const bookings = events.flatMap(event => {
      console.log('Processing event:', event._id);
      const userBookings = event.attendees
        .filter(attendee => {
          const isMatch = attendee.userId && attendee.userId._id.toString() === req.user._id.toString();
          console.log('Checking attendee:', {
            attendeeId: attendee.userId?._id,
            userId: req.user._id,
            isMatch
          });
          return isMatch;
        })
        .map(attendee => ({
          event: {
            _id: event._id,
            name: event.name,
            restaurant: event.restaurant,
            date: event.date,
            time: event.time,
            price: event.price
          },
          date: attendee.date,
          numberOfGuests: attendee.numberOfGuests,
          specialRequests: attendee.specialRequests,
          status: attendee.status
        }));
      
      console.log('Found bookings for event:', userBookings.length);
      return userBookings;
    });

    console.log('Total bookings found:', bookings.length);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching event bookings:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 