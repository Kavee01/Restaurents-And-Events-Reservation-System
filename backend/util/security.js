var jwt = require("jsonwebtoken");

module.exports = {
  createJWT,
  getExpiry,
  verifyJWT,
};

function createJWT(payload) {
  try {
    const token = jwt.sign(
      // data payload
      { payload },
      process.env.SECRET,
      { expiresIn: "24h" }
    );
    return token;
  } catch (err) {
    console.error('Error creating JWT:', err);
    return null;
  }
}

function getExpiry(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    return exp;
  } catch (err) {
    console.error('Error getting JWT expiry:', err);
    return null;
  }
}

function verifyJWT(token) {
  if (!token) {
    console.log('No token provided to verify');
    return null;
  }
  
  try {
    const payload = jwt.verify(
      token,
      process.env.SECRET,
      function (err, decoded) {
        // If valid token, decoded will be the token's entire payload
        // If invalid token, err will be set
        if (err) {
          console.log('JWT verification failed:', err.message);
          return null;
        }
        return decoded;
      }
    );
    return payload;
  } catch (err) {
    console.error('Unexpected error verifying JWT:', err);
    return null;
  }
}
