var db=require('../config/connection');
var collection=require('../config/collections.js');
const { response } = require('express');
const { COUPON_COLLECTION } = require('../config/collections.js');
const { ObjectId } = require('mongodb');
var objectId=require("mongodb").ObjectId
module.exports={
    // addProducts:(product,callback)=>{
    //     console.log(product);
    //     db.get().collection('product').insertOne(product).then((data)=>{
    //             callback(data)
    //     }) 

    // },

    addProducts: (product)=>{
        product.brand = objectId(product.brand)
        product.category = objectId(product.category)
        product.stock=parseInt(product.stock)
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(product.brand)})
            console.log(brand)
            product.brandName = brand.brand
            let addPro = await db.get().collection('product').insertOne(product);
            
            console.log(addPro);
            resolve(addPro);
            // let 

        })
        console.log(addPro)
    },
     
    getAllProducts:(limit,startIndex)=>{
        console.log('entered')

        console.log(limit);
        console.log(startIndex);


    return new Promise(async(resolve,reject)=>{
        try {
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find()
            .limit(limit).skip(parseInt(startIndex))
                .toArray()
                console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[");
                console.log(products);
                resolve(products)
            } catch (error) {
                console.log(error);
            }
        })
    },

    // getuserAllProductsLists:(limit,startIndex)=>{
    //     console.log('entered')

    //     console.log(limit);
    // //   let limi=limit
    // //   let startInde=startIndex
    //     console.log('limit entered');
    //     console.log(startIndex);
      

    //     console.log(startIndex);


    // return new Promise(async(resolve,reject)=>{
    //     try {
    //     let products=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            
    //           {
    //                     $lookup: {
    //                         from:'brand',
    //                         localField: 'brand',
    //                         foreignField: '_id',
    //                         as: 'brand'
    //                     }
    //                 },
    //                 {
    //                     $unwind:"$brand"
    //                 },
    //                 {
    //                     $lookup :{
    //                         from :'category',
    //                         localField : 'category',
    //                         foreignField : '_id',
    //                         as : 'category'
    //                     }
    //                 },
    //                 {
    //                     $unwind: "$category"
    //                 },
    
    //                 {
    //                     $addFields: {
    //                          // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
    //                         discountOff: {$cond: { if: {$gt : [{$toInt: "$discount"},{$toInt:"$category.offer"}]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
    //                     }
    //                 },
    //                 {
    //                     $addFields :{
    //                         discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
    //                     }
    //                 },
    //                 {
    //                     $addFields : {
    //                         priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
    //                     }
    //                 },
                   
                 

    //             ])
    //             .toArray()
    //             console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[kheraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    //             console.log(products);
    //             console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    //             resolve(products)
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })
    // },
    

    getuserAllProductsList:(limit,startIndex)=>{
        console.log('entered')

        console.log(limit);
    //   let limi=limit
    //   let startInde=startIndex
        console.log('limit entered');
        console.log(startIndex);
      

        console.log(startIndex);


    return new Promise(async(resolve,reject)=>{
        try {
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            
              {
                        $lookup: {
                            from:'brand',
                            localField: 'brand',
                            foreignField: '_id',
                            as: 'brand'
                        }
                    },
                    {
                        $unwind:"$brand"
                    },
                    {
                        $lookup :{
                            from :'category',
                            localField : 'category',
                            foreignField : '_id',
                            as : 'category'
                        }
                    },
                    {
                        $unwind: "$category"
                    },
    
                    {
                        $addFields: {
                             // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
                            discountOff: {$cond: { if: {$gt : [{$toInt: "$discount"},{$toInt:"$category.offer"}]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                        }
                    },
                    {
                        $addFields :{
                            discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
                        }
                    },
                    {
                        $addFields : {
                            priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
                        }
                    },
                   
                    {
                        $skip: startIndex
                    },
                    {
                        $limit: limit
                    }
                  

                ])
                .toArray()
                console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[kheraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                console.log(products);
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                resolve(products)
            } catch (error) {
                console.log(error);
            }
        })
    },
    
    




    getuserAllProducts:(limit,startIndex)=>{
        console.log('entered')

        console.log(limit);
    //   let limi=limit
    //   let startInde=startIndex
        console.log('limit entered');
        console.log(startIndex);


    return new Promise(async(resolve,reject)=>{
        try {
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            
              {
                        $lookup: {
                            from:'brand',
                            localField: 'brand',
                            foreignField: '_id',
                            as: 'brand'
                        }
                    },
                    {
                        $unwind:"$brand"
                    },
                    {
                        $lookup :{
                            from :'category',
                            localField : 'category',
                            foreignField : '_id',
                            as : 'category'
                        }
                    },
                    {
                        $unwind: "$category"
                    },
    
                    {
                        $addFields: {
                             // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
                            discountOff: {$cond: { if: {$gt : [{$toInt: "$discount"},{$toInt:"$category.offer"}]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                        }
                    },
                    {
                        $addFields :{
                            discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
                        }
                    },
                    {
                        $addFields : {
                            priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
                        }
                    },
                    {
                        $limit: 12
                    },
                    // {
                    //     $skip: startIndex
                    // }
                  

                ])
                .toArray()
                console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[kheraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                console.log(products);
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                resolve(products)
            } catch (error) {
                console.log(error);
            }
        })
    },
    
    
    deleteProduct:(productId)=>{
       // console.log("haiii");
        return new Promise(async (resolve,reject)=>{
         let deteteProduct= await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)})
        //    console.log(response)
            resolve(deteteProduct)
           
        })
    },

//      getProductDetails:(productId)=>{
//         console.log("this" + productId);
//      return new Promise(async(resolve,reject)=>{
//         let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(productId)})
           
//         if(product){


            
//         }
    
//         resolve(product)  
//         })

       


//   },

  getProductDetails:(productId)=>{
    console.log("this" + productId);
 return new Promise(async(resolve,reject)=>{
    let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{_id:objectId(productId)}

            },
        {
                  $lookup: {
                      from:'brand',
                      localField: 'brand',
                      foreignField: '_id',
                      as: 'brand'
                  }
              },
              {
                  $unwind:"$brand"
              },
              {
                  $lookup :{
                      from :'category',
                      localField : 'category',
                      foreignField : '_id',
                      as : 'category'
                  }
              },
              {
                  $unwind: "$category"
              },

              {
                  $addFields: {
                       // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
                      discountOff: {$cond: { if: {$gt : [{$toInt: "$discount"},{$toInt:"$category.offer"}]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                  }
              },
              {
                  $addFields :{
                      discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
                  }
              },
              {
                  $addFields : {
                      priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
                  }
              },
             
             
            

          ])
          .toArray()
          console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[kheraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
          console.log(product);
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        




       
   

    resolve(product[0])  
    })

   


},

  getProductsCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let count=await db.get().collection(collection.PRODUCT_COLLECTION).count()
        
        console.log("?????????????????????????????????????????????????????????????????????");
        console.log(count)

        resolve(count)


    })
   
  }
