var express = require('express');
const { upload } = require('../public/javascripts/fileUpload')
const { getProductDetails } = require('../helpers/product-helpers');
var router = express.Router();

require('dotenv').config()
// const fileStorageEngine=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'./public/product-image')
//   },
//   filename:(req,file,cb)=>{
//     cb(null,date.now()+'--'+file.originalname)
//   },

// });

// const upload=multer({storage:fileStorageEngine}) 

const adminHelpers=require('../helpers/admin-helpers');
 var productHelpers=require('../helpers/product-helpers');
const { Router, response } = require('express');
const { ORDER_COLLECTIOIN } = require('../config/collections');
const userHelpers = require('../helpers/user-helpers');


 const credential={
  email:process.env.ADMIN_EMAIL,
  password:process.env.ADMIN_PASSWORD,
}
// var loggedOut = false;
// var invalidId = false;
//log in user


/* GET users listing. */

router.get('/', verifyAdmin,async(req,res)=>{
  // let response = await adminHelpers.getTotalSaleGraph()
  //   let {dailySales,monthlySales,yearlySales} = response;
  //   let salesReport = await adminHelpers.getSalesReport();
  //   let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
  //   console.log(" hkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhkhkkkk");
  //   console.log(weeklyReport, monthlyReport, yearlyReport);
  // res.render('admin/chart' ,{admin:true, dailySales, monthlySales, yearlySales})
  console.log("hahahhahahhahahahhahahahhahahahhahahahahahahhahahahhaha");
  
  let response = await adminHelpers.getTotalSaleGraph()
    let {dailySales,monthlySales,yearlySales} = response;

    let salesReport = await adminHelpers.getSalesReport();
    let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
    console.log(" hkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhkhkkkk");
    // console.log(weeklyReport, monthlyReport, yearlyReport);


    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>...enter get PAymentWiserGraph");
    
    let paymentDetails=await adminHelpers.getPaymentWiseGraph();
    console.log("<<<<<<<<<<<<<<<<<<GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(paymentDetails);
    
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>...enter CATEGORY VICE selling");
    let categoryWiseSales=await adminHelpers.getCategoryWiseSales();
    // console.log((categoryWiseSales));
    // let date = new Date()
    // date= date.getDate()
    //  console.log(date)

   let date= new Date().toISOString().slice(0, 10)

    

     

     

    let dailySalesTotal=await adminHelpers.getDailySalesTotal(date)
    // let monthlyRevenue=await adminHelpers.getMonthlyRevenue()
    total=dailySalesTotal.total
    console.log(total);


    
  res.render('admin/dash' ,{admin:true, dailySales, monthlySales, yearlySales,weeklyReport, monthlyReport, yearlyReport,paymentDetails,dailySalesTotal})

  
  // res.render('admin/dash',{admin:true})

  });
  
router.get('/report', verifyAdmin,async(req,res)=>{
  console.log("hahahhahahhahahahhahahahhahahahhahahahahahahhahahahhaha");
  
  let response = await adminHelpers.getTotalSaleGraph()
    let {dailySales,monthlySales,yearlySales} = response;
    console.log(dailySales,monthlySales,yearlySales);

    let salesReport = await adminHelpers.getSalesReport();
    let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
    console.log(" hkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhkhkkkk");
     console.log(weeklyReport, monthlyReport, yearlyReport);
  res.render('admin/report' ,{admin:true,weeklyReport, monthlyReport, yearlyReport,dailySales,monthlySales,yearlySales})
                                      

  });


 


router.get('/products', async function(req, res, next) {


  const page = parseInt(req.query.page) 
    const limit =7
    const startIndex = parseInt(page - 1) * limit
    const endIndex = page * limit
    const results = {}
    console.log('################');
    console.log(startIndex,endIndex);
  
      let productsCount= await productHelpers.getProductsCount()
      console.log("7777777777777777777777777777777777777777777777777");
      console.log(productsCount);
      
    if (endIndex < productsCount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }

      console.log("stattIndex");
      console.log(startIndex);
    } 

  productHelpers.getAllProducts(limit,startIndex).then((products)=>{
    console.log(products)

    console.log('################');
  // products = await productHelpers.getPaginatedResult(limit,startIndex) 
    results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
    results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
    results.currentPage =page.toString()
    console.log(results);
   
    res.render('admin/view-products', { admin:true ,products,results})

  })


 
});

