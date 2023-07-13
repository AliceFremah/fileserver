const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// file schema
const fileSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file: {
      data: Buffer,
      contentType: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    emailCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: Date }
);

module.exports = mongoose.model("File", fileSchema);
