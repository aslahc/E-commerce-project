const Category = require("../models/categoryModel");
const Products = require("../models/productModel");
const fs = require("fs");

const handleServerError = (res, error, message = "Internal Server Error") => {
  console.error(`Error: ${error.message}`);
  res.status(500).send(message);
};
// admin side add product page load 

const addProductPageLoad = async (req, res) => {
  try {
    const categoryData = await Category.find({ is_active: false });
    res.render("productPage", { category: categoryData });
  } catch (error) {
    handleServerError(res, error, "Error loading add product page");
  }
};

// save product in database 

const publishProduct = async (req, res) => {
  try {
    const {
      productName,
      productRegPrice,
      productSize,
      productBrand,
      productDescription,
      productStock,
      proCategory,
    } = req.body;
    let imageFiles = [];
    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map((file) => ({ filename: file.filename }));
    }

    const product = new Products({
      productName,
      Brand: productBrand,
      description: productDescription,
      regularPrice: productRegPrice,
      salePrice:productRegPrice ,
      size: productSize,
      createdOn: Date.now(),
      image: imageFiles,
      stock: productStock,
      is_active: 0,
      category: proCategory,
    });

    await product.save();
    res.redirect("/admin/addProducts");
  } catch (error) {
    handleServerError(res, error, "Error publishing product");
  }
};


// admin side load product list 

const loadProductList = async (req, res) => {
  try {
    console.log(req.query.search); // Change this line to use req.query
    const search = req.query.search;
    const sortCategory = req.query.id;
    const page = req.query.page || 0;
    const productsPerPage = 12;

    let query = {};

    // Add search functionality
    if (search) {
      query.productName = { $regex: new RegExp(search, "i") };
    }

    // Add category filter if selected
    if (sortCategory) {
      query.category = sortCategory;
    }

    const totalNumberOfProducts = await Products.find(query).countDocuments();
    const totalNumberOfPages = Math.ceil(
      totalNumberOfProducts / productsPerPage
    );

    const productData = await Products.find(query)
      .skip(page * productsPerPage)
      .limit(productsPerPage);

    const categoryData = await Category.find({});

    res.render("productList", {
      products: productData,
      category: categoryData,
      page: page,
      totalNumberOfPages,
    });
  } catch (error) {
    handleServerError(res, error, "Error loading product list");
  }
};


// load edit product 

const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Products.findById(id);
    const categoryData = await Category.find({ is_active: false });

    if (productData) {
      res.render("editProduct", {
        products: productData,
        category: categoryData,
      });
    } else {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    handleServerError(res, error, "Error loading edit product page");
  }
};


// delete product from admin side 

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const result = await Products.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    handleServerError(res, error, "Error deleting product");
  }
};


// update product 

