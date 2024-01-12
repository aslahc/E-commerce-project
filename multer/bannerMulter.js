const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, path.join(__dirname, "../public/admin-assets/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const uploadBanner = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Example: 10 MB limit
});

module.exports = uploadBanner;
