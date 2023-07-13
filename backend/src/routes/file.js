const express = require("express");
const router = express.Router();
const path = require("path");

const {
  fetchFiles,
  mailFile,
  uploadFile,
  fetchFile,
  fetchStats,
  downloadFile,
} = require("../controllers/file");
const multer = require("multer");

const { isAdmin, auth } = require("../util/middleware");

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.get("/", fetchFiles);
router.get("/:filename/", fetchFile);
router.post("/upload/", auth, isAdmin, upload.single("file"), uploadFile);
router.post("/mail/:id", auth, mailFile);
router.get("/:id/stats", auth, isAdmin, fetchStats);
router.get("/:id/download", auth, downloadFile);

module.exports = router;
