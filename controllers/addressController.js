// Import required modules
const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const Wallet = require("../models/walletModel");
const Address = require("../models/AddressModel");
const Order = require("../models/orderModel");






const bcrypt = require("bcrypt");

// load profile page 
const profilePage = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const walletData = await Wallet.findOne({ user_id: userId });

    // Sort transactions in descending order based on date
    walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const userData = await User.findById({ _id: userId });
    const addressData = await Address.find({ user_id: userId });
    const orderData = await Order.find({ user: userId }).sort({
      createdOn: -1,
    });

    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    res.render("profile", {
      loggedIn,
      category: categoryData,
      address: addressData,
      user: userData,
      order: orderData,
      wallet: walletData,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


//add user addresss
const addAddress = async (req, res) => {
  try {
    const fullName = req.body.fullName;
    const number = req.body.mobile;
    const region = req.body.region;
    const pincode = req.body.pinCode;
    const addressLIne = req.body.addressLine;
    const areaStreet = req.body.areaStreet;
    const landmark = req.body.landmark;
    const townCity = req.body.townCity;
    const state = req.body.state;
    const adressType = req.body.addressType;
    const userId = req.session.user_id;
    const address = new Address({
      fullName: fullName,
      mobile: number,
      region: region,
      pinCode: pincode,
      addressLine: addressLIne,
      areaStreet: areaStreet,
      ladmark: landmark,
      townCity: townCity,
      state: state,
      adressType: adressType,
      user_id: userId,
    });
    await address.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


// delete user address
const deletAddress = async (req, res) => {
  try {
    const id = req.query.id;

    // Extracting the ObjectId from the URL
    const addressId = id.split("=")[1];

    await Address.deleteOne({ _id: addressId });
    res.status(200).json("deleted succesufuly");
  } catch (error) {
    res.status(500).json("Internal Server Error. Please try again later.");
  }
};


//edit user address
const loadEditAddress = async (req, res) => {
  try {
    id = req.query.id;
    const addressData = await Address.findById({ _id: id });
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("editAddress", {
      loggedIn,
      category: categoryData,
      address: addressData,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


//save edited address
const editAddressSave = async (req, res) => {
  try {
    const addressData = await Address.findByIdAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          fullName: req.body.fullName,
          mobile: req.body.mobile,
          region: req.body.region,
          pinCode: req.body.pinCode,
          addressLine: req.body.addressLine,
          areaStreet: req.body.areaStreet,
          ladmark: req.body.landmark,
          townCity: req.body.townCity,
          state: req.body.state,
          adressType: req.body.addressType,
        },
      }
    );
    if (addressData) {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


// edit user profile 
const editProfile = async (req, res) => {
  try {
    id = req.query.id;

    const userDate = await User.findById({ _id: id });
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    res.render("editprofile", {
      loggedIn,
      category: categoryData,
      // address: addressData,
      user: userDate,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};



// save edited user details 
const updateUserData = async (req, res) => {
  try {
    id = req.body.id;
    const user = await User.findById({ _id: id });
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      password = req.body.npassword;
      const spassword = await bcrypt.hash(password, 10);
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,

            mobile: req.body.mobile,
            password: spassword,
          },
        }
      );
      await userData.save();
      res.redirect("/profile");
    } else {
      const loggedIn = req.session.user_id ? true : false;
      const categoryData = await Category.find({ is_active: false });
      const userdetail = await User.findById({ _id: id });
      res.render("editprofile", {
        loggedIn,
        category: categoryData,
        // address: addressData,
        message: "current password is not in correct ",
        user: userdetail,
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};
module.exports = {
  profilePage,
  addAddress,
  deletAddress,
  loadEditAddress,
  editAddressSave,
  editProfile,
  updateUserData,
};
