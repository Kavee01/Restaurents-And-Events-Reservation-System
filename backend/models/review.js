const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: false,
    maxlength: 500
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The entity being reviewed (restaurant, service, activity, or event)
  entityType: {
    type: String,
    required: true,
    enum: ['restaurant', 'service', 'activity', 'event']
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  // Optional entityModel field for dynamic references
  entityModel: {
    type: String,
    required: false,
    enum: ['Restaurant', 'Service', 'Activity', 'Event', 'restaurant', 'service', 'activity', 'event'],
    default: function() {
      if (!this.entityType) return 'Restaurant';
      return this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1);
    }
  },
  // Optional reference to a booking
  bookingId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index for entity lookups (non-unique)
reviewSchema.index({ entityType: 1, entityId: 1 });

// Create a NON-UNIQUE index for user reviews - allows multiple reviews from same user
// IMPORTANT: We are NOT using a unique constraint here
reviewSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: false });

const Review = mongoose.model('Review', reviewSchema);

// Recreate the collection to ensure no unique indexes remain
const resetReviewIndexes = async () => {
  try {
    console.log('Attempting to drop existing review indexes...');
    
    const collectionName = Review.collection.name;
    const db = mongoose.connection.db;
    
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      console.log(`Dropping indexes for ${collectionName} collection`);
      
      // Instead of dropping the entire collection, just drop all indexes except _id
      await Review.collection.dropIndexes();
      
      // Manually recreate the indexes we want (without unique constraint)
      await Review.collection.createIndex({ entityType: 1, entityId: 1 });
      await Review.collection.createIndex({ user: 1, entityType: 1, entityId: 1 });
      
      console.log('Review indexes recreated successfully (no unique constraints)');
    }
  } catch (err) {
    console.error('Error managing review indexes:', err);
  }
};

// Execute the index reset when the connection is ready
mongoose.connection.once('connected', () => {
  // Wait a few seconds to ensure the connection is fully established
  setTimeout(resetReviewIndexes, 3000);
});

module.exports = Review; 