const modelUsers = require("../models/user");
const crypto = require('crypto');
const { sendEmail } = require("../util/sendEmail");

module.exports = {
  getUsers,
  getAllUsers,
  getLoginDetails,
  loginUser,
  logoutUser,
  createUser,
  checkAdmin,
  updateUser,
  forgotPassword,
  resetPassword,
  validateResetToken,
};

async function getUsers(req, res) {
  try {
    const userData = await modelUsers.getUsers(req.query);
    res.json({ users: userData });
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }
}

async function getAllUsers(req, res) {
  try {
    // Only allow this endpoint for admins
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ errorMsg: "Unauthorized: Admin access required" });
    }
    
    const users = await modelUsers.getUsers({});
    res.json({ users: users });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function getLoginDetails(req, res) {
  try {
    const loginDetails = await modelUsers.getLoginDetails(req.query);
    if (loginDetails.success != true) {
      res.status(400).json({ errorMsg: loginDetails.error });
      return;
    }
    res.json(loginDetails.data);
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const token = await modelUsers.loginUser(req.body);
    console.log(token);
    if (!token.success) {
      res.status(400).json({ errorMsg: token.error });
      return;
    }
    res.json(token.data);
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }
}

async function createUser(req, res) {
  try {
    const userData = await modelUsers.createUser(req.body);
    console.log(userData);
    if (!userData.success) {
      res.status(400).json({ errorMsg: userData.error });
      return;
    }
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function logoutUser(req, res) {
  try {
    await modelUsers.logoutUser(req.body);
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ errorMsg: err.message });
  }
}

async function checkAdmin(req, res) {
  try {
    // Check if admin user already exists
    const existingAdmin = await modelUsers.getUserByEmail('admin');
    
    if (existingAdmin) {
      // Ensure the admin user has isAdmin set to true
      if (!existingAdmin.isAdmin) {
        await modelUsers.updateUser('admin', { isAdmin: true });
        console.log('Updated admin user with isAdmin flag');
      }
      
      // Admin exists
      res.json({ exists: true, message: 'Admin user already exists' });
      return;
    }
    
    // Create admin user if it doesn't exist
    // Generate salt and hash password
    const iterations = 10000;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, iterations, 64, 'sha512').toString('hex');
    
    // Create admin user
    const adminUser = {
      name: 'System Admin',
      email: 'admin', // Using admin as email for simplicity
      password: hash,
      salt: salt,
      iterations: iterations,
      isOwner: true,
      isAdmin: true
    };
    
    const result = await modelUsers.createUser(adminUser);
    if (result.success) {
      res.json({ exists: false, message: 'Admin user created successfully' });
    } else {
      res.status(400).json({ errorMsg: result.error });
    }
  } catch (err) {
    console.error('Error checking/creating admin:', err);
    res.status(500).json({ errorMsg: err.message });
  }
}

async function updateUser(req, res) {
  try {
    // Ensure user is authenticated and can only update their own info
    if (!req.user || req.user.email !== req.body.email) {
      return res.status(403).json({ errorMsg: "Unauthorized: You can only update your own account" });
    }

    const updates = {
      name: req.body.name,
      address: req.body.address,
      isOwner: req.body.isOwner
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const result = await modelUsers.updateUser(req.body.email, updates);
    
    if (!result.success) {
      return res.status(400).json({ errorMsg: result.error });
    }
    
    res.json({ message: "Account updated successfully", data: result.data });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// Handle forgot password request
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ errorMsg: "Email is required" });
    }

    // Generate a reset token
    const result = await modelUsers.generateResetToken(email);
    
    if (!result.success) {
      // Don't expose whether the user exists or not to prevent enumeration attacks
      return res.json({ 
        message: "If this email exists in our system, a password reset link will be sent." 
      });
    }

    // Get the frontend URL from environment variable or use a default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Create the reset link with the token
    const resetLink = `${frontendUrl}/reset-password/${result.data.resetToken}`;

    try {
      // Send password reset email
      await sendEmail({
        type: "passwordResetRequest",
        payload: {
          name: result.data.name || "User",
          email: email,
          resetLink: resetLink
        }
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Still return success to prevent user enumeration
      // The token was generated successfully even if email failed
    }

    res.json({ 
      message: "If this email exists in our system, a password reset link will be sent." 
    });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// Validate a reset token
async function validateResetToken(req, res) {
  try {
    const { token } = req.params;
    
    console.log("Received token for validation:", token);
    console.log("Token length:", token ? token.length : 0);
    
    if (!token) {
      return res.status(400).json({ errorMsg: "Token is required" });
    }

    const result = await modelUsers.validateResetToken(token);
    
    console.log("Token validation result:", result);
    
    if (!result.success) {
      return res.status(400).json({ errorMsg: result.error });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error("Error validating reset token:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// Reset password with token
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ errorMsg: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ errorMsg: "Password must be at least 6 characters long" });
    }

    const result = await modelUsers.resetPassword(token, password);
    
    if (!result.success) {
      return res.status(400).json({ errorMsg: result.error });
    }

    // Get user info to send in the confirmation email
    const validation = await modelUsers.validateResetToken(token);
    if (validation.success) {
      const user = validation.data;
      
      // Send password reset success email
      await sendEmail({
        type: "passwordResetSuccess",
        payload: {
          name: user.name || "User",
          email: user.email
        }
      });
    }

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}
