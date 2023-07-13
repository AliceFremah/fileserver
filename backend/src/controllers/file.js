const File = require("../models/File");
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");

const uploadFile = async (req, res) => {
  // retrieving title and description from body
  const { title, description } = req.body;
  // retrieving filename, path and mimetype from tile
  const { filename, path, mimetype } = req.file;

  // reading the file 
  var file = fs.readFileSync(path);
  // encoding file before storage
  var encode_img = file.toString("base64");
  // creating an object literal of the file
  var final_file = {
    contentType: mimetype,
    data: Buffer.from(encode_img, "base64"),
  };

  try {

    // creating the file
    const file = new File({
      filename: filename,
      title: title,
      description: description,
      file: final_file,
    });
    // saving the file
    file.save();
    return res.json({ success: true, message: "File uploaded successfully" });
  } catch (err) {
    return res.json({ success: false, message: "internal server error" });
  }
};

const fetchFiles = async (req, res) => {
  try {
    const files = await File.find({});
    if (!files) {
      return res.json({ success: false, message: "No files found" });
    }
    // creating a url of each file retrieved
    const filesWithUrls = files.map((file) => ({
      _id: file._id,
      title: file.title,
      description: file.description,
      filename: file.filename,
      emailCount: file.emailCount,
      downloadCount: file.downloadCount,
      contentType: file.file.contentType,
      url: `${req.protocol}://${req.get('host')}/api/file/${file.filename}`,
    }));
    return res.json({ success: true , data: filesWithUrls });
  } catch (err) {
    return res.json({ success: false, message: "Internal server error" });
  }
};

const fetchFile = async (req, res) => {
  // getting the filename from the param
  const { filename } = req.params;
  try {
    // fetching a file with filename
    const file = await File.findOne({ filename });

    // checking existence of the file
    if (!file) {
      return res.json({ success: false, message: "File not found" });
    }

    // Set the appropriate response headers
    res.setHeader("Content-Type", file.file.contentType);
    res.setHeader("Content-Disposition", `inline; filename=${filename}`);

    // Send the file data as the response
    res.send(file.file.data);
  } catch (err) {
    return res.json({ success: false, message: "Internal server error" });
  }
};

const mailFile = async (req, res) => {
  // retrive the id of file to be mailed from the url
  const fileId = req.params.id;
  // retrieve the email from the body
  const { email } = req.body;

  try {
    // fetching a file with file id
    const file = await File.findById(fileId);
    // checking existence of the file
    if (!file) {
      return res.json({ success: false, message: "File not found" });
    }

    // getting the app user and app password from the .env file
    const user = process.env.GMAIL_USER;
    const password = process.env.GMAIL_PASSWORD;

    // creating a transporter for sending email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: user,
        pass: password,
      },
    });

    // Compose the email message
    const message = {
      from: user,
      to: email,
      subject: "File from Amalitech",
      text: "Here is your file",
      attachments: [
        {
          filename: file.filename,
          content: file.file.data,
          contentType: file.file.contentType,
        },
      ],
    };

    // Send the email
    transporter.sendMail(message, async (error, info) => {
      if (error) {
        return res.json({ success: false, message: "Failed to send email" });
      }
      // Update the emailCount and save the file
      file.emailCount += 1;
      await file.save();

      return res.json({ success: true, message: "Email sent successfully" });
    });
  } catch (err) {
    return res.json({ success: false, message: "Internal server error" });
  }
};

const fetchStats = async (req, res) => {
  // retrive the id of file to be mailed from the url
  const fileId = req.params.id;

  try {
     // fetching a file with file id
    const file = await File.findById(fileId);

    // checking existence of file
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // retrieving the email and password counts from the retrived file
    const { emailCount, downloadCount } = file;

    // sending the counts as a response
    return res.json({ success: true, emailCount, downloadCount });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const downloadFile = async (req, res) => {
  // retrive the id of file to be mailed from the url
  const fileId = req.params.id;
  try {
    // retriving the file by id
    const file = await File.findById(fileId);
    // checking the existence of the file
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // the path to where the file is stored locally
    const filePath = path.join(__dirname, "../../uploads", file.filename);

    // setting the appropriate headers for the files
    res.set({
      "Content-Type": file.file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    // updating the download count
    file.downloadCount += 1;
    // saving the updated file model
    await file.save();
    // Stream the file data as the response
    res.sendFile(filePath, {
      headers: { "Content-Type": file.file.contentType },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  uploadFile,
  fetchFiles,
  mailFile,
  fetchFile,
  fetchStats,
  downloadFile,
};
