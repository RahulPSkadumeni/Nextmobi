userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    
  let order=req.body
    
if(order['payment-method']=='WALLET'){

userHelpers.walletAmountCheck(req.body.userId,totalPrice).then((response)=>{

if(response.walletAmount){

 userHelpers.walletAmountReduce(req.body.userId,totalPrice).then((data)=>{})

 userHelpers.deleteCart(req.body.userId).then((data)=>{})

 userHelpers.changeOrderStatusOnline(orderId).then((data)=>{})

 userHelpers.getOrderProductQuantity(orderId).then((data) => {
   data.forEach((element) => {
     userHelpers.updateStockDecrease(element);
   });

 });
 

 res.json({wallet:true,amount:true})
}else{
 res.json({wallet:true,amount:false})

}

})



} else if(order['payment-method']=='COD'){

userHelpers.deleteCart(order.userId).then((data)=>{})

userHelpers.getOrderProductQuantity(orderId).then((data) => {
data.forEach((element) => {
 userHelpers.updateStockDecrease(element);
});

});

   res.json({ codSuccess: true });


  }else if(order['payment-method']=='RAZORPAY'){
    userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{

     response.userId=order.userId
     response.razorpay=true
       res.json(response)
    }).catch((err)=>{
     console.log(err);
    })  
  }else{
   res.json({order:orderId,user:order.userId,total:paypaltotalPrice})
  }

}); 

}

});


//----------------------------------razorPay----------------------------------------------------------------------

router.post('/verify-payment',async(req,res)=>{

let details=req.body
console.log('details');
console.log(details);

userHelpers.verifyRazorPayPayment(details.payment).then(()=>{

userHelpers.changeOrderStatusOnline(details.order.receipt).then((data)=>{})

userHelpers.getOrderProductQuantity(details.order.receipt).then((data) => {
data.forEach((element) => {
userHelpers.updateStockDecrease(element);
});
});

userHelpers.getuserDetails(req.session.user._id).then((user)=>{
if(user.coopon){

offerHelper.cooponObjectRemovelUser(user._id).then((data)=>{
})
.catch((err)=>{console.log(err);})

}

})



userHelpers.deleteCart(details.order.userId).then((data)=>{})
console.log('payment-success');
res.json({status:true})

}).catch((err)=>{
console.log('payment-failed');
console.log(err);
res.json({status:'payment-failed'})
})


})

//----------------------------------Paypal----------------------------------------------------------------------

router.post('/pay', (req, res) => {
console.log(req.body);
console.log(paypalTotal);


let {total,user,order}=req.body
paypalTotal=total
console.log(paypalTotal);


const create_payment_json = {
"intent": "sale",
"payer": { 
 "payment_method": "paypal"
},
"redirect_urls": {
 "return_url": "http://localhost:3000/success?order="+ order +'&?user='+ user,
 "cancel_url": "http://localhost:3000/cancel"
},
"transactions": [{
 "amount": {
     "currency": "USD",
     "total":paypalTotal
 },
 "description": "Hat for the best team ever"
}] 
};

paypal.payment.create(create_payment_json, function (error, payment) {
if (error) {
throw error;
} else {
for(let i = 0;i < payment.links.length;i++){
 if(payment.links[i].rel === 'approval_url'){
   res.json(payment.links[i].href);
 }
}
}  
});  

});



router.get('/success',async (req, res) => {
let  listCount=await wishlistCartManagement.wishListCount(req.session.user._id)

let   cartCount = await userHelpers.getCartCount(req.session.user._id);
let userId=req.query.user
console.log(paypalTotal);
let orderId=req.query.order
const payerId = req.query.PayerID;
const paymentId = req.query.paymentId;

const execute_payment_json = { 
"payer_id": payerId, 
"transactions": [{
 "amount": {
     "currency": "USD",
     "total":paypalTotal
 }
}]
};

paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
if (error) {
 console.log(error.response);
 throw error;
} else {
 console.log(JSON.stringify(payment));

 userHelpers.changeOrderStatusOnline(orderId).then((data)=>{})
 userHelpers.getOrderProductQuantity(orderId).then((data) => { 
   data.forEach((element) => {
     userHelpers.updateStockDecrease(element);
   });
 });

 userHelpers.getuserDetails(req.session.user._id).then((user)=>{
   if(user.coopon){

     offerHelper.cooponObjectRemovelUser(user._id).then((data)=>{
     })
     .catch((err)=>{console.log(err);})
 
   }

  })


 userHelpers.deleteCart(req.session.user._id).then((data)=>{})  
  res.render('user/order-placed', {noheader: true,cartCount,listCount,
  userLogged:true}) 
   
 
}
});
});  




router.get('/cancel', (req, res) => res.send('Cancelled'));

router.get("/order-placed", async(req, res) => {
let  listCount=await wishlistCartManagement.wishListCount(req.session.user._id)

let   cartCount = await userHelpers.getCartCount(req.session.user._id);
res.render("user/order-placed", {
noheader: true,
userLogged:true,
user: req.session.user,
cartCount,
listCount
});
});

router.get("/orders", verifyLogin, async (req, res) => {
let  listCount=await wishlistCartManagement.wishListCount(req.session.user._id)

let   cartCount = await userHelpers.getCartCount(req.session.user._id);
let orders = await userHelpers.getUserOders(req.session.user._id);
res.render("user/orders", {
noheader: true,
userLogged:true,
user: req.session.user,
orders,
listCount,
cartCount
});
});

router.get("/view-order-products/:id", verifyLogin, async (req, res) => {
req.session.user.orderProdId = req.params.id;
res.redirect("/view-order-products");
});

router.get("/view-order-products",verifyLogin,async (req, res) => {
let  listCount=await wishlistCartManagement.wishListCount(req.session.user._id)

let   cartCount = await userHelpers.getCartCount(req.session.user._id);
let orderProdId= req.session.user.orderProdId
let products = await userHelpers.getOrderProducts(orderProdId);

let order=await userHelpers.getUserOrder(orderProdId)
res.render("user/order-products", { noheader: true, userLogged:true, products,cartCount,listCount, orderProdId,order});
});


router.get("/view-orderInvoice/:id",(req,res)=>{


req.session.user.id=req.params.id

res.redirect('/view-orderInvoice2')

})


router.get("/view-orderInvoice2",async(req,res)=>{
console.log(req.session.id);
console.log(req.session.id); 
console.log(req.session.id); 
let products = await userHelpers.getOrderProducts(req.session.user.id);
let order=await userHelpers.getUserOrder(req.session.user.id)

console.log("order");
console.log(products);
console.log("order");
res.render('user/invoice', { noheader: true, userLogged:true,products,order})

})



router.post("/order-cancel", (req, res) => {
userHelpers.orderCancel(req.body.orderId).then((response) => {
userHelpers.getOrderProductQuantity(req.body.orderId).then((data) => {
data.forEach((element) => {
 userHelpers.updateStockIncrease(element);
});
});
res.json({ status: true });
});
});

router.post("/order-return", (req, res) => {
userHelpers.orderReturn(req.body.orderId).then((response) => {
userHelpers.getOrderProductQuantity(req.body.orderId).then((data) => {
data.forEach((element) => {
 userHelpers.updateStockIncrease(element);
});
}); 
res.json({ status: true });
});
});


router.post('/return-order',(req,res)=>{

userHelpers.orderReturn(req.body).then((data)=>{})
console.log('return');
console.log('return');
console.log('return');
res.redirect("/orders")

})