// router.get('/orders',async(req,res)=>{
//   console.log('haiiiiiii page-order')
//   const page = parseInt(req.query.page) 
//     const limit =7
//     const startIndex = parseInt(page - 1) * limit
//     const endIndex = page * limit
//     const results = {}
//     console.log('################');
//     console.log(startIndex,endIndex);
  
//       let ordersCount= await productHelpers.getOrdersCount()
//       console.log(ordersCount);
      
//     if (endIndex < ordersCount) {
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
//     productHelpers.getAllOrders(limit,startIndex).then((orders)=>{
//       console.log(orders)
  
//       console.log('################');
//       results.pageCount =Math.ceil(parseInt(ordersCount)/parseInt(limit)).toString() 
//       results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
//       results.currentPage =page.toString()
//       console.log(results);
     
    
//     //  let orders=await productHelpers.allOrders().then()
//   //  console.log(orders)
//   res.render('admin/orders',{admin:true,orders,results})

 
//   })

// });


router.get('/orders',async(req,res)=>{
 
  const page = parseInt(req.query.page) 
    const limit =7
    const startIndex = parseInt(page - 1) * limit
    const endIndex = page * limit
    const results = {}
    console.log('################');
    console.log(startIndex,endIndex);
    
        let ordersCount= await productHelpers.getOrdersCount()
        console.log(ordersCount);
        
      if (endIndex < ordersCount) {
        console.log(page);
        results.next = {
          page: page + 1,
          limit:7
        }
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(page);
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit:7
        }
      } 
 let orders=await productHelpers.getAllOrders(limit,startIndex).then()
 console.log(orders)
 console.log(orders)
  
       console.log('################');
       results.pageCount =Math.ceil(parseInt(ordersCount)/parseInt(limit)).toString() 
       results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
       results.currentPage =page.toString()
       console.log(results);
       console.log("jjajajajjajaja");
      
     
     //  let orders=await productHelpers.allOrders().then()
   //  console.log(orders)
   res.render('admin/orders',{admin:true,orders,results})
 
  
   
 

})

  router.get('/view-order-products/:id',async(req,res)=>{
    console.log("....>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>......>>>>>>>>>>.>.....>.>>.>>");
   orderId=req.params.id
    let products=await userHelpers.getOrderProducts(req.params.id)
    console.log('...................//////////.......................');
    console.log(products);
    console.log('...................//////////.......................');
  res.render('admin/view-order-products',{admin:true,products})


 })






router.post('/add-products',upload.array('image'),(req,res)=>{

  const files = req.files

    const file = files.map((file)=>{
        return file
    })
  
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName

 
  productHelpers.addProducts(product).then(data=>{
   


      res.redirect("/admin/add-products")
    
   
   })



    // res.redirect('/admin/add-products')
  })

;
// ---------------------add brand-------------------------------------------------

router.get('/add-brand',verifyAdmin,function(req,res,next){
  console.log('going to add brands')
  res.render('admin/add-brand',{admin:true})
});



router.post('/add-brand',verifyAdmin,(req,res)=>{
  console.log('adding add brand............')
  console.log(req.body);

  productHelpers.addBrand(req.body).then(()=>{
    res.redirect('/admin/add-brand')

  })

});

router.get('/view-brand',verifyAdmin,function(req,res,next){
  console.log('going to add Brand page')
  productHelpers.getBrand().then((brand)=>{
    res.render('admin/view-brand',{admin:true, brand})

  })
 
});
router.get('/delete-brand/:id',verifyAdmin,function(req,res,next){
  console.log('going to delete===================== Brand page')
  let brandId=req.params.id
  console.log(brandId);
  productHelpers.deleteBrand(brandId).then(()=>{
    res.redirect('/admin/view-brand',{admin:true})
  })

});

router.get('/coupon-generator/',verifyAdmin,async(req,res)=>{

  // productHelpers.getCoupon().then((cou)=>{
    

  // })

  let coupon = await  productHelpers.getCoupon()


  res.render('admin/coupon-generator',{admin:true,coupon})

});