,
getOrdersCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let count=await db.get().collection(collection.ORDER_COLLECTIOIN).count()
        
        console.log("?????????????????????????????????????????????????????????????????????order-count");
        console.log(count)

        resolve(count)


    })
   
  }
,

getAllOrders:(limit,startIndex)=>{
    console.log('entered')

    console.log("jjjjjjjjjjjjjjjjjjj"+limit+" "+startIndex);
    // console.log(startIndex);
    //  limit=parseInt(limit)
    //  startIndex=parseInt(startIndex)

return new Promise(async(resolve,reject)=>{
    try {
    let orders=await db.get().collection(collection.ORDER_COLLECTIOIN).find().sort('-createdAt')
        .limit(limit).skip(parseInt(startIndex))
            .toArray()
            console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[");
            console.log(orders);
            resolve(orders)

    // let orders=await db.get().collection(collection.ORDER_COLLECTIOIN).aggregate([
    //     {
    //         $lookup:{
    //             from:'address',
    //             localField:'addressId',
    //             foreignField:'_id',
    //             as:'address'
    //         }

    //     },
    //     {

    //         $unwind:'$address'
    //     },
    //     {
    //         $limit: limit
    //     },
    //     {
    //         $skip: startIndex
    //     },
    //     {
    //         $sort:{'date':-1}
    //     }

    // ]).toArray()
            console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[");
            console.log(orders);
            resolve(orders)
        } catch (error) {
            console.log(error);
        }
    })
},


getPaginatedProducts: (limit,startIndex) => {
    return new Promise(async (resolve,reject) => {
        let product = await db.get().collection(collection.PRODUCTS_COLLECTION).find().limit(limit).skip(startIndex).toArray();
        console.log('product::::::::::');
        console.log(product);
        resolve(product);


    })
},
//!paginated order

getPaginatedorders: (limit,startIndex) => {
    return new Promise(async (resolve,reject) => {
        let product = await db.get().collection(collection.ORDER_COLLECTIOIN).find().limit(limit).skip(startIndex).toArray();
        console.log('product::::::::::');
        console.log(product);
        resolve(product);


    })
},


// ! chxkvckj nshv hjcsvhcs ka
// getAllProducts : ()=>{
//     return new Promise(async(resolve, reject)=>{
//         try {
            
//             let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
//                 {
//                     $lookup: {
//                         from: 'brand',
//                         localField: 'brand',
//                         foreignField: '_id',
//                         as: 'brandDetails'
//                     }
//                 },
//                 {
//                     $unwind: "$brandDetails"
//                 },
//                 {
//                     $lookup : {
//                         from : 'category',
//                         localField : 'category',
//                         foreignField : '_id',
//                         as : 'categoryDetails'
//                     }
//                 },
//                 {
//                     $unwind: "$categoryDetails"
//                 },

//                 {
//                     $addFields: {
//                          // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
//                         discountOff: {$cond: { if: {$gt : ["$discount", "$categoryDetails.discount"]}, then: {$toInt: "$discount"}, else: {$toInt:"$categoryDetails.discount"} }},
//                     }
//                 },
//                 {
//                     $addFields :{
//                         discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
//                     }
//                 },
//                 {
//                     $addFields : {
//                         priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
//                     }
//                 }

//             ]).toArray()
//             console.log(product);
//             resolve(product)
//         } catch (error) {
//             console.log(error);
//         }
//     })
// },

// // getProductDetails: (productId) => {
// //     return new Promise((resolve, reject) => {
// //         db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then(data => {
// //             resolve(data)
// //             console.log('**********');
// //             console.log(data);
// //             console.log('**********');
// //         })
// //     })
// // },

// getProductDetails: (productId) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
//                 {
//                     $match: {
//                         _id: objectId(productId)
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'brand',
//                         localField: 'brand',
//                         foreignField: '_id',
//                         as: 'brandDetails'
//                     }
//                 },
//                 {
//                     $unwind: "$brandDetails"
//                 },
//                 {
//                     $lookup: {
//                         from: 'category',
//                         localField: 'category',
//                         foreignField: '_id',
//                         as: 'categoryDetails'
//                     }
//                 },
//                 {
//                     $unwind: "$categoryDetails"
//                 },

//             ]).toArray()
//             resolve(products[0])
//         } catch (error) {
//             reject(error)
//         }
//     })
// },


updateProduct:(productId,productDetails)=>{
    return new Promise(async(resolve,reject)=>{
        let brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(product.brand)})
        console.log(brand)
       let brandName = brand.brand
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},
        {
            $set:{
                name:productDetails.name,
                brandName:brandName,
                description:productDetails.description,
                price:productDetails.price,
                brand:productDetails.brand,
                stock: parseInt(productDetails.stock),
                img:productDetails.img
            }

        }).then((response)=>{
            resolve(response)
        })

    })

},

