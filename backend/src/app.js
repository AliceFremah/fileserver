const express = require("express");
const { default: mongoose } = require("mongoose");
const userRoutes = require("./routes/user");
const fileRoutes = require("./routes/file");
const path = require("path");
const cors = require("cors");

// instantiating express
const app = express();
// configuring the dotenv file
require("dotenv").config({ path: ".env" });

// making connection to the database
mongoose
  .connect(process.env.MONGO_URI_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDB connected"))
  .catch((err) => console.log(err));

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth/", userRoutes);
app.use("/api/file/", fileRoutes);


app.all("*", (req, res) => {
  res.json({
    msg: "404: Not Found",
  });
});

module.exports = app;
