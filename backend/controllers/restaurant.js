const modelRestaurant = require("../models/restaurant");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  editRestaurant,
  deleteRestaurant,
  getRestaurantByOwnerId,
  getAllRestaurantsByOwnerId,
};

// Configure storage for restaurant images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/restaurants';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'restaurant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for menu PDFs
const menuStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/menus';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.fieldname === 'menuPdf') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configure multer for both image and PDF uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadDir;
      if (file.fieldname === 'images') {
        uploadDir = 'public/uploads/restaurants';
      } else if (file.fieldname === 'menuPdf') {
        uploadDir = 'public/uploads/menus';
      } else {
        return cb(new Error('Invalid field name'));
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const prefix = file.fieldname === 'images' ? 'restaurant-' : 'menu-';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'images') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    } else if (file.fieldname === 'menuPdf') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'), false);
      }
      cb(null, true);
    } else {
      cb(new Error('Unexpected field'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for both images and PDFs
  }
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'menuPdf', maxCount: 1 }
]);

async function getAllRestaurants(req, res) {
  try {
    const data = await modelRestaurant.getAllRestaurants(req.query);
    res.json({ restaurants: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function getRestaurant(req, res) {
  try {
    const data = await modelRestaurant.getRestaurantById(req.params.restId);
    if (data == "null") {
      res.json("no restaurant data found");
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function getRestaurantByOwnerId(req, res) {
  try {
    const data = await modelRestaurant.getRestaurantByOwnerId(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function getAllRestaurantsByOwnerId(req, res) {
  try {
    const data = await modelRestaurant.getAllRestaurantsByOwnerId(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function createRestaurant(req, res) {
  try {
    console.log('Creating restaurant with data:', req.body);
    console.log('Files:', req.files);

    // Files have already been processed by the uploadMiddleware
    // Just need to handle the paths and create the restaurant

    // Get image paths
    const images = req.files.images.map(file => `/uploads/restaurants/${file.filename}`);
    
    // Get menu PDF path if exists
    let menuPdfPath = null;
    if (req.files.menuPdf && req.files.menuPdf[0]) {
      menuPdfPath = `/uploads/menus/${req.files.menuPdf[0].filename}`;
    }
    
    // Get the preview image index from the form data
    const previewImageIndex = parseInt(req.body.previewImageIndex) || 0;

    // Validate required fields
    const requiredFields = ['name', 'category', 'location', 'maxPax', 'address'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ errorMsg: `${field} is required` });
      }
    }

    // Convert time format from HH:MM to number (e.g., "06:00" to 600, "23:45" to 2345)
    const convertTimeToNumber = (timeStr) => {
      if (!timeStr) return null;
      // Remove any colons from the time string
      const cleanTime = timeStr.replace(':', '');
      // Convert to number
      return parseInt(cleanTime);
    };

    // Create restaurant with images and menu PDF
    const restaurantData = {
      ...req.body,
      owner: req.user.id,
      images: images,
      menuPdf: menuPdfPath,
      previewImageIndex: previewImageIndex,
      coordinates: JSON.parse(req.body.coordinates),
      daysClose: req.body.daysClose ? JSON.parse(req.body.daysClose) : [],
      timeOpen: convertTimeToNumber(req.body.timeOpen),
      timeClose: convertTimeToNumber(req.body.timeClose),
      maxPax: parseInt(req.body.maxPax)
    };

    console.log('Creating restaurant with data:', restaurantData);

    const data = await modelRestaurant.createRestaurant(restaurantData);
    res.json(data);
  } catch (err) {
    console.error('Error in createRestaurant:', err);
    // Clean up any uploaded files if there was an error
    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach(file => {
          const filePath = path.join(__dirname, '..', 'public', 'uploads', 'restaurants', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      if (req.files.menuPdf && req.files.menuPdf[0]) {
        const filePath = path.join(__dirname, '..', 'public', 'uploads', 'menus', req.files.menuPdf[0].filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    res.status(500).json({ errorMsg: err.message });
  }
}

async function editRestaurant(req, res) {
  const restdata = await modelRestaurant.getRestaurantById(req.params.restId);
  if (!restdata.owner || restdata.owner != req.user.id) {
    return res.status(401).json("Unauthorized");
  } else {
    try {
      upload(req, res, async function(err) {
        if (err) {
          return res.status(400).json({
            status: "error",
            message: err.message
          });
        }

        const restaurantId = req.params.restId;
        const updateData = { ...req.body };

        // If a new menu PDF was uploaded
        if (req.file) {
          // Delete old menu PDF if exists
          const oldRestaurant = await modelRestaurant.getRestaurantById(restaurantId);
          if (oldRestaurant.menuPdf) {
            const oldPath = path.join(__dirname, '..', oldRestaurant.menuPdf);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          
          // Add new menu PDF path
          updateData.menuPdf = '/uploads/menus/' + req.file.filename;
        }

        const restaurant = await modelRestaurant.editRestaurant(
          restaurantId,
          updateData
        );

        if (!restaurant) {
          return res.status(404).json({
            status: "error",
            message: "Restaurant not found"
          });
        }

        res.status(200).json({
          status: "success",
          data: restaurant
        });
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  }
}

async function deleteRestaurant(req, res) {
  const restdata = await modelRestaurant.getRestaurantById(req.params.restId);
  if (!restdata.owner || restdata.owner != req.user.id) {
    return res.status(401).json("Unauthorized");
  } else {
    try {
      await modelRestaurant.deleteRestaurant(req.params.restId);
      res.json("data has been deleted.");
      // res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).json({ errorMsg: err.message });
    }
  }
}