// getProductDetail:(productId)=>{
//     return new Promise((resolve,reject)=>{
//         db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then()
//         resolve(product)

//     }
    
// }



addCategory:(category)=>{
    return new Promise(async(resolve,reject)=>{
        let addCat = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category);
       console.log('............................>>>>>>>>>>>');
        console.log(addCat);
        resolve(addCat);
        // let 

    })


},
getCategory:()=>{
    
 return new Promise(async(resolve,reject)=>{
    let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        resolve(category)
    })


},
deleteCategory:(category)=>{
    // console.log("haiii");
     return new Promise(async (resolve,reject)=>{
      let deteteCategory= await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(category)})
     //    console.log(response)
         resolve(deteteCategory)
        
     })
 },

 addCoupon:(Coupon)=>{
    return new Promise(async(resolve,reject)=>{
        let addcpn=await db.get().collection(collection.COUPON_COLLECTION).insertOne(Coupon);

        console.log(addcpn);
            resolve(addcpn);
    })

 },

 addCategoryOffer:(offerData)=>{
    console.log(offerData);
   categoryId=offerData.category
    offer=offerData.offer
    console.log(offer);

    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(categoryId)},
        {
            $set:{
                offer:offer,
              
            }

        }).then((response)=>{
            resolve(response)
        })

    })

 },




 getCoupon:()=>{
    return new Promise (async(resolve,reject)=>{
        let coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        console.log("coupon");
        console.log(coupon);
        resolve(coupon)
    })
 },
 deleteCoupon:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
    let deleteCoupon=await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)})
    resolve(deleteCoupon)
    })
 }
 ,
