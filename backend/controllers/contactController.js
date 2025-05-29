const Contact = require("../models/contact");

/**
 * Create a new contact form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, subject and message",
      });
    }

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Save to database
    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit your message. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get all contact submissions (for admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contact submissions.",
      error: error.message,
    });
  }
}; 