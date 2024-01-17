const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Wallet = require("../models/walletModel");
const { bannerEdit } = require("./bannerController");
const Banner = require("../models/bannerModel");
require("dotenv").config({ path: "./config/.env" });


// load register page 
const loadRegister = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const referralCode = req.query.referel;

    req.session.refferalCode = referralCode;

    res.render("register", {
      loggedIn,
      category: categoryData,
    });
  } catch (error) {
    handleServerError(res, error, "Error loading register page");
  }
};


// save user details into database and send otp into user email 

const insertUser = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    const findUser = await User.findOne({ email: req.body.email });
    if (!findUser) {
      const { name, email, password, mobile } = req.body;
      const referralCode = req.query.referel;
      await emailVerification(email);

      req.session.tempData = { name, email, password, mobile, referralCode };

      res.redirect("/verifyOtp");
    } else {
      res.render("register", {
        message: "Email already exists",
        loggedIn,
        category: categoryData,
      });
    }
  } catch (error) {
    handleServerError(res, error, "Error inserting the user");
  }
};


// user resend otp 

const resendOtp = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.session.tempData;
    await emailVerification(email);
  } catch (error) {
    handleServerError(res, error);
  }
};


// otp verification page load

const verifyPageLoad = async (req, res) => {
  try {
    res.render("verifyOtp");
  } catch (error) {
    handleServerError(res, error, "Error loading verify OTP page");
  }
};
const otpCache = {};
let otpVal;

const emailVerification = async (email) => {
  try {
    otpVal = Math.floor(Math.random() * 10000).toString();
    otpCache[email] = otpVal;
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification Code",
      text: otpVal,
    };

    let info = await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


// check otp is correct and save user details in database
const confirmOtp = async (req, res) => {
  try {
    let wallet; // Declare wallet variable

    if (otpVal == req.body.formOtp) {
      const { name, email, password, mobile } = req.session.tempData;
      const referralCode = req.session.refferalCode;

      const spassword = await bcrypt.hash(password, 10);

      // Create a new user
      const user = new User({
        name,
        email,
        mobile,
        password: spassword,
        is_block: 0,
        is_admin: 0,
      });

      // Save user data
      const userData = await user.save();

      if (userData) {
        // Create a wallet for the user
        wallet = new Wallet({
          user_id: userData._id,
          balance: 0,
          transactions: [],
        });

        // Save wallet data
        const walletData = await wallet.save();

        if (walletData) {
          // Find the referee based on referral code

          const refereeName = await User.findOne({
            referralCode: referralCode,
          });

          if (refereeName) {
            // Update the referee's wallet
            const updatedWallet = await Wallet.findOneAndUpdate(
              { user_id: refereeName._id },
              {
                $inc: { balance: 500 },
                $push: {
                  transactions: {
                    amount: 500,
                    transactionType: "credit",
                    date: new Date(),
                  },
                },
              },
              { new: true }
            );

            // Further logic if needed based on the updatedWallet
          }
        }
      }

      // Set session variables and redirect to home
      req.session.user_id = user._id;
      req.session.auth = true;
      res.redirect("/home");
    } else {
      res.render("verifyOtp", { message: "Invalid OTP" });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

// login page load 


const loginLoad = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("user-login", {
      loggedIn,
      category: categoryData,
    });
  } catch (error) {
    handleServerError(res, error, "Error loading user login page");
  }
};


// verify  login 

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const userData = await User.findOne({ email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_block) {
          res.render("user-login", {
            loggedIn,
            category: categoryData,
            message:
              "Your account is blocked. Please contact the administrator",
          });
        } else {
          if (userData.is_admin) {
            req.session.adminAuth = true;
            res.redirect("/admin");
          } else {
            req.session.user_id = userData._id;
            req.session.auth = true;
            await Cart.updateMany(
              { user_id: null },
              { $set: { user_id: userData._id } }
            );
            res.redirect("/home");
          }
        }
      } else {
        res.render("user-login", {
          message: "Password is incorrect",
          loggedIn,
          category: categoryData,
        });
      }
    } else {
      res.render("user-login", {
        message: "Email is not found",
        loggedIn,
        category: categoryData,
      });
    }
  } catch (error) {
    handleServerError(res, error, "Error verifying user login");
  }
};


// lode home 
const loadHome = async (req, res) => {
  try {
    
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const productData = await Products.find({ is_active: 0 });
    const latestProducts = await Products.find({ is_active: 0 })
    .sort({ createdOn: -1 })  // Sorting in descending order based on createdOn
    .limit(8);
    console.log(latestProducts)
    const bannerData = await Banner.find();
    console.log(bannerData);
    res.render("home", {
      loggedIn,
      products: productData,
      category: categoryData,
      banner: bannerData,
      latestProducts,
    });
  } catch (error) {
    handleServerError(res, error, "Error loading the home page");
  }
};

// user logout ]
const userLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.sendStatus(500);
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

const handleServerError = (res, error, message = "Internal Server Error") => {
  console.error(`Error: ${error.message}`);
  res.status(500).send(message);
};


// about page 

const aboutPage = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("aboutPage", {
      loggedIn,
      category: categoryData,
    });
  } catch (error) {
    console.error("error");
    res.status(500).send("invalid server error");
  }
};

// forget password 

const forgetPassEmailVerifyPageLoad = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("forgetPassEmaiVerify", { loggedIn, category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};


// verify email for change password 

const verifyEmail = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const email = req.body.email;
    console.log(email);

    const userData = await User.findOne({ email: email });

    if (!userData) {
      res.render("forgetPassEmaiVerify", {
        loggedIn,
        category: categoryData,
        message: "Email not found",
      });
    } else {
      req.session.userEmail = email;
      await emailVerification(email);
      res.redirect("/ForgetPassVerifyOtp");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid server error");
  }
};

// forget password otp verification pae load 


const forgetPassVerifyOtp = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("forgetPassOtpPage", { loggedIn, category: categoryData });
  } catch (error) {
    res.status(500).send("invalid server error");
  }
};

// check otp to change password 

const verifyOtp = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const otpCode = req.body.otpCode;
    console.log("otp code");
    console.log(otpVal);

    if (otpVal == otpCode) {
      res.render("changePassword", { loggedIn, category: categoryData });
    } else {
      res.render("forgetPassOtpPage", {
        loggedIn,
        category: categoryData,
        message: "otp is incorrect",
      });
    }
  } catch (error) {
    res.status(500).send("invalid server error");
  }
};

// change password 


const changePassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    console.log(newPassword);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedNewPassword);
    console.log(req.session.userEmail);
    const email = req.session.userEmail;
    console.log(email);
    const userData = await User.findOne({ email: email });
    console.log(userData);
    userData.password = hashedNewPassword;
    const updatedPass = await userData.save();

    if (updatedPass) {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send(" invalid server error ");
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  emailVerification,
  verifyPageLoad,
  confirmOtp,
  verifyLogin,
  loadHome,
  userLogout,
  resendOtp,
  aboutPage,
  forgetPassEmailVerifyPageLoad,
  verifyEmail,
  forgetPassVerifyOtp,
  verifyOtp,
  changePassword,
};