router.post('/coupon-generator/',verifyAdmin,(req,res)=>{
console.log('adding coupon');
productHelpers.addCoupon(req.body).then(()=>{
  res.redirect('/admin/coupon-generator')

})

});

router.get('/delete-coupon/:id',verifyAdmin,async(req,res)=>{
console.log('deleting coupon');
let couponId=req.params.id;

productHelpers.deleteCoupon(couponId).then(()=>{

  res.redirect('/admin/coupon-generator')
}) 


});

 router.post('/add-offer/',async(req,res)=>{
  console.log('addin catogory offers');
  console.log(req.body);
catagoryOffer=req.body
// console.log(catagoryId);
  productHelpers.addCategoryOffer(catagoryOffer).then(()=>{
    res.redirect('/admin/view-category') 
  })
 })






 
// ---------------------add catogory-------------------------------------------------

router.get('/add-category',verifyAdmin,function(req,res,next){
  console.log('going to add catogory page')
  res.render('admin/add-category',{admin:true,})
})

router.post('/add-category',verifyAdmin,(req,res)=>{
    console.log('***************............')
    console.log(req.body);
    console.log("*******************************");
    productHelpers.addCategory(req.body).then(()=>{
      res.redirect('/admin/view-category')

    })

})




router.get('/view-category',verifyAdmin,function(req,res,next){
  console.log('going to add catogory page')
  productHelpers.getCategory().then((category)=>{
    res.render('admin/view-category',{admin:true, category})

  })
 
})
 
router.get('/delete-category/:id',(req,res)=>{
  console.log('hai');
  let catId=req.params.id
  console.log(catId);
  productHelpers.deleteCategory(catId).then(()=>{
    res.redirect('/admin/view-category')
  })

})




// ---------------------------  add product-------------------------------------------
router.get('/add-products',verifyAdmin,async function(req, res, next) {
  console.log("going to Add products")
  let category=await productHelpers.getCategory()
  let brand=await productHelpers.getBrand()

  res.render('admin/add-products',{admin:true,category,brand})
})  




 
  router.get('/delete-product/:id',(req,res)=>{
    console.log('hai');
    let proId=req.params.id
    console.log(proId);
    productHelpers.deleteProduct(proId).then(()=>{
      res.redirect('/admin')
    })

  })

  
  router.get('/edit-product/:id',verifyAdmin,async(req,res)=>{

    let category=await productHelpers.getCategory()
    let brand=await productHelpers.getBrand()
    let product=await productHelpers.getProductDetails(req.params.id)

    res.render('admin/edit-product',{admin:true,product,brand,category})
   

  })


    
  router.post('/edit-product/:id',upload.array('image'),verifyAdmin,(req,res)=>{
    let id=req.params.id
    const files = req.files

    const file = files.map((file)=>{
        return file
    })
  
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName
    productHelpers.updateProduct(req.params.id,product).then((data)=>{
    
        res.redirect('/admin')
  
    })

  })
  

  


  router.get('/login',(req,res)=>{
    console.log('hiiiiiiiiiiiii')
    res.render('admin/login')
    
  }),
  router.post('/login',(req,res)=>{
    console.log(req.body);
    
    if(req.body.email===credential.email && req.body.password===credential.password){
      req.session.admin = req.body
      req.session.adminLoggedIn=true
      console.log(req.session);
      res.redirect('/admin')

    }  
    
  })
  
router.get('/logout',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin')
})


function verifyAdmin(req,res,next){
    if(req.session.adminLoggedIn==true){
      return next()
    }
    res.redirect('/admin/login')


  }



  // useredit
router.get('/view-user',verifyAdmin,async(req,res)=>{

  let userData=await userHelpers.getUserDetails(req.params.id)
  res.render('admin/view-user',{admin:true,userData})

})


router.get('/block-user/:id',verifyAdmin, (req, res) => {
  let userId = req.params.id;
  adminHelpers.blockUser(userId).then(response => {
    if (response) {
      req.session.user = null;
      req.session.userLoggedIn = false;
      res.redirect('/admin/view-user')
    }
  })
})

router.get('/unblock-user/:id',verifyAdmin, (req, res) => {
  let userId = req.params.id;
  adminHelpers.unblockUser(userId).then(response => {
    if (response) {
      res.redirect('/admin/view-user')
    }
  })
})