// getCategory:()=>{
    
//     return new Promise(async(resolve,reject)=>{
//        let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
//            resolve(category)
//        })
//  return new Promise(async(resolve,reject)=>{
//     let addPro = await db.get().collection('product').insertOne(product);
    
//     console.log(addPro);
//     resolve(addPro);


// })
// console.log(addPro)
 
 addBrand:(brand)=>{
    return new Promise(async(resolve,reject)=>{
        let addBrand=await db.get().collection(collection.BRAND_COLLECTION).insertOne(brand);
        console.log(',,,,,,,,,,,,,,,,,,,,brand');
    console.log(addBrand);
    resolve(addBrand)


    })
 },

getBrand:()=>{
    
    return new Promise(async(resolve,reject)=>{
       let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
           resolve(brand)
       })
   
   
   },

   getcategory:()=>{
    return new Promise(async(resolve,reject)=>{
        let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        resolve(category)
    })
   },

deleteBrand:(brand)=>{
    // console.log("haiii");
     return new Promise(async (resolve,reject)=>{
      let deteteBrand= await db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id:objectId(brand)})
     //    console.log(response)
         resolve(deteteBrand)
        
     })


},


orderStatus:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let order=await db.get().collection(collection.ORDER_COLLECTIOIN).findOne({_id:objectId(orderId)})
     
        resolve(order.status)

    })

},

cancelOrder:(orderId)=>{

    console.log("heloooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
    return new Promise(async(resolve,reject)=>{
        let orderStatus=await db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(orderId)},
        {$set:{status:'cancelled', orderCanclled:true}},
        {upsert:true}
        )
    resolve(orderStatus)

    })

},

productReturn:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let returnStatus= await db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(orderId)},
        {$set:{status:'return requested',}},
        {upsert:true})

        


        resolve(returnStatus,orderMethod) 
    })
   },


returnPayment:(orderId,userId)=>{

    return new Promise(async(resolve,reject)=>{
        let orderDetails=await db.get().collection(collection.ORDER_COLLECTIOIN).findOne({_id:(objectId(orderId))})
        console.log(orderDetails);
        refundAmount= parseInt(orderDetails.totalAmount)
        console.log(">>>>>>>>>>>>>>>>>>>...refundAmount");
        console.log(refundAmount);
        let orderMethod=await db.get().collection(collection.ORDER_COLLECTIOIN).findOne({_id:objectId(orderId), paymentMethod: 'COD'})
        console.log(">>>>>>>>>>>>>>>>>>>...ordermethod");
        console.log(orderMethod)
        if(orderMethod == null){
            let retunPayment=await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $inc:{"wallet": refundAmount}
            })

        }
        
        
     resolve()
    })

   

        
}


//to admin pannel
,
allOrders:()=>{
    console.log("hahahahahahahha");
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTIOIN).find().toArray()
       console.log(orders);
        resolve(orders)

    })
    
},

orderStatusUpdate:(data)=>{
    console.log('helpers in oderstaus update')
    console.log(data.orderId);
    console.log(data.userId);
    return new Promise(async(resolve,reject)=>{
        let orderStatus= await db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(data.orderId),userId:objectId(data.userId)},
        {
            $set:{status:data.status,},
            
        },{upsert:true})


        resolve(orderStatus)
        // console.log(orderStatus);
    })
   
},

refundOrderStatusUpdate:(orderId,userId)=>{
    console.log('helpers in oderstaus update')
    console.log(orderId);
    console.log(userId);
    orderstatus='Refund Completed'
    return new Promise(async(resolve,reject)=>{
        let orderStatus= await db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(orderId),userId:objectId(userId)},
        {
            $set:{status:orderstatus,},
            
        },{upsert:true})


        resolve(orderStatus)
        // console.log(orderStatus);
    })
   
},


orderStatusCancell:(data)=>{
    console.log('helpers in oderstaus update')
    console.log(data.orderId);
    console.log(data.userId);
    return new Promise(async(resolve,reject)=>{
        let orderStatus= await db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(data.orderId),userId:objectId(data.userId)},
        {
            $set:{status:data.status,orderCanclled:true},
            
        },{upsert:true})

        
        resolve(orderStatus)
        // console.log(orderStatus);
    })
   
},



}

