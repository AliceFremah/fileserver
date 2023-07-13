const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

// user schema
const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    role: {
      type: String,
      default: "user",
    },
    password: {
      type: String,
      required: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    tokens: Array,
  },
  { timestamps: true }
);

// adding compare method to compare passwords before login
userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) =>
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    })
  );
};

// hook
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    // password hashing
    bcrypt.hash(user.password, salt, undefined, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", userSchema);