// router.get('/orders',async(req,res)=>{
//   console.log('haiiiiiii')
  
//  let orders=await productHelpers.allOrders().then()
//  console.log(orders)
//  res.render('admin/orders',{admin:true,orders})

 
// })
router.post('/update-order-products',async(req,res)=>{
  console.log(req.body)
let orderStatus=await productHelpers.orderStatusUpdate(req.body).then(response)
console.log(orderStatus)
  res.redirect('/admin/orders')
});

router.post('/cancel-order-products',async(req,res)=>{
  console.log(req.body)
let orderStatus=await productHelpers.orderStatusCancell(req.body).then(response)
console.log(orderStatus)
  res.redirect('/admin/orders')
});


router.get('/dashboard',verifyAdmin, async(req,res)=>{
  
  let response = await adminHelpers.getTotalSaleGraph()
    let {dailySales,monthlySales,yearlySales} = response;
    let salesReport = await adminHelpers.getSalesReport();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>...enter get PAymentWiserGraph");
    let getPaymentWiseGraph=await adminHelpers.getPaymentWiseGraph();
    console.log("<<<<<<<<<<<<<<<<<<GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(getPaymentWiseGraph);

    // console.table(salesReport);
    // let {weeklyReport, monthlyReport, yearlyReport} = salesReport
    // console.log(',.,.......................xxxxxxxxxxxxxxxxxxxxxxxxxxXXXXXXXXXXXXXXXXxxxxxxxxxxxxxxxxxxxx................,,,,,,,,,,,,,,,,,,,,,,,,,,,');
    // console.table(weeklyReport);
    // console.log(',.,...................vvvvvvvvvvvvvvv  ...,,,,,,,,,,,,,,,,,,,,,,,,,,,');


    // console.log(weeklyReport, monthlyReport, yearlyReport);
  res.render('admin/dashboard' ,{admin:true, dailySales, monthlySales, yearlySales, weeklyReport, monthlyReport, yearlyReport,getPaymentWiseGraph})
}),

router.get('/return-payment/:orderId/:userId',async(req,res)=>{
  // console.log(req.);
  orderId=req.params.orderId
  userId=req.params.userId
  console.log(',.,...................vvvvvvvvvvvvvvv  ...,,,,,,,,,,,,,,,,,,,,,,,,,,,');
  console.log(orderId);
  console.log(userId);
  let PaymentMethod=await productHelpers.returnPayment(orderId,userId)
  let orderStatus=await productHelpers.refundOrderStatusUpdate(orderId,userId).then(response)
  console.log("refund completed");
  res.redirect('/admin/orders')



}),

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
   res.render('admin/view-order-products',{admin:true,orderStatus,orderId,products})
 })
 

 
router.get('/dashcopy', verifyAdmin,async(req,res)=>{
  // let response = await adminHelpers.getTotalSaleGraph()
  //   let {dailySales,monthlySales,yearlySales} = response;
  //   let salesReport = await adminHelpers.getSalesReport();
  //   let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
  //   console.log(" hkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhkhkkkk");
  //   console.log(weeklyReport, monthlyReport, yearlyReport);
  // res.render('admin/chart' ,{admin:true, dailySales, monthlySales, yearlySales})
  console.log("hahahhahahhahahahhahahahhahahahhahahahahahahhahahahhaha");
  
  let response = await adminHelpers.getTotalSaleGraph()
    let {dailySales,monthlySales,yearlySales} = response;

    let salesReport = await adminHelpers.getSalesReport();
    let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
    console.log(" hkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkhhkhkkkk");

    
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>...enter get PAymentWiserGraph");
    let paymentDetails=await adminHelpers.getPaymentWiseGraph();
    console.log("<<<<<<<<<<<<<<<<<<GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(paymentDetails);
    // console.log(weeklyReport, monthlyReport, yearlyReport);
    // console.log(dailySales, monthlySales, yearlySales,);
  res.render('admin/copy' ,{admin:true, dailySales, monthlySales, yearlySales,paymentDetails,weeklyReport, monthlyReport, yearlyReport})

  
  // res.render('admin/dash',{admin:true})

  });



module.exports = router;
