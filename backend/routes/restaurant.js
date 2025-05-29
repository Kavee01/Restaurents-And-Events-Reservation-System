var express = require("express");
var router = express.Router();
var multer = require("multer");
var path = require("path");
var fs = require("fs");
var securityMiddleware = require("../middlewares/security");
var restaurantController = require("../controllers/restaurant");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Processing destination for file:', file.originalname);
    let uploadDir;
    if (file.fieldname === 'images') {
      uploadDir = path.join(__dirname, '../public/uploads/restaurants');
    } else if (file.fieldname === 'menuPdf') {
      uploadDir = path.join(__dirname, '../public/uploads/menus');
    } else {
      return cb(new Error('Invalid field name'));
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('Processing filename for file:', file.originalname);
    const prefix = file.fieldname === 'images' ? 'restaurant-' : 'menu-';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = prefix + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Filtering file:', file.originalname, file.mimetype);
  if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      console.log('File rejected - not an image:', file.originalname);
      return cb(new Error(`File ${file.originalname} is not an image`), false);
    }
  } else if (file.fieldname === 'menuPdf') {
    if (file.mimetype !== 'application/pdf') {
      console.log('File rejected - not a PDF:', file.originalname);
      return cb(new Error(`File ${file.originalname} is not a PDF`), false);
    }
  } else {
    return cb(new Error('Invalid field name'), false);
  }
  
  console.log('File accepted:', file.originalname);
  cb(null, true);
};

// Create multer instance with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'menuPdf', maxCount: 1 }
]);

// Create a wrapper middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
  console.log('Starting file upload process');
  console.log('Content-Type:', req.headers['content-type']);
  
  // Check if content-type includes multipart/form-data
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    console.error('Invalid content type:', req.headers['content-type']);
    return res.status(400).json({ 
      errorMsg: 'Request must be multipart/form-data' 
    });
  }

  upload(req, res, function(err) {
    console.log('Upload process completed');
    console.log('Request body:', req.body);
    
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          errorMsg: 'File too large. Maximum size is 5MB' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          errorMsg: 'Too many files. Maximum is 5 images' 
        });
      }
      return res.status(400).json({ 
        errorMsg: `Upload error: ${err.message}` 
      });
    }
    
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        errorMsg: err.message 
      });
    }

    if (!req.files || !req.files.images || req.files.images.length === 0) {
      console.error('No images in request');
      return res.status(400).json({ 
        errorMsg: 'At least one image is required' 
      });
    }

    console.log('Files received:', Object.entries(req.files).map(([field, files]) => ({
      field,
      files: files.map(f => ({
        filename: f.filename,
        size: Math.round(f.size / 1024) + 'KB',
        mimetype: f.mimetype
      }))
    })));
    
    next();
  });
};

// @desc    Get all restaurants
// @route   GET /restaurant/
// @access  Public
router.get("/", restaurantController.getAllRestaurants);

// @desc    Get restaurant by User
// @route   GET /restaurant/byUser
// @access  Public
router.get(
  "/user",
  securityMiddleware.checkIfOwner,
  restaurantController.getRestaurantByOwnerId
);

// @desc    Get all restaurants owned by the authenticated user
// @route   GET /restaurant/owner
// @access  Private (owners only)
router.get(
  "/owner", 
  securityMiddleware.checkIfOwner,
  restaurantController.getAllRestaurantsByOwnerId
);

// @desc    Get restaurants(by rest id)
// @route   GET /restaurant/:restID
// @access  Public
router.get("/:restId", restaurantController.getRestaurant);

// @desc    Create restaurants
// @route   POST /restaurant/create
// @access  Private (owners only)
router.post(
  "/create",
  securityMiddleware.checkIfOwner,
  uploadMiddleware,
  restaurantController.createRestaurant
);

// @desc    Edit restaurant
// @route   POST /restaurant/:restId/edit
// @access  Private (owner only)
router.post(
  "/:restId/edit",
  securityMiddleware.checkIfOwner,
  restaurantController.editRestaurant
);

// @desc    Delete restaurant
// @route   DELETE /restaurant/:restId/delete
// @access  Private (owner only)
router.delete(
  "/:restId/delete",
  securityMiddleware.checkIfOwner,
  restaurantController.deleteRestaurant
);

module.exports = router;
