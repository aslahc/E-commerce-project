

const User = require("../models/userModel");

const isLogin = (req, res, next) => {
  if (req.session.auth) {
    next();
  } else {
    res.redirect("/login");
  }
};

const isLogout = (req, res, next) => {
  if (!req.session.auth) {
    next();
  } else {
    if (req.session.adminAuth) {
      res.redirect("/admin");
    } else {
      res.redirect("/home");
    }
  }
};


// check the user is blocked or not

const checkBlockedStatus = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    console.log(userId)
    const userData = await User.findById(userId);
   
    if (userData && userData.is_block) {
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/login");
        }
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  isLogin,
  isLogout,
  checkBlockedStatus,
};
