const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

// Load Categories Page
const loadCategoriesPage = async (req, res) => {
  try {
    const search = req.query.search || ""; // Extract search query from URL
    const page = req.query.page || 0;
    const categoriesPerPage = 9; // You can adjust the number of categories per page

    let query = {};

    // Add search functionality
    if (search) {
      query.catName = { $regex: new RegExp(search, "i") };
    }

    const totalNumberOfCategories = await Category.find(query).countDocuments();
    const totalNumberOfPages = Math.ceil(
      totalNumberOfCategories / categoriesPerPage
    );

    const categoryData = await Category.find(query)
      .skip(page * categoriesPerPage)
      .limit(categoriesPerPage);

    res.render("categories", {
      category: categoryData,
      search,
      page,
      totalNumberOfPages,
    });
  } catch (error) {
    console.error("Error in loadCategoriesPage:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Add Category
const addCategory = async (req, res) => {
  try {
    const findCategory = await Category.findOne({
      catName: { $regex: new RegExp(req.body.catName, "i") },
    });

    if (!findCategory) {
      const categoryName = req.body.catName;
      const selectedList = req.body.liOrUl;
      const listed = selectedList === "list" ? false : true;

      const category = await new Category({
        catName: categoryName,
        is_active: listed,
      });

      await category.save();
      res.redirect("/admin/categories");
    } else {
      const categoryData = await Category.find({});
      res.render("categories", {
        message: "Category already exists",
        category: categoryData,
      });
    }
  } catch (error) {
    console.error("Error in addCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.status(200).json("/admin/categories");
  } catch (error) {
    console.error("Error in deleteCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const selectedList = req.body.liOrUl;
    const listed = selectedList === "list" ? false : true;

    const categoryData = await Category.findOne({ catName: req.body.catName });

    if (!categoryData) {
      const category = await Category.findByIdAndUpdate(
        { _id: req.body._id },
        {
          $set: {
            catName: req.body.catName,
            is_active: listed,
          },
        }
      );
      if (category) {
        res.status(200).json("updated");
      }
    } else {
      res.status(500).json({ error: "Category is already used" });
    }
  } catch (error) {
    console.error("Error in updateCategory:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const categoryId = req.body.CategoryId;
    const offerPercentage = req.body.offer;
    const categoryData = await Category.findById(categoryId);

    categoryData.categoryOffer = offerPercentage;
    await categoryData.save();

    const productData = await Products.find({ category: categoryId });

    // Use for...of loop for asynchronous operations
    for (const product of productData) {
      // Calculate the sale price without decimals
      product.salePrice =
        product.salePrice -
        Math.floor(product.regularPrice * (offerPercentage / 100));

      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Category offer updated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
};
// remove category offer 

const removeCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const categoryData = await Category.findById(categoryId);

    const productData = await Products.find({ category: categoryId });

    const offerPercentage = categoryData.categoryOffer;

    if (productData.length > 0) {
      for (const product of productData) {
        // Calculate the sale price without decimals
        product.salePrice =
          product.salePrice +
          Math.floor(product.regularPrice * (offerPercentage / 100));

        await product.save();
      }

      categoryData.categoryOffer = 0;
      await categoryData.save();
    }

    res.status(200).json({
      success: true,
      // Note: The next line may not work as expected, consider revising
      salePrice: productData[0].salePrice, // Use index 0 to get the first product's salePrice
      message: "Offer removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  loadCategoriesPage,
  addCategory,
  deleteCategory,
  updateCategory,
  addCategoryOffer,
  removeCategoryOffer,
};
