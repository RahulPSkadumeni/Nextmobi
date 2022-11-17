
const { response } = require('express');
const userHelper=require('../helpers/userHelper')
const homepage = (req, res, next) => {
  let user = req.session.user
  console.log(user);
  res.render("user/home", {user,User:true});
};

const loginPage = (req, res, next) => {
  if (req.session.loggedIn) {
    return res.redirect('/')
  } else {
    
    res.render("user/login", { User: true, 'loginErr': req.session.loginErr });
    req.session.loginErr=false
  }
};

const login = (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user=response.user
      return res.redirect('/')
    } else {
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
  
}

const signupPage = (req, res, next) => {
  res.render("user/signup");
};

const signup = (req, res) => {
  
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
    res.redirect('/login')
  })
};

const logout = (req,res)=> {
  req.session.destroy()
  res.redirect('/')
}

const otploginpage = (req, res) => {
  res.render('user/otpLogin');
}

module.exports = { homepage, loginPage,login, signupPage,signup,logout,otploginpage };
