const Banner = require("../models/bannerModel");

const loadAddBanner = async (req, res) => {
  try {
    res.render("addBanner");
  } catch (error) {
    res.send(500).send("invalid server error");
  }
};

// save banner data in database

const createBanner = async (req, res) => {
  try {
    console.log("Entering createBanner");

    z;
    let imageFiles = [];

    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map((file) => ({ filename: file.filename }));
    }

    console.log("Uploaded image files:", imageFiles);
    console.log("Request body:", req.body);

    const alreadyExist = await Banner.findOne({ title });

    if (!alreadyExist) {
      const banner = new Banner({
        image: imageFiles,
        title,
        description,
        date: Date.now(),
        link,
      });

      const savedBanner = await banner.save();
      console.log("Saved banner:", savedBanner);

      res.redirect("/admin/banners");
    } else {
      console.log("Banner with the same title already exists.");
      res.status(400).send("Banner with the same title already exists.");
    }
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).send("Internal server error");
  }
};

const bannerList = async (req, res) => {
  try {
    const bannerData = await Banner.find();
    res.render("bannerList", { banner: bannerData });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};
const bannerEdit = async (req, res) => {
  try {
    const bannerId = req.query.id;
    const banner = await Banner.findById(bannerId);
    res.render("editBanner", { banner });
  } catch (error) {
    res.status(200).send("invalid server error");
  }
};

const updateBanner = async (req, res) => {
  try {
    // Destructure values from the request body
    const { title, description, link, id } = req.body;

    // Get the image files from the request
    const imageFiles = req.files;

    // Create an empty array to store image information
    let imageArray = [];

    // Check if there are uploaded image files
    if (imageFiles && imageFiles.length > 0) {
      // Map through the image files and extract the filename
      imageArray = imageFiles.map((file) => ({ filename: file.filename }));
    } else {
      // If no new images, check if there's an existing banner with images
      const existingBanner = await Banner.findById(id);
      if (existingBanner && existingBanner.image) {
        // Use the existing images if available
        imageArray = existingBanner.image;
      }
    }

    // Check if the banner exists
    const banner = await Banner.findById(id);
    if (!banner) {
      // If the banner doesn't exist, return a 404 response
      return res.status(404).send("Banner not found");
    }

    // Update banner properties
    banner.title = title;
    banner.description = description;
    banner.link = link;
    banner.image = imageArray;

    // Save the updated banner
    const updatedBanner = await banner.save();

    // Log the updated banner and redirect to the banner list page
    console.log("Updated banner:", updatedBanner);
    res.redirect("/admin/bannerList");
  } catch (error) {
    // Handle errors and send a 500 Internal Server Error response
    console.error("Error updating banner:", error);
    res.status(500).send("Internal server error");
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.body.id;
    const banner = await Banner.findByIdAndDelete(id);
    if (banner) {
      res.status(200).json("deleted");
    }
  } catch (error) {
    res.status(500).json("invalid server");
  }
};
module.exports = {
  loadAddBanner,
  createBanner,
  bannerList,
  bannerEdit,
  updateBanner,
  deleteBanner,
};
