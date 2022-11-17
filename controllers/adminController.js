const productHelpers = require("../helpers/productHelper");
var productHelper = require("../helpers/productHelper");

const home = (req, res, next) => {
  
  res.render("admin/home", { admin: true });
};

const login = (req, res, next) => {
  res.render("admin/login");
};

const viewProduct = (req, res, next) => {
  productHelper.getAllproducts().then((products) => {
    res.render("admin/viewProduct", {products});
    
  })
};

const addProductPage = (req, res, next) => {
  res.render("admin/addProduct");
};

const addproduct = (req, res, next) => {
  console.log(req.body);
  console.log(req.files.image);
  productHelper.addproduct(req.body, (id) => {
    let image = req.files.image;
    image.mv("./public/images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/addProductPage");
      }
    });
  });
};

const category = (req, res) => {
  res.render('admin/category')
}
module.exports = { home, login, addProductPage, viewProduct, addproduct,category, };
