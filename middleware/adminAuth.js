const adminLoggedIn = (req, res, next) => {
  if (req.session.adminAuth) {
    next();
  } else {
    res.redirect("/");
  }
};

const adminNotLoggedIn = (req, res, next) => {
  if (!req.session.adminAuth) {
    next();
  } else {
    res.redirect("/admin");
  }
};

module.exports = {
  adminLoggedIn,
  adminNotLoggedIn,
};
