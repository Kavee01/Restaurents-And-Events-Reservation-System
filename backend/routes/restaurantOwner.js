const express = require('express');
const router = express.Router();
const { protect, isRestaurantOwner } = require('../middleware/auth');
const restaurantController = require('../controllers/restaurantController');
const eventController = require('../controllers/eventController');
const reservationController = require('../controllers/reservationController');
const Event = require('../models/Event');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');

// Restaurant routes
router.post('/restaurants', protect, isRestaurantOwner, restaurantController.createRestaurant);
router.get('/restaurants', protect, isRestaurantOwner, restaurantController.getRestaurants);
router.get('/restaurants/:id', protect, isRestaurantOwner, restaurantController.getRestaurant);
router.put('/restaurants/:id', protect, isRestaurantOwner, restaurantController.updateRestaurant);
router.delete('/restaurants/:id', protect, isRestaurantOwner, restaurantController.deleteRestaurant);

// Event routes
router.post('/events', protect, isRestaurantOwner, eventController.createEvent);
router.get('/events', protect, isRestaurantOwner, async (req, res) => {
  try {
    const events = await Event.find({ 
      restaurant: { $in: await Restaurant.find({ owner: req.user._id }).select('_id') }
    })
    .populate('restaurant', 'name')
    .populate('organizer', 'name email')
    .populate('attendees.userId', 'name email')
    .sort({ date: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/events/:id', protect, isRestaurantOwner, eventController.getEvent);
router.put('/events/:id', protect, isRestaurantOwner, eventController.updateEvent);
router.delete('/events/:id', protect, isRestaurantOwner, eventController.deleteEvent);
router.put('/events/:eventId/bookings/:userId', protect, isRestaurantOwner, async (req, res) => {
  try {
    console.log('Received request:', {
      eventId: req.params.eventId,
      userId: req.params.userId,
      status: req.body.status
    });

    // First find the event and populate necessary fields
    const event = await Event.findById(req.params.eventId)
      .populate({
        path: 'restaurant',
        populate: {
          path: 'owner',
          select: '_id'
        }
      })
      .populate('attendees.userId', 'name email');

    if (!event) {
      console.log('Event not found:', req.params.eventId);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is authorized to update this event
    if (!event.restaurant || !event.restaurant.owner) {
      console.log('Restaurant or owner not found:', {
        restaurant: event.restaurant,
        owner: event.restaurant?.owner
      });
      return res.status(403).json({ success: false, message: 'Restaurant or owner information not found' });
    }

    if (event.restaurant.owner._id.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt:', {
        eventOwner: event.restaurant.owner._id.toString(),
        requestUser: req.user._id.toString()
      });
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    // Find the attendee by userId
    const attendee = event.attendees.find(
      a => {
        if (!a.userId) return false;
        const attendeeId = a.userId._id ? a.userId._id.toString() : a.userId.toString();
        return attendeeId === req.params.userId;
      }
    );

    if (!attendee) {
      console.log('Attendee not found:', {
        eventId: req.params.eventId,
        userId: req.params.userId,
        attendees: event.attendees.map(a => ({
          userId: a.userId ? (a.userId._id ? a.userId._id.toString() : a.userId.toString()) : null,
          status: a.status
        }))
      });
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update the status
    attendee.status = req.body.status;
    await event.save();

    // Create notification for the user
    await Notification.create({
      recipient: attendee.userId._id,
      sender: req.user._id,
      type: 'event',
      title: 'Event Booking Status Updated',
      message: `Your booking for event "${event.name}" has been ${req.body.status}`,
      relatedTo: event._id
    });

    // Return the updated event with populated fields
    const updatedEvent = await Event.findById(event._id)
      .populate('restaurant', 'name')
      .populate('organizer', 'name email')
      .populate('attendees.userId', 'name email');

    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reservation routes
router.get('/reservations', protect, isRestaurantOwner, reservationController.getReservations);
router.get('/reservations/:id', protect, isRestaurantOwner, reservationController.getReservation);
router.put('/reservations/:id', protect, isRestaurantOwner, reservationController.updateReservation);
router.delete('/reservations/:id', protect, isRestaurantOwner, reservationController.deleteReservation);
router.put('/reservations/:id/status', protect, isRestaurantOwner, reservationController.updateReservationStatus);

module.exports = router; 