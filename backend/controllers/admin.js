const User = require('../daos/user');
const Restaurant = require('../daos/restaurant');
const Event = require('../daos/event');
const Activity = require('../daos/activity');
const Service = require('../daos/service');
const Booking = require('../daos/booking');

module.exports = {
  getDashboardStats
};

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getDashboardStats(req, res) {
  try {
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const ownerCount = await User.countDocuments({ isOwner: true });
    const restaurantCount = await Restaurant.countDocuments();
    const eventCount = await Event.countDocuments();
    const activityCount = await Activity.countDocuments();
    const serviceCount = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    // Calculate average prices where applicable
    const eventAvgPrice = await calculateAveragePrice(Event, 'ticketPrice');
    const activityAvgPrice = await calculateAveragePrice(Activity, 'price');
    const serviceAvgPrice = await calculateAveragePrice(Service, 'price');
    
    // Get recent users (up to 5)
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email isOwner createdAt');
    
    // Get sample data for each collection for display
    const restaurantData = await Restaurant.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    const activityData = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
      
    const serviceData = await Service.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
      
    const eventData = await Event.find({})
      .sort({ date: 1 })
      .limit(3)
      .lean();
    
    // Calculate total revenue (if applicable)
    // This is a placeholder - you should customize based on your actual data model
    const revenueTotal = await calculateTotalRevenue() || 0;
    
    // Create stats object
    const stats = {
      // Counts
      userCount,
      ownerCount,
      restaurantCount,
      eventCount,
      activityCount,
      serviceCount,
      bookingCount,
      
      // Sample data for display
      restaurantData,
      activityData,
      serviceData, 
      eventData,
      recentUsers,
      
      // Financial data
      revenueTotal,
      avgPrices: {
        event: eventAvgPrice,
        activity: activityAvgPrice,
        service: serviceAvgPrice
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ 
      errorMsg: 'Failed to retrieve dashboard statistics',
      details: err.message
    });
  }
}

/**
 * Calculate average price from a collection
 * @param {Object} Model - Mongoose model
 * @param {String} field - Price field name
 * @returns {Number} - Average price or 0 if no records
 */
async function calculateAveragePrice(Model, field) {
  try {
    const result = await Model.aggregate([
      {
        $match: { [field]: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: `$${field}` }
        }
      }
    ]);
    
    return result.length > 0 ? Math.round(result[0].avgPrice) : 0;
  } catch (error) {
    console.error(`Error calculating average ${field}:`, error);
    return 0;
  }
}

/**
 * Calculate total revenue from bookings
 * @returns {Number} - Total revenue or 0 if no bookings
 */
async function calculateTotalRevenue() {
  try {
    // This is a placeholder - you should customize based on your actual data model
    // For example, if you have a price or amount field in bookings:
    
    const result = await Booking.aggregate([
      {
        $match: { 
          status: "confirmed", // Only count confirmed bookings
          amount: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    return 0;
  }
} 