const updateProducts = async (req, res) => {
  try {
    const _id = req.body.id;

    const {
      productName,
      productBrand,
      productDescription,
      productRegPrice,
      productSalePrice,
      productSize,

      productStock,
    } = req.body;

    const imageFile = req.files;

    let imageArray = [];

    if (imageFile) {
      imageArray = imageFile.map((file) => ({ filename: file.filename }));
    }
    const existingProduct = await Products.findById(_id);

    const updatedImages = [...existingProduct.image, ...imageArray];

    const productData = await Products.findByIdAndUpdate(
      _id,
      {
        productName: productName,
        Brand: productBrand,
        description: productDescription,
        regularPrice: productRegPrice,
        salePrice: productSalePrice,
        size: productSize,
        createdOn: Date.now(),
        stock: productStock,
        image: updatedImages,
      },
      { new: true }
    );

    if (productData) {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    handleServerError(res, error, "Error updating product");
  }
};



// user side product details page 

const productDetailsPage = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const id = req.query.id;

    const productData = await Products.findById(id);
    const categoryData = await Category.find({});
    const relatedProduct = await Products.find({ category: productData.category }).limit(4);
    console.log(relatedProduct)
    if (productData) {
      res.render("productDetails.ejs", {
        loggedIn,
        products: productData,
        category: categoryData,
        relatedProduct,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    handleServerError(res, error, "Error loading product details page");
  }
};

// user side  all product list page 
const shopList = async (req, res) => {
  try {
    const search = req.query.search;
    const searchCategory = req.query.category;
    const sortCategory = req.query.id;

    const page = req.query.page || 0;
    const productsPerPage = 6;

    let productQuery = {};

    if (search) {
      if (searchCategory === 'All') {
        productQuery = {
          productName: { $regex: ".*" + search + ".*", $options: "i" },
        };
      } else {
        productQuery = {
          category: searchCategory,
          productName: { $regex: ".*" + search + ".*", $options: "i" },
        };
      }
    }

    if (sortCategory) {
      productQuery = { category: sortCategory };
    }


    const priceRange = req.query.priceRange;

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-");
      productQuery.regularPrice = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    const selectedBrands = req.query.brands;

    if (selectedBrands) {
      const lowercasedBrands = selectedBrands.toLowerCase();
      productQuery.Brand = {
        $regex: new RegExp(lowercasedBrands.split(",").join("|"), "i"),
      };
    }

    const selectedSizes = req.query.sizes;

    if (selectedSizes) {
      productQuery.size = {
        $in: selectedSizes.split(","),
      };
    }

    const totalNumberOfProducts = await Products.find(
      productQuery
    ).countDocuments();

    const totalNumberOfPages = Math.ceil(
      totalNumberOfProducts / productsPerPage
    );

    const productData = await Products.find(productQuery)
      .skip(page * productsPerPage)
      .limit(productsPerPage);

    const categoryData = await Category.find({});
    const loggedIn = req.session.isAuth ? true : false;

    if (productData && categoryData) {
      res.render("shopList", {
        loggedIn,
        category: categoryData,
        products: productData,
        page: page,
        totalNumberOfPages,
      });
    }
  } catch (error) {
    handleServerError(res, error, "Error loading shop list");
  }
};


// delete a single image from data base 

const deleteSingleImage = async (req, res) => {
  try {
    const { productId, filename } = req.body;
    const product = await Products.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const imageIndex = product.image.findIndex(
      (img) => img.filename === filename
    );

    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Image not found in the product" });
    }

    product.image.splice(imageIndex, 1);

    await product.save();

    const filePath = `public/admin-assets/productImages/${filename}`;

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res
          .status(500)
          .json({ success: false, error: "Error deleting file" });
      }

      res
        .status(200)
        .json({ success: true, message: "Image deleted successfully" });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};



// add a offer  for product 

const addProductOffer = async (req, res) => {
  try {
    const productId = req.body.productId;
    const offerPercentage = req.body.offer;
    const productData = await Products.findById(productId);

    if (productData) {
      productData.productOffer = Math.floor(
        productData.regularPrice * (offerPercentage / 100)
      );

      // Calculate the sale price without decimals
      productData.salePrice = productData.salePrice - productData.productOffer;

      await productData.save();

      // Respond with a success message and updated sale price
      res.status(200).json({
        success: true,
        salePrice: productData.salePrice,
        message: "Offer updated successfully",
      });
    } else {
      // Respond with an error message if product data is not found
      res.status(400).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error(error.message);
    // Handle the error appropriately, such as sending an error response
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// remove product offer 

const removeProductOffer = async (req, res) => {
  try {
    const productId = req.body.productId;
    const productData = await Products.findById(productId);
    let updated;

    if (productData) {
      // Calculate the sale price without decimals
      productData.salePrice =
        Number(productData.productOffer) + Number(productData.salePrice);
      productData.productOffer = 0;
      updated = await productData.save();
    }

    if (updated) {
      res.status(200).json({
        success: true,
        salePrice: productData.salePrice,
        message: "Offer removed successfully",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Can't update the offer." });
    }

    // Redirect to a success page (adjust this based on your routing logic)
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

module.exports = {
  addProductPageLoad,
  publishProduct,
  loadProductList,
  loadEditProduct,
  deleteProduct,
  updateProducts,
  productDetailsPage,
  shopList,
  deleteSingleImage,
  addProductOffer,
  removeProductOffer,
};
