const User = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  // retrieve the fullname, email, password and/or role from the body
  const { fullname, email, password, role } = req.body;

  // validating the result of the email and password check
  const error = validationResult(req);

  // checking for validation error
  if (!error.isEmpty) {
    res.status(400).json({ success: false, errors: error.array() });
  }

  try {
    // retrieving a user from the database
    const existingUser = await User.findOne({ email }).exec();

    // checking the existence of the user
    if (existingUser) {
      return res
        // .status(409)
        .json({ success: false, msg: "user already exists" });
    }

    // creating a user
    const user = new User({
      fullname,
      email,
      password,
      role,
    });

    // saving the created user
    await user.save();

    return res
      .status(201)
      .json({ success: true, msg: "user registered successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "internal server error" });
  }
};

const login = async (req, res) => {
  try {
    
  // retrieve the email, and password from the body
    const { email, password } = req.body;

    // retrieving a user from the database
    const user = await User.findOne({ email }).exec();

    // cheking the existence of the user
    if (!user) {
      return res.json({ success: false, error: "user not found" });
    }

    // comparing password received from user to what is in the database
    const validPassword = await user.comparePassword(password);

    // checking password validity
    if (!validPassword) {
      return res.json({ success: false, error: "invalid password" });
    }

    // generating token
    const token = jwt.sign(
      { id: user.id, email: email },
      process.env.SECRET_KEY,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    // adding token to the user before sending it
    user.tokens = token;

    // saving user id in red.userId
    req.userId = user.id;

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: `internal server error ${err}` });
  }
};

const forgotPassword = async (req, res) => {
  // retrieve the email from the body
  const { email } = req.body;
  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Store the token and token expiration in the user's record
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    const mail_name = process.env.GMAIL_USER;
    const password = process.env.GMAIL_PASSWORD;

    // creating a transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: mail_name,
        pass: password,
      },
    });

    // composing the email
    const mailOptions = {
      from: mail_name,
      to: user.email,
      subject: "Password Reset",
      text:
        `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n` +
        `Please click on the following link, or paste it into your browser to complete the process:\n\n` +
        `http://localhost:8000/api/auth/reset-password/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // sending the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to send email" });
      }
      return res.json({ success: true, message: "Password reset email sent" });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  // retrieving reset token from url
  const { token } = req.params;
  // retrieving the new password from the body
  const { password }= req.body;
  try{
    // Find the user by the token and ensure it has not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    // checking if such user exists
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

     // Update the user's password
     user.password = password;
     user.resetToken = undefined;
     user.resetTokenExpiration = undefined;
    //  save the update
     await user.save();

     return res.json({ success: true, message: 'Password reset successful' });

  }catch(err){
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });

  }
}

const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json({ success: true, data: users });
};

module.exports = { register, login, getUsers, resetPassword, forgotPassword };
