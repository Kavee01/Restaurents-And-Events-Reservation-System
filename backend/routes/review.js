const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const auth = require('../middlewares/security').checkLogin;
const Restaurant = require('../models/restaurant');
const Activity = require('../models/activity');
const Service = require('../models/service');
const Event = require('../models/event');

// Get reviews for a specific entity (restaurant, service, activity, event)
const getReviewsForEntity = async (req, res, entityType) => {
  try {
    const entityId = req.params.id;
    
    // Validate that the entity exists
    let entity;
    switch (entityType) {
      case 'restaurant':
        entity = await Restaurant.findById(entityId);
        break;
      case 'activity':
        entity = await Activity.findById(entityId);
        break;
      case 'service':
        entity = await Service.findById(entityId);
        break;
      case 'event':
        entity = await Event.findById(entityId);
        break;
    }
    
    if (!entity) {
      return res.status(404).json({ message: `${entityType} not found` });
    }
    
    // Find all reviews for this entity
    const reviews = await Review.find({
      entityType,
      entityId
    }).populate('user', 'name email');
    
    res.json(reviews);
  } catch (err) {
    console.error(`Error getting ${entityType} reviews:`, err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a review for a specific entity
const createReviewForEntity = async (req, res, entityType) => {
  try {
    const { rating, review, bookingId } = req.body;
    const entityId = req.params.id;
    const userId = req.user.id;
    
    // Validate that the entity exists
    let entity;
    switch (entityType) {
      case 'restaurant':
        entity = await Restaurant.findById(entityId);
        break;
      case 'activity':
        entity = await Activity.findById(entityId);
        break;
      case 'service':
        entity = await Service.findById(entityId);
        break;
      case 'event':
        entity = await Event.findById(entityId);
        break;
    }
    
    if (!entity) {
      return res.status(404).json({ message: `${entityType} not found` });
    }
    
    // Check if user already reviewed this booking
    const existingReview = await Review.findOne({
      user: userId,
      bookingId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }
    
    // Create new review
    const newReview = new Review({
      rating,
      review,
      user: userId,
      entityType,
      entityId,
      bookingId
    });
    
    await newReview.save();
    
    res.status(201).json(newReview);
  } catch (err) {
    console.error(`Error creating ${entityType} review:`, err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restaurant routes
router.get('/restaurant/:id/reviews', async (req, res) => {
  await getReviewsForEntity(req, res, 'restaurant');
});

router.post('/restaurant/:id/reviews', auth, async (req, res) => {
  await createReviewForEntity(req, res, 'restaurant');
});

// Activity routes
router.get('/activities/:id/reviews', async (req, res) => {
  await getReviewsForEntity(req, res, 'activity');
});

router.post('/activities/:id/reviews', auth, async (req, res) => {
  await createReviewForEntity(req, res, 'activity');
});

// Service routes
router.get('/services/:id/reviews', async (req, res) => {
  await getReviewsForEntity(req, res, 'service');
});

router.post('/services/:id/reviews', auth, async (req, res) => {
  await createReviewForEntity(req, res, 'service');
});

// Event routes
router.get('/events/:id/reviews', async (req, res) => {
  await getReviewsForEntity(req, res, 'event');
});

router.post('/events/:id/reviews', auth, async (req, res) => {
  await createReviewForEntity(req, res, 'event');
});

module.exports = router; 