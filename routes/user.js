var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
const couponHelpers = require("../helpers/couponHelpers");
var productHelpers = require("../helpers/product-helpers");
const { response, Router } = require("express");

require('dotenv').config();

var accountSID =process.env.TWILO_SID;
var authToken = process.env.TWILO_TOKEN;
var serviceID = process.env.TWILIO_SERVICE_ID;
const client = require("twilio")(accountSID, authToken);


const paypal = require('paypal-rest-sdk');
const session = require("express-session");
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_ID,
  'client_secret': process.env.PAYPAL_SECRET,
});


const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  
  console.log(user);
    let cartCount=0
    if (req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id);
      req.session.user.cartCount=cartCount   
    }

    let wishListCount=0
    if (req.session.user){
      wishListCount=await userHelpers.getWishlistCount(req.session.user._id);
      req.session.user.wishListCount=wishListCount   
    }

    console.log('getting products');
   let products= await productHelpers.getuserAllProducts().then((products) => {
    console.log(products)
    console.log('hello{{{{{{{{{{{{{{{{{>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'.red .bgYellow); // outputs green text

    res.render("user/view-products", { products, user,cartCount,wishListCount});
  });
});

//login page

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

//signup page

router.get("/signup",verifySignup, (req, res) => {

  res.render("user/signup");
});




router.get("/otp-login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  }else{
  res.render("user/otp-login");
  }
}),



  router.post("/otp-login", (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }else{
    userHelpers.doOtpLogin(req.body).then((response) => {
      console.log("--------------------------------");
      console.log(response);
      if (response.acessStatus) {
        if (response.user.acessStatus) {
          req.session.phone = req.body.phone;
          console.log(req.session);
          

          client.verify
            .services(serviceID)

            .verifications.create({
              to: `+91${req.body.phone}`,
              channel: "sms",
            
            } ).then((data) => {
              if (data) {
                // console.log("verification sent");
                res.redirect("/otp-verify");
              }
            }).catch((err)=>{
              console.log(err);
            });
        } else {
          req.session.otpLoginErr = "user is blocked";
          res.redirect("/otp-login");
        }
      } else {
        req.session.otpLoginErr = "Invalid phone number";
        res.redirect("/otp-login");
      }
    })};
  });
  

router.post("/otp-verify", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  }
  
  req.session.code = req.body.code;
