const jwt = require("jsonwebtoken");
const User = require("../models/User");

// middleware for access control in the entire app
const auth = (req, res, next) => {
  // retrieve the bearer token from the header 
  var token = req.headers.authorization || req.query.token;

  // checking if bearer token has been provided or retrieved
  if (!token) {
    return res.status(403).send("Token required");
  }

  // accept the token side of the retrived data
  token = token.split(" ")[1];

  try {
    // decode the token and check its validity
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded.id)
    req.user_id = decoded.id;
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

// admin middleware for admin access control
const isAdmin = async (req, res, next) => {
  // getting the user id from req.user_id
  const userId = req.user_id;

  // retriving a user by id
  const user = await User.findById(userId);
    
  // checking the existence of the user
  if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // checking if the user is an admin 
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
};

module.exports = { auth, isAdmin };
