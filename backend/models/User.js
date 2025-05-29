const daoUser = require("../daos/user");
const utilSecurity = require("../util/security");
const crypto = require('crypto');

module.exports = {
  getUsers,
  getLoginDetails,
  loginUser,
  createUser,
  logoutUser,
  getUserByEmail,
  updateUser,
  generateResetToken,
  validateResetToken,
  resetPassword,
};

function getUsers(queryFields) {
  return daoUser.find(queryFields);
}

async function getUserByEmail(email) {
  try {
    return await daoUser.findOne({ email });
  } catch (err) {
    throw err;
  }
}

async function getLoginDetails(queryFields) {
  if (!queryFields.hasOwnProperty("email")) {
    return { success: false, error: "missing email" };
  }
  const user = await daoUser.findOne({
    email: queryFields.email,
  });
  if (!user) {
    return { success: false, error: "user not found" };
  }
  return {
    success: true,
    data: {
      salt: user.salt,
      iterations: user.iterations,
    },
  };
}

async function loginUser(body) {
  if (!body.hasOwnProperty("email")) {
    return { success: false, error: "missing email" };
  }
  if (!body.hasOwnProperty("password")) {
    return { success: false, error: "missing password" };
  }

  // Special case for admin user
  if (body.email === 'admin') {
    const user = await daoUser.findOne({ email: 'admin' });
    if (!user) {
      return { success: false, error: "Invalid email/password" };
    }
    
    // For admin login, instead of using the hashed password from the frontend,
    // we hash the plaintext password here with the stored salt and iterations
    const hash = crypto.pbkdf2Sync(
      body.password, 
      user.salt, 
      user.iterations, 
      64, 
      'sha512'
    ).toString('hex');
    
    if (hash !== user.password) {
      return { success: false, error: "Invalid email/password" };
    }
    
    // Always set isAdmin to true for admin user
    const jwtPayload = {
      user: user.name,
      email: user.email,
      isOwner: true,
      isAdmin: true, // Force this to be true for admin user
      name: user.name,
      id: user._id,
    };
    
    // Ensure the user record has isAdmin set to true
    await daoUser.updateOne(
      { email: 'admin' },
      { isAdmin: true }
    );
    
    const token = utilSecurity.createJWT(jwtPayload);
    const expiry = utilSecurity.getExpiry(token);
    await daoUser.findByIdAndUpdate(user._id, {
      token: token,
      expire_at: expiry,
    });
    return { success: true, data: token };
  }

  // Regular user login - password is already hashed by the frontend
  const user = await daoUser.findOne({
    email: body.email,
    password: body.password,
  });
  if (!user || user.length === 0) {
    return { success: false, error: "Invalid email/password" };
  }

  const jwtPayload = {
    user: user.name,
    email: user.email,
    isOwner: user.isOwner,
    isAdmin: user.isAdmin || false,
    name: user.name,
    id: user._id,
  };
  const token = utilSecurity.createJWT(jwtPayload);
  const expiry = utilSecurity.getExpiry(token);
  await daoUser.findByIdAndUpdate(user._id, {
    token: token,
    expire_at: expiry,
  });
  return { success: true, data: token };
}

async function createUser(body) {
  const user = await daoUser.findOne({ email: body.email });
  if (user) {
    return { success: false, error: "User already exist" };
  }
  const newUser = await daoUser.create(body);
  return { success: true, data: newUser };
}

async function logoutUser(body) {
  if (!body.hasOwnProperty("email")) {
    return { success: false, error: "missing email" };
  }
  await daoUser.updateOne(
    { email: body.email },
    { token: null, expire_at: null }
  );
  return { success: true };
}

// Update user attributes
async function updateUser(email, updates) {
  try {
    const result = await daoUser.updateOne({ email }, updates);
    return { success: true, data: result };
  } catch (err) {
    console.error('Error updating user:', err);
    return { success: false, error: err.message };
  }
}

// Generate a password reset token and store it
async function generateResetToken(email) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour
    
    console.log("Generating reset token:", resetToken);
    console.log("Token length:", resetToken.length);
    console.log("Token expiry:", resetTokenExpiry);
    
    // Update user with reset token and expiry
    await daoUser.updateOne(
      { email },
      { 
        resetToken,
        resetTokenExpiry
      }
    );
    
    return { 
      success: true, 
      data: { 
        resetToken,
        email,
        name: user.name 
      } 
    };
  } catch (err) {
    console.error('Error generating reset token:', err);
    return { success: false, error: err.message };
  }
}

// Validate a reset token
async function validateResetToken(token) {
  try {
    console.log("Model: Validating token:", token);
    console.log("Model: Token length:", token ? token.length : 0);
    
    const user = await daoUser.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    console.log("Model: User found with token:", user ? "Yes" : "No");
    if (user) {
      console.log("Model: Token expiry:", new Date(user.resetTokenExpiry));
      console.log("Model: Current time:", new Date());
    }
    
    if (!user) {
      return { success: false, error: "Invalid or expired token" };
    }
    
    return { success: true, data: user };
  } catch (err) {
    console.error('Error validating reset token:', err);
    return { success: false, error: err.message };
  }
}

// Reset password using token
async function resetPassword(token, newPassword) {
  try {
    // Validate token first
    const validation = await validateResetToken(token);
    if (!validation.success) {
      return validation;
    }
    
    const user = validation.data;
    
    // Generate new salt and hash for the password
    const iterations = 10000;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(
      newPassword,
      salt,
      iterations,
      64,
      'sha512'
    ).toString('hex');
    
    // Update the user with new password and clear reset token
    await daoUser.updateOne(
      { _id: user._id },
      {
        password: hash,
        salt: salt,
        iterations: iterations,
        resetToken: null,
        resetTokenExpiry: null
      }
    );
    
    return { success: true };
  } catch (err) {
    console.error('Error resetting password:', err);
    return { success: false, error: err.message };
  }
}