console.log(req.session)
  client.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${req.session.phone}`,
      code: req.session.code,
    })
    .then((data) => {
      console.log("/////////////////////////////");
      console.log(data);
      if (data.status === "approved") {
        console.log("user is verified");
        userHelpers.doOtpLogin(req.session).then((response) => {
          console.log(response);
          if (response.acessStatus) {
            req.session.user = response.user;
            req.session.loggedIn = true;
            req.session.phone = false;
           
            res.redirect("/");
          }
        });
      } else {
        req.session.otpCodeErr = "Invalid otp-number";
        console.log("user is not verified");
        alert('invalid otp')
        res.redirect("/otp-verify");
      }
    });
});

router.get("/otp-verify", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  }else{
    res.render("user/otp-verify");
  }
});
// register user
router.post("/signup",verifySignup, (req, res) => {
  console.log(req.body);
  userHelpers.doSignup(req.body).then((data) => {
    console.log(data);
    // req.session.loggedIn=true
    // req.session.user=response
    res.redirect('/')


  });
});
//  userHelpers.doSignup(req.body).then((resolve)=>{

//       res.redirect('/login')
//       console.log(data)

// }).catch(err=>{
//   if(err) throw err;
//   console.log(err)
//   res.render('/signup')
// })

// ...................
router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((respose) => {
    // console.log('respose')
    // console.log(respose)
    if (response.status) {
      if (respose.status) {
        req.session.loggedIn = true;
        req.session.user = respose.user;
        res.redirect("/");
      } else {
        req.session.loginErr = "user blocked";
        res.redirect("/login");
      }
    } else {
      req.session.logginErr = "invalid user";
      res.redirect("/login");
    }
  });
}),


  router.get("/logout", (req, res) => {
    req.session.user = null;
    
    req.session.loggedIn = false;
    //to home page after sign out (/login) for login page
    res.redirect("/");
  }),
 
  // router.get("/product/:id",async (req, res, next) => {
  //   const value=req.params.id;
  //   let cartCount=0
  // //  ------------------------------------
  // if (req.session.user){
  //   cartCount=await userHelpers.getCartCount(req.session.user._id);
  //   req.session.user.cartCount=cartCount   
  // }



  //   // --------------------------------------
  //   productHelpers.getProductDetails(value).then((product)=>{
  //     console.log(product+"   this");
  //     res.render("user/product",{product,cartCount});
      



  //   })


    
  // });

  router.get("/product/:id",async (req, res, next) => {
    const value=req.params.id;
    let cartCount=0
  //  ------------------------------------
  if (req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id);
    req.session.user.cartCount=cartCount   
  }



    // --------------------------------------
    productHelpers.getProductDetails(value).then((product)=>{
      console.log("  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< this");
      console.log(product);
      res.render("user/product",{product,cartCount});
      



    })


    
  });

//login sesson checking middleware

// useredit
router.get("/admin/view-user", async (req, res) => {
  let userData = await userHelpers.getUserDetails(req.params.id);
  res.render("admin/view-user", { admin: true, userData });
});


// ___________________________________________ cart ====>>>

router.get("/cart", verifyLogin,async (req, res, next) => {
  console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

  
  let wishListCount=0
  if (req.session.user){
    wishListCount=await userHelpers.getWishlistCount(req.session.user._id);
    req.session.user.wishListCount=wishListCount   
  }
  
//  ---------------------------------------cartcount sesson  
  if (req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id);
    req.session.user.cartCount=cartCount   
  }
// -----------------end cart ount

let products=await userHelpers.getCartProducts(req.session.user._id)
console.log(products);
console.log(req.session.user._id);
console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
let totalValue=''
let subTotalValue=''
if(cartCount != 0){
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"); 
  subTotalValue=await userHelpers.getSubTotalAmout(req.session.user._id)
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");  
  console.log(subTotalValue);

   totalDiscount=await userHelpers.getTotalDiscount(req.session.user._id,)
   totalValue=await userHelpers.getTotalAmout(req.session.user._id,)
   console.log("totalValue>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+  +subTotalValue);

   console.log("totalValue,,,,,>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+  +totalDiscount);

   console.log("totalValue>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+  +totalValue);
 
}else{
  subTotalValue=0
  totalDiscount=0
  totalValue=0


}

console.log("**************************");
console.log(products);
console.log("**************************");


  res.render("user/cart",{user:req.session.user,wishListCount, cartCount, products,subTotalValue,totalValue,totalDiscount});

}),






//________________________add to cart++++++++++++++++======>>>>>>
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log(req.params.id);
  console.log('haiii');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log('haiii');

    res.redirect("/")
  })


})

router.get('/add-to-cart-wishlist/:id',verifyLogin,(req,res)=>{
  console.log(req.params.id);
  console.log('haiii');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log('haiii');

    res.redirect("/wishlist")
  })


})

function verifySignup(req, res, next) {
  userHelpers.doVerifySignup(req.body).then(verify => {
    if (verify) {
      req.session.signupErr = "Email already exists";
      return res.redirect('/signup');
      console.log('email exists');
    } else {
      // res.redirect('/login')
      next();
    }
  })
}

router.post('/change-product-quantity',(req,res,next)=>{
  console.log("----------------------------------");
  console.log(req.body);
  console.log("----------------------------------");

  userHelpers.changeProductQuantity(req.body).then((response)=>{

    //-------updating total amout after chagr  quantity----------------

    console.log(true)
    console.log(response)
    res.json(response,)

  })
  
})





router.get('/remove-cart/:id',(req,res)=>{
  console.log('hahahhahaaha');
  productId=req.params.id
  console.log(req.session);

 
  console.log(productId);
  userHelpers.removeCart(productId,req.session.user._id).then(()=>{
    console.log('haiii======================');

    res.redirect("/cart")
  })


})


router.get('/place-order',verifyLogin,async(req,res,next)=>{
  

 let cartCount=await userHelpers.getCartCount(req.session.user._id);
//  let total=''
//  let coupon=''
if(cartCount != 0){
console.log(req.session.OrderId);
// console.log(req.session);
  address= await userHelpers.getAddress(req.session.user._id)
  console.log('next...>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Nexttttt');
   console.log(address);
  let total=await userHelpers.getTotalAmout(req.session.user._id)
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>totalllll<<<<<<<<<<<<<<<<<<<<<<<<");
  total=Math.round(total)
  console.log(total);


  // console.log(totalAmout);
  console.log('next...>>>>>>>>>>>>>>apply coupon<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  let coupon=null
  if(req.session.applyCoupon){
    coupon=req.session.applyCoupon
  }
  console.log("===================coupon=== hereeeeee===============");
  console.log(coupon);
  console.log("sessionlllllllllllllllllll");
  console.log(req.session)
  // console.log(req.session);

 let totalPrice=total;
 console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>total Price<<<<<<<<<<<<<<<<<<<<<<");
 console.log(totalPrice);
  if(totalPrice>5000){
console.log('total above 5000');

    couponPrice=await couponHelpers.getCouponPrice(req.session.user._id,total)
    console.log('couponnPrice');   
    // if(couponPrice.discountedPrice>500){

    //   couponPrice.discountedPrice=500

    // }
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(couponPrice);

  }else{

    console.log("need minimum prcahase above 5000");

    // couponPrice.discountedPrice==0
    

  }
  
  console.log("=====================here+++++++++++++++++++++++++++++++++++++++++++++++++");
  // console.log(couponPrice);
  // if(couponPrice>300){
  //   couponPrice=300
  //   console.log("gtaterthan 300");
  // }
  console.log(coupon)
  console.log(couponPrice);

  totalPriceAfterOffer=(req.session.totalPriceAfterOffer),
  console.log("totalllllllllllllllll");
  console.log(totalPriceAfterOffer);

  // discountPrice=req.session.discountPrice
  // if(couponPrice !=null){
  //   total=totalPriceAfterOffer
  // }
  // if(totalPriceAfterOffer>0){
  //   total=totalPriceAfterOffer
  // }
  // else{
  //   total=totalAmout
  // }
  console.log('totalllllllllllllllll');
console.log(total)
//  //?? changing stock quantity of product
//   userHelpers.getOrderProductQuantity(orderId).then((data) => {
//   data.forEach((element) => {
//     userHelpers.updateStockDecrease(element);
//   });
walletBalance= await userHelpers.walletAmountCheckForUser(req.session.user._id)
console.log('wallet balanceeee');
console.log(walletBalance);
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>console total<<<<<<<<<<<<<<<<<<<<<<<<<<<");
console.log(total);
  res.render('user/place-order',{address,total,coupon,walletBalance,user:req.session.user._id})
}else{
  response.status="Add some product to cart"
  res.redirect('/')
}

})


router.post('/place-order',async(req,res)=>{
  console.log('#############################################');
  console.log(req.body);
  let userId = req.session.user._id

console.log("////////??????????????????????????????????");
   console.log(req.body);
  console.log("////////??????????????????????????????????");
  let product=await userHelpers.getCartProductList(req.session.user._id)
  console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.log(product);
  // let totalPrice=await userHelpers.getTotalAmout(req.session.user._id)
   let totalPrice=req.body.total

  userHelpers.placeOrder(req.body,product,totalPrice,userId).then(async(orderId)=>{
    console.log("pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");
   console.log(req.body['payment-method']);
    if (req.body['payment-method']=='COD'){
      console.log(req.body['payment-method']);
      console.log('======= cod ======')
      res.json({codSuccess:true})
     req.session.applyCoupon = false


      userHelpers.getOrderProductQuantity(orderId).then((data) => {
        data.forEach((element) => {
         userHelpers.updateStockDecrease(element);
        });
      });
    }else if(req.body['payment-method']=='wallet'){

      console.log('======= wallet ======')
       let walletAmount= await userHelpers.walletAmountCheck(req.session.user._id,totalPrice)
       if(walletAmount){
       console.log(walletAmount);
       paymentWallet=await userHelpers.WalletAmountReduce(req.session.user._id,totalPrice,walletAmount)

       orderstatus=await userHelpers.changeStatus(orderId)
       console.log(orderstatus);



      userHelpers.getOrderProductQuantity(orderId).then((data) => {
        data.forEach((element) => {
         userHelpers.updateStockDecrease(element);
        });


      });
 req.session.applyCoupon = false


      res.json({wallet:true,orderId:orderId})
    }else{
      // req.session.walletErr = "insufficient balance"
      res.json({status:false})
    }

    }else if(req.body['payment-method']=='paypal'){
      res.json({paypal:true,orderId:orderId})


    }else {
      console.log('======= razor ======')

      userHelpers.generateRazorPay(orderId,totalPrice).then((response)=>{
        res.json(response)    
        console.log('here...........>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      })
      orderstatus=await userHelpers.changeStatus(orderId)
      console.log("statusss");
      console.log(orderstatus);
      console.log('here...........>>>>>>>>>>>>>>>>>>>>>> hereeee>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      

      
    }
  })
  // console.log(req.body)
})

// ............................................>>>>>>>>>>.........paypal
router.get('/wallet-payment/:id',async(req,res)=>{



})



router.get('/pay/:id',(req,res)=>{
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/paypalorder-success/"+req.params.id,
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": '25.00'
      },
    }]
  }

   
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          console.log("*****orderID******")
          console.log(req.params.id);
          console.log("***********")
              res.redirect(payment.links[i].href);
        }
      }
    }
  });



  router.get('/paypalorder-success/:id', (req,res)=>{
    console.log("****orderId success******");
    orderId=(req.params.id)
    console.log("**********");
    console.log(req.body.orderId);
    console.log(req.params.id);
    console.log("**********paypal   ");
    ;
    userHelpers.getOrderProductQuantity(orderId).then((data) => { 
      data.forEach((element) => {
        userHelpers.updateStockDecrease(element);
      });
    });
   let deletetecart= userHelpers.deleteCartProduct(req.session.user._id)
    userHelpers.changeStatus(req.params.id).then(()=>{
      console.log('into order-sucesss....................?????????????????????????');
      res.render('user/order-success');

    })

    
  })
  
  // const paypalOrderCancel = (req, res) => {
  //   res.send('Cancelled')
  // }
  
  // }
  // )

  

// const paypalOrderSuccess = (req,res)=>{
//   console.log("****orderId success******");
//   console.log(req.params.id);
//   console.log("**********");
//   userHelpers.changePaymentStatus(req.params.id).then(()=>{
//     res.render('users/order-success', {user:true, User:req.session.user});
//   })
// }

const paypalOrderCancel = (req, res) => {
  res.send('Cancelled')
}

}
)

router.get('/paypalorder-success/',async(req,res)=>{
  

  res.redirect('/order-success')
})


router.get('/order-success',verifyLogin, async(req,res)=>{
  req.session.applyCoupon = false

  let deletetecart= userHelpers.deleteCartProduct(req.session.user._id)

  res.render('user/order-success')
})


router.get('/Razorpay-order-success/:id',async(req,res)=>{
 req.session.applyCoupon = false

  console.log("****razorpay orderId success******");

    let details=req.body
 orderId=(req.params.id)

  a=(req.params.id)
  console.log("777777777777777777777777777777777777777");
  console.log(a);
  console.log("**********");
  console.log(req.body.orderId);
  console.log(req.params.id);
  console.log("**********");
  userHelpers.getOrderProductQuantity(orderId).then((data) => {
    data.forEach((element) => {
    userHelpers.updateStockDecrease(element);
    });
    });

  let deletetecart= userHelpers.deleteCartProduct(req.session.user._id)


  res.render('user/order-success',{user:req.session.user})
}),

router.get('/dashboard',verifyLogin,async(req,res)=>{

  res.render('user/dashboard',{user:req.session.user})
}),

router.get('/orders',verifyLogin,async(req,res)=>{
  console.log("HER44444444444444444444444444444E");
  let orders=await userHelpers.getUserOrdersUser(req.session.user._id,)
  // console.log('hereeeeeeeeeeeeeeeeee  ')
  
  // console.log(orders)

  res.render('user/order-history',{user:req.session.user,orders})

})

router.get('/view-order-products/:id',async(req,res)=>{
 orderId=req.params.id

  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log('...................//////////.......................');
  let orderStatus=await productHelpers.orderStatus(orderId)
   console.log('hhasjhgjhasgjdgjaghadllllllllllllllllllllllllll');
   console.log(orderStatus);

   console.log("hgahahhahahahhaha");
  console.log(products);
  console.log('...................//////////.......................');
  res.render('user/view-order-products',{user:req.session.user,orderStatus,orderId,products})
})

router.get('/cancel-order/:id',async(req,res)=>{
  orderId=req.params.id
 let orderCancel= await productHelpers.cancelOrder(req.params.id)

 userHelpers.getOrderProductQuantity(orderId).then((data) => { 
  data.forEach((element) => {
    userHelpers.updateStockIncrease(element);
  });
});

 
  // console.log(orderCancel)
  res.redirect('/orders')


})

router.get('/return-product/:id',async(req,res)=>{
  let returnProduct= await productHelpers.productReturn(req.params.id)

  res.redirect('/orders')
})
//=====================================================Resturn payment

router.get('/add-address/',verifyLogin,async(req,res)=>{
  console.log('adding address');
  res.render('user/add-address',{user:req.session.user})
})

router.post('/add-address/',async(req,res)=>{

  console.log(req.body);
  let addAdress= await userHelpers.addNewAdress(req.body,req.session.user._id)
 
  res.render('/user/address')
})

router.get('/address/',verifyLogin,async(req,res)=>{
  console.log('getAdess>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  
 let address= await userHelpers.getAddress(req.session.user._id)
 console.log(address)
  res.render('user/address',{user:req.session.user,address})
  
}),
////////////////////////////////////////////////////////

router.get('/edit-address/:id',async(req,res)=>{
  // console.log("address/:id',verifyLogin,async(req,res)")
  console.log(req.params.id);
  let address= await userHelpers.getAddressEdit(req.params.id)
 console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log(address);
  res.render('user/edit-address',{address})
})


router.post('/edit-address/:id',async(req,res)=>{
  // console.log("address/:id',verifyLogin,async(req,res)")
 console.log('userID>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.log(req.session.user.id);
  console.log(req.params.id);
  // let address= await userHelpers.getAddressEdit(req.params.id)
  let updateAdress= await userHelpers.updateAddress(req.body,req.params.id,req.session.user._id)
  console.log('userID>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  let address= await userHelpers.getAddressEdit(req.params.id)
  // console.log(updateAdress);
  res.render('user/edit-address',{address})
})


router.get('/remove-address/:id',(req,res)=>{
  console.log('hai');
  let addressId=req.params.id
  console.log(addressId);
  userHelpers.deleteAddress(addressId).then(()=>{
    res.redirect('/address')
  })

})
////////////////////////////////////////////////////////////

router.post('/addToWishList',(req,res)=>{
  
 
 
  if(req.session.loggedIn){
    console.log("wishlist>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
   console.log(req.body.id)
    userHelpers.addToWishList(req.body.id, req.session.user._id).then((response)=>{

       res.json({login:true});

    });
  }else{
    res.json({login:false})
  }
 
})

// router.get('/addToWishList',(req,res)=>{
//   console.log('================= add to wishlist =========')
  
// })

// router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
//   console.log(req.params.id);
//   console.log('haiii');
//   userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
//     console.log('haiii');

//     res.redirect("/")
//   })


// })

router.get('/wishlist/',verifyLogin,async(req,res)=>{
  console.log('kekekekkekkekekke');

  let product=await userHelpers.wishlistProducts(req.session.user._id)

  res.render('user/wishlist',{user:true,product})
})




// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>remove Wishlist>


router.get('/remove-wishlist/:id',verifyLogin,(req,res)=>{
  console.log('remove$$$$$$$$$$$$$$$$')
  productId=req.params.id
  console.log(req.session);

  console.log('haiii product Id');
  console.log(productId.item);
  userHelpers.removeWishList(productId,req.session.user._id).then(()=>{
    console.log('haiii======================wishList');

    res.redirect("/wishlist")
   })


})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>end remove Wishlist>

router.post('/verify-payment',(req,res)=>{
console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKKKKKKKKKKK');
  // console.log(req.body);
  let details = req.body
  console.log(details)
  console.log(details['order[receipt]'])
  userHelpers.verifyPayment(details).then(()=>{
    userHelpers.changeStatus(details['order[receipt]']).then(()=>{
       res.json({status:true})
    })
   

  })
}) 

// router.post('/removeProductWishlist',(req,res)=>{
//   console.log(req.body)
//   let wishList = req.body.wishlistId
//   let product = req.body.productsId

//   userHelpers.removeWishList(product,wishList).then((response)=>{
//     res.json(response)
//   })
// })


router.get('/userprofile/:id',verifyLogin,async(req,res)=>{
  // router.get('/add-profile/',(req,res)=>{
  console.log('profile');
  let profile=await userHelpers.getProfileDetails(req.session.user._id)
  console.log(profile);
   res.render("user/userprofile",{profile})
})

// router.post('/userprofile/:id',verifyLogin,(req,res)=>{

//   console.log('jhjsdcjkdsbkjsbkj');
  
//   userHelpers.updateProfile(req.body,req.session.user._id).then((data)=>{
  
//       res.redirect("/userprofile/:id")

//   })

// })


router.get('/user/invoice/:id',async(req,res)=>{
  console.log(req.params.id)
  const orderId=req.params.id
   let orders=await userHelpers.getInvoice(orderId)
   
   let orderProducts=await userHelpers.getOrderProducts(orderId)
   console.log(orderProducts)
  console.log('invoiceee')
  console.log(orders)
  // let orderStatus=await userHelpers.orderStatus(orderid)

  res.render('user/invoice',{user:req.session.user,orders,orderProducts})
})
////////////////////




router.get("/image",async (req, res, next) => {

    res.render("user/image");



  })

  router.post('/enter-coupon', async(req,res)=>{
    try {
      console.log('LLLLLLLLLLLLLLLLLLLLLLLcouponLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
      console.log(req.body);
      let code = req.body.code;
      let total = await userHelpers.getTotalAmout(req.session.user._id) 
      console.log("total"+total);
      let applyCoupon = await couponHelpers.applyCoupon(req.body, total, req.session.user._id)
     //couponStatus=applyCoupon.couponAppliedStatus
      totalPriceAfterOffer=applyCoupon.totalPriceAfterOffer
      discountPrice=applyCoupon.discountPrice

      
console.log('totalPriceAfterOffer================'+totalPriceAfterOffer);
console.log('discountPrice============='+discountPrice);

      console.log(applyCoupon);
      console.log(total);
      req.session.applyCoupon = applyCoupon
      req.session.applyCoupon.code = code
  
       res.redirect('place-order',)
      // // req.session.applyCoupon.couponAppliedStatus = ''
      
      // // res.json(applyCoupon)
      
    } catch (error) {
      console.log(error)
    }
  })

  router.post('/getSearch',async(req,res)=>{
    
    // let products = await userHelpers.getAllProducts();
    let payload = req.body.payload.trim();
    console.log(payload);
    let search = await userHelpers.searchProduct(payload)
    console.log(search);

  //  //?? Limit search results to 10
    search = search.slice(0, 10);
    console.log('search:........');
    console.log(search);
    res.send({payload: search});
  })

  router.post('/filter',async(req,res)=>{
    

    console.log(req.body)
    // brands= await productHelpers.getBrand()
    // console.log("?????????????????????????????????????????????????????????????");
    // console.log(brands);

    // category= await productHelpers.getcategory()
    // console.log("?????????????????????????????????????????????????????????????");
    // console.log(brands)

    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>filter");
    // console.log(req.body.brand);
    // brand=req.body.brand
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>filter");
    // console.log(brand);
     userHelpers.filterProducts(req.body).then((products)=>{
      console.log('====================================')
      console.log(products)
      console.log('====================================')

      req.session.filterProducts = products;
      filteredProduct=products
      console.log(req.session);
      res.render('user/filterProductlist',{filteredProduct,brands,category})
    })
  })

  

  
router.get('/wallet',verifyLogin,async(req,res)=>{
  let userId=req.session.user._id
  console.log(userId);

let userData= await userHelpers.walletAmountCheckForUser(userId)
console.log('WALLLET BALNCE');
console.log(userData.wallet);
walletBalance=parseInt(userData)

  res.render('user/wallet',{walletBalance}) 
});
  





router.get("/productlist", async function (req, res, next) {
  let user = req.session.user;
  
  console.log(user);
    let cartCount=0
    if (req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id);
      req.session.user.cartCount=cartCount   
    }

    let wishListCount=0
    if (req.session.user){
      wishListCount=await userHelpers.getWishlistCount(req.session.user._id);
      req.session.user.wishListCount=wishListCount   
    }

    
      brands= await productHelpers.getBrand()
        console.log("?????????????????????????????????????????????????????????????");
        console.log(brands);

        category= await productHelpers.getcategory()
        console.log("?????????????????????????????????????????????????????????????");
        console.log(brands)

console.log("1111111111111111111111111111111111111111111");
    console.log(req.query.page);
  const page = parseInt(req.query.page) 

    const limit =10
    const startIndex = parseInt(page - 1) * limit
    const endIndex = page * limit
    const results = {}
    console.log('######product##########');
    console.log(startIndex,endIndex);
  
      let productsCount= await productHelpers.getProductsCount()
      console.log(productsCount);
      
    if (endIndex < productsCount) {
      results.next = {
        page: page + 1,
        limit: limit,
       
      }
      console.log('???????????????????????????????????????????????hahahahhah');
      console.log(page,limit);
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    
    } 
    
    console.log("hajajajjajakakkakakakakkalalalalalllllllalallllllllllllllllllllllllllllll");
    console.log(results.previous);
   console.log("5555555555555555555555555555555555");
    console.log(limit,startIndex);

  let products=await productHelpers.getuserAllProductsList(limit,startIndex)
   
  
  console.log(products)

    console.log('################');

  // products = await productHelpers.getPaginatedResult(limit,startIndex) 
    results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
    results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
    results.currentPage =page.toString()
    console.log(results);
    console.log(results.currentPage);
   

    res.render("user/product-list", { products,results, brands,category,user,cartCount,wishListCount});
  
});





// router.get('/productSample',(req,res)=>{
//   res.render('user/productSample')
// })

//??  pagination front page products

// router.get("/", async function (req, res, next) {
//   let user = req.session.user;
  
//   console.log(user);
//     let cartCount=0
//     if (req.session.user){
//       cartCount=await userHelpers.getCartCount(req.session.user._id);
//       req.session.user.cartCount=cartCount   
//     }

//     let wishListCount=0
//     if (req.session.user){
//       wishListCount=await userHelpers.getWishlistCount(req.session.user._id);
//       req.session.user.wishListCount=wishListCount   
//     }

//   //   console.log('getting products');
//   //  let products= await productHelpers.getuserAllProducts().then((products) => {
//   //   console.log(products)
//   //   console.log('hello{{{{{{{{{{{{{{{{{>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'.red .bgYellow); // outputs green text

  
//   const page = parseInt(req.query.page) 
//     const limit =12
//     const startIndex = parseInt(page - 1) * limit
//     const endIndex = page * limit
//     const results = {}
//     console.log('################');
//     console.log(startIndex,endIndex);
  
//       let productsCount= await productHelpers.getProductsCount()
//       console.log(productsCount);
      
//     if (endIndex < productsCount) {
//       results.next = {
//         page: page + 1,
//         limit: limit
//       }
//     }
    
//     if (startIndex > 0) {
//       results.previous = {
//         page: page - 1,
//         limit: limit
//       }
//     } 

//   productHelpers.getAllProducts(limit,startIndex).then((products)=>{
//     console.log(products)

//     console.log('################');

//   // products = await productHelpers.getPaginatedResult(limit,startIndex) 
//     results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
//     results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
//     results.currentPage =page.toString()
//     console.log(results);
//     console.log(results.currentPage);
   

//     res.render("user/view-products", { products,results, user,cartCount,wishListCount});
//   });
// });


// router.get('/products', async function(req, res, next) {


//   const page = parseInt(req.query.page) 
//     const limit = 7
//     const startIndex = parseInt(page - 1) * limit
//     const endIndex = page * limit
//     const results = {}
//     console.log('################');
//     console.log(startIndex,endIndex);
  
//       let productsCount= await productHelpers.getProductsCount()
//       console.log(productsCount);
      
//     if (endIndex < productsCount) {
//       results.next = {
//         page: page + 1,
//         limit: limit
//       }
//     }
    
//     if (startIndex > 0) {
//       results.previous = {
//         page: page - 1,
//         limit: limit
//       }
//     } 

//   productHelpers.getAllProducts(limit,startIndex).then((products)=>{
//     console.log(products)

//     console.log('################');
//   // products = await productHelpers.getPaginatedResult(limit,startIndex) 
//     results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
//     results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
//     results.currentPage =page.toString()
//     console.log(results);
   
//     res.render('admin/view-products', { admin:true ,products,results})

//   })


 
// });

// router.get('/productlist',verifyLogin,async(req,res)=>{

// console.log('to productList');
// let products= await productHelpers.getuserAllProducts()  
//   console.log(products)
//   console.log('hello{{{{{{{{{{{{{{{{{>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'.red .bgYellow); // outputs green text

  





// brands= await productHelpers.getBrand()
//   console.log("?????????????????????????????????????????????????????????????");
//   console.log(brands);

//   category= await productHelpers.getcategory()
//   console.log("?????????????????????????????????????????????????????????????");
//   console.log(brands)



//     res.render("user/product-list",{products,brands,category})
// })

module.exports = router;
 