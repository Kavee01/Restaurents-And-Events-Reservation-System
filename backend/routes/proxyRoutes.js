const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/review');
const auth = require('../middlewares/security').checkLogin;

/**
 * Test endpoint to verify authentication is working
 */
router.get('/test-auth', auth, (req, res) => {
  return res.status(200).json({
    message: 'Authentication is working correctly',
    user: {
      id: req.user.id || req.user._id,
      email: req.user.email,
      name: req.user.name,
      isAdmin: !!req.user.isAdmin,
      isOwner: !!req.user.isOwner
    }
  });
});

/**
 * Get reviews by entity type and ID
 */
router.get('/reviews', async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    
    // Validate the query parameters
    if (!entityType || !entityId) {
      return res.status(400).json({ 
        message: 'Both entityType and entityId are required query parameters' 
      });
    }
    
    console.log(`Fetching reviews for ${entityType} with ID ${entityId}`);
    
    // Find reviews matching the entity type and ID
    const reviews = await Review.find({
      entityType,
      entityId
    }).populate('user', 'name email');
    
    console.log(`Found ${reviews.length} reviews`);
    
    // Return the reviews
    return res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: err.message
    });
  }
});

/**
 * Simple endpoint for creating reviews without dependencies
 */
router.post('/proxy/review', auth, async (req, res) => {
  try {
    console.log('Review proxy received request:', req.body);
    const { rating, review, entityType, entityId } = req.body;
    
    // Get user ID from auth token
    const userId = req.user.id || req.user._id;
    console.log('User ID from token:', userId);
    
    // Basic validation
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    if (!entityType || !['restaurant', 'activity', 'service', 'event'].includes(entityType)) {
      return res.status(400).json({ 
        message: 'Valid entityType is required (restaurant, activity, service, or event)' 
      });
    }
    
    if (!entityId) {
      return res.status(400).json({ message: 'EntityId is required' });
    }

    // Prepare review data
    const reviewData = {
      rating: parseInt(rating),
      review: review || '',
      user: userId,
      entityType: entityType,
      entityId: entityId,
      entityModel: entityType.charAt(0).toUpperCase() + entityType.slice(1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if user has already reviewed this entity
    const existingReview = await Review.findOne({
      user: userId,
      entityType: entityType,
      entityId: entityId
    });
    
    if (existingReview) {
      console.log('User has already reviewed this entity - updating existing review');
      
      // Update the existing review
      existingReview.rating = parseInt(rating);
      existingReview.review = review || '';
      existingReview.updatedAt = new Date();
      
      try {
        const updatedReview = await existingReview.save();
        console.log('Review updated successfully:', updatedReview);
        
        return res.status(200).json({
          ...updatedReview.toObject(),
          message: 'Your review has been updated'
        });
      } catch (updateError) {
        console.error('Error updating review:', updateError);
        throw updateError;
      }
    } else {
      // Create a new review
      console.log('Creating new review document:', reviewData);
      
      try {
        const newReview = new Review(reviewData);
        const savedReview = await newReview.save();
        
        console.log('Review created successfully with ID:', savedReview._id);
        
        // Return success with the created document
        return res.status(201).json(savedReview);
      } catch (saveError) {
        console.error('Error saving review:', saveError);
        
        // Last-resort fallback - direct MongoDB insertion
        if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
          console.log('Error with save - attempting direct insertion');
          
          try {
            const reviewCollection = mongoose.connection.collection('reviews');
            reviewData.user = mongoose.Types.ObjectId(userId);
            reviewData.entityId = mongoose.Types.ObjectId(entityId);
            
            const result = await reviewCollection.insertOne(reviewData);
            
            if (result.acknowledged) {
              console.log('Review created via direct MongoDB access');
              return res.status(201).json({
                _id: result.insertedId,
                ...reviewData
              });
            } else {
              throw new Error('Failed to insert document into MongoDB');
            }
          } catch (insertError) {
            console.error('Error with direct insertion:', insertError);
            throw insertError;
          }
        } else {
          throw saveError;
        }
      }
    }
  } catch (err) {
    console.error('Error in proxy review endpoint:', err);
    
    if (err.code === 11000) {
      return res.status(500).json({ 
        message: 'Unable to save your review due to a database conflict. Please try again later.',
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to create review. Please try again later.',
      error: err.message
    });
  }
});

module.exports = router; 