var db=require('../config/connection');
var collection=require('../config/collections');
const bcrypt=require('bcrypt');
require('dotenv').config()


const { response } = require('express');
const collections = require('../config/collections');
// const { ObjectId } = require('mongodb');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { CompositionSettingsList } = require('twilio/lib/rest/video/v1/compositionSettings');
const { resolve } = require('path');



var instance = new Razorpay({
    key_id: process.env.RAZOR_PAY_ID,
    key_secret: process.env.RAZOR_PAY_SECRET,
  });

module.exports={
    doSignup:(userData)=>{  
        console.log(userData);
        
        return new Promise(async (resolve,reject)=>{
            userData.acessStatus=true
            userData.wallet=parseInt(0);
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId)

            })  

        })
   
    },
    doLogin:(userData)=>{
        console.log('from back -',userData)
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email}) 
            let acessStatus = await db.get().collection(collection.USER_COLLECTION).findOne({acessStatus:true}) 

            if (user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        if(acessStatus){
                          //  console.log("user is blocked")
                             console.log('login sucess')
                        response.user=user
                        response.status=true
                        resolve(response)
                        }

                        
                        
                    }else{
                        console.log("user is blocked")
                        response.status=false

                        resolve('response')

                    }
                })
            }else{
                console.log('passwword error,login failed')
                response.email=true
                resolve(response)
            }
        })

    },

    doOtpLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            var response = {}
            console.log("*******************");
            console.log(userData);
            let user = await db.get().collection('user').findOne({ phone: userData.phone })
            if (user) {
                console.log("----------otp login successful");
                response.user = user;
                response.acessStatus = true;
                resolve(response);
            } else {
                console.log("otp login failed");
                response.user = "";
                response.acessStatus = false;
                resolve(response)
            }
        })
    },

    getUserDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let useData=await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(useData);
    
    
    
        })
    },

    addToCart:(productId,userId)=>{
         let proObj={
            item:objectId(productId),  
            quantity:1, 
            img:1

         }                        //product object

        return new Promise(async(resolve,reject)=>{
           
            //check is there is a cart already
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
     
            if(userCart){
                let proExist=userCart.product.findIndex(product=> product.item==productId)
               // console.log(proExist);
                    if(proExist !=-1){
                        db.get().collection(collection.CART_COLLECTION)
                        .updateOne({user:objectId(userId),"product.item":objectId(productId)},
                        
                        {
                            $inc:{'product.$.quantity':1}
                        }
                        ).then(()=>{resolve()
                        
                    })
 

                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{product:proObj}

                    }).then(()=>{
                        resolve();

                    })
                }

                //if cart is already created
            //    console.log("hsfhbsbcfibuscbkvjiudbsvbkdubvksjbsuibi");
            //    let cart = await db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            //    {
                  
            //            $push:{product:(proObj)}
                 
            //    }
            //    )
            //        resolve()
               

//  if no cart create a new cart if there is no cat in db===>>
            }else{
                console.log("haiiiaddtoCart");
                let cartObj={
                    user:objectId(userId),
                    product:[proObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                   // console.log(response);
                    resolve();

                })

             }  
            

        } ) 
    },
    
    getCartProducts:(userId)=>{
        console.log("this"+userId);
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
              
                {   
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    } 
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $lookup: {
                        from:'brand',
                        localField: 'product.brand',
                        foreignField: '_id',
                        as: 'brand'
                    }
                },
                {
                    $unwind:"$brand"
                },
                {
                    $lookup :{
                        from :collection.CATEGORY_COLLECTION,
                        localField : 'product.category',
                        foreignField : '_id',
                        as : 'category'
                    }
                },
                {
                    $unwind: "$category"
                },
              
                {
                    $project: {
                        item:1, quantity: 1, product:1, category: 1,brand:1 ,
                        discountOff: {$cond: { if: {$gt : ["$product.discount", "$category.offer"]}, then: {$toInt: "$product.discount"}, else: {$toInt:"$category.offer"} }},
    
                    }
                 },
                // {
                //     $addFields: {
                       
                //         discountOff: {$cond: { if: {$gt : ["$discount", "$category.offer"]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                //     }
                // },
                {
                    $addFields :{
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields : {
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }
                    }
                },
                {
                    $addFields: {
                        
                        totalAfterDiscount: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] }
                    }
                }
               
            ]).toArray()
            console.log("khaiiiii\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\");
           
            console.log(cartItems)

            resolve (cartItems)
            
             console.log("haiii+ " );
             
             
        })

    },

    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.product.length
            }
            resolve(count)
        })
    },

    getWishlistCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if(wishlist){
                count=wishlist.products.length
            }
            resolve(count)
        })
    },





    doVerifySignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection('user').findOne({ email: userData.email });
            resolve(user);
        })
    },

    changeProductQuantity:(data)=>{
        let count = data.count
        let productId = data.product
        let cartId = data.cart
        let quantity = data.quantity
        // alert(quantity)
        console.log('============== quantity =============')
        console.log(quantity)
        console.log('============== quantity =============')
       

        count=parseInt(count)
        console.log(cartId,productId);
        return new Promise((resolve,reject)=>{
            if(count == -1 && quantity == 1){
                resolve({disable:true})
            }else{
                db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(cartId),'product.item':objectId(productId)},
            {
                $inc:{'product.$.quantity':count}
            }
            ).then((response)=>{
                console.log('======oops=====')
                console.log(response)
                resolve(response)
            
             })
            }
            

       
        })
    },
    removeCart:(productId,userId)=>{
        console.log('[[[[[[[[[[[[[[[[[[[[remove -wishlist')

        console.log(userId)

        return new Promise(
            (resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'product.item':objectId(productId)},{
                $pull:{product:{item:objectId(productId)}}
            }).then((data)=>{
                console.log(data);

                resolve({removeCart:true});
               // console.log(resolve);
            })

        })
    },
    
    getSubTotalAmout:(userId)=>{
        console.log(userId);
        return new Promise(async (resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).find({user:objectId(userId)})
            console.log(cart)
            let total='';

            if(cart!=null){
                let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    } 
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                    }
                },
                {

                    $group:{
                      
                   _id :null,total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}


                }
            }
               
            ]).toArray()
             console.log("hau=iiiii")
           console.log("subtotal..........................////////////////////////////////////////////////////");
             console.log(total[0].total)

             resolve (Math.round(total[0].total))
            }else{
                console.log('=== no cart ===')
                total=null
                resolve(total)
            }

         
            
             
             
        })


    },

    getTotalAmout:(userId)=>{
        console.log(userId);
        return new Promise(async (resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).find({user:objectId(userId)})
            console.log(cart)
          

            if(cart){
                let totals=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    } 
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $lookup: {
                        from:'brand',
                        localField: 'product.brand',
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
                        localField : 'product.category',
                        foreignField : '_id',
                        as : 'category'
                    }
                },
                {
                    $unwind: "$category"
                },

                {
                    $addFields: {
                      
                        discountOff: {$cond: { if: {$gt : ["$discount", "$category.offer"]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                    }
                },
                {
                    $addFields :{
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields : {
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }
                    }
                },

                {

                    $group:{
                      
                   _id :null,total:{$sum:{$multiply:['$quantity',{$toInt:'$priceAfterDiscount'}]}}


                  }
                  
                  
                },
                             
            ]).toArray()
             console.log("hau=##########iiiii")
            // console.log("haiii"+(totals[0].total))

            console.log(totals[0].total);
            resolve ((totals[0].total))

            }else{
                console.log('=== no cart ===')
                resolve()
            }

         
            
             
             
        })


    },



    getTotalDiscount:(userId)=>{
        console.log(userId);
        return new Promise(async (resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).find({user:objectId(userId)})
            console.log(cart)

            if(cart){
                let totals=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    } 
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $lookup: {
                        from:'brand',
                        localField: 'product.brand',
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
                        localField : 'product.category',
                        foreignField : '_id',
                        as : 'category'
                    }
                },
                {
                    $unwind: "$category"
                },

                {
                    $addFields: {
                      
                        discountOff: {$cond: { if: {$gt : ["$discount", "$category.offer"]}, then: {$toInt: "$discount"}, else: {$toInt:"$category.offer"} }},
                    }
                },
                {
                    $addFields :{
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields : {
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }
                    }
                },

                {

                    $group:{
                      
                   _id :null,total:{$sum:{$multiply:['$quantity',{$toInt:'$discountedAmount'}]}}


                  }
                  
                }
               
            ]).toArray()
             console.log("hau=##########iiiii  total discount")
            console.log(totals[0].total)
 
            resolve (Math.round(totals[0].total))

            }else{
                console.log('=== no cart ===')
                resolve()
            }

         
            
             
             
        })


    },





    placeOrder:(order,product,total,userId)=>{

        return new Promise (async(resolve,reject)=>{
        console.log("h>H>H>H>H>H>H>JMKK<<<<<<<<<<<<<<<<");
            
            console.log(userId);

            let status=order['payment-method']==='COD'?'confirmed':'pending'
            let orderObj={
                //     deleveryDetails:{
                //     firstName:order.firstName,
                //     lastName:order.lastName,
                //     address:order.address,
                //     country:order.country,
                //     city:order.city,
                //     state:order.state,
                //     email:order.email,
                //     phone:order.phone,
                //     pincode:order.pincode,


                // },
                addressId:objectId(order.addressId),
                userId:objectId(userId),
                paymentMethod:order['payment-method'], 
                products:product,
                totalAmount:Math.round(total),
                status:status,
                date: new Date().toISOString().slice(0, 10),
                createdAt:new Date(),
            }
            db.get().collection(collection.ORDER_COLLECTIOIN).insertOne(orderObj).then((response)=>{
                console.log('>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<GGGGGGGGGGGG');
               
                // db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userId)})
                
                console.log('inserted id:'+response.insertedId);
                resolve(response.insertedId)
                




            })

        })

    },
  deleteCartProduct:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userId)})
    }
    )

  },



    getCartProductList:(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);

             resolve(cart.product) 

        })
    },

    getUserOrders:(userId)=>{
        // return new Promise(async(resolve,reject)=>{ 

        //     let orders=await db.get().collection(collection.ORDER_COLLECTIOIN)



        //     .find({userId:objectId(userId)}).toArray( )
        //     resolve(orders)

        // })


          return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection('order').aggregate([

                {
                    $lookup: {
                        from: 'address',
                        localField: 'addressId',
                        foreignField: '_id',
                        as: 'addressDetails'
                    }
                },
                {
                    $unwind: '$addressDetails'
                },
                {
                    $sort:{'createdAt':-1}
                }


            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
       
    
    getUserOrdersUser:(userId)=>{
            // return new Promise(async(resolve,reject)=>{ 
    
            //     let orders=await db.get().collection(collection.ORDER_COLLECTIOIN).find({userId:objectId(userId)}).toArray( )
            //     resolve(orders)
    
            // }) 
    console.log(userId);
    
             return new Promise(async (resolve, reject) => {
    
                 let orders = await db.get().collection('order')
                 .aggregate([
                    // {
                    //    $match:{_id:objectId(userId)}
                    // },
    
                    {
                        $lookup: {
                           from: 'address',
                            localField: 'addressId',
                            foreignField: '_id',
                       as: 'addressDetails'
                        }
                    },
                    {
                        $unwind: '$addressDetails'
                   },
                   {
                    $sort:{'createdAt':-1}
                   }
    
    
                ]).toArray()
             console.log(orders);
                resolve(orders)
           })
        },
           

    
    getOrderProducts:(orderId)=>{
        return new Promise(async (resolve,reject)=>{
            console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
            console.log(orderId);
            console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')

            let orderItem=await db.get().collection(collection.ORDER_COLLECTIOIN)
            
            .aggregate([
                   {
                       $match:{_id:objectId(orderId)}
                   },
                   {
                       $unwind:'$products'
                   },
                   {
                       $project:{
                           item:'$products.item',
                           quantity:'$products.quantity'
                       }
                   },
                   
                   {
                       $lookup:{
                           from:collection.PRODUCT_COLLECTION,
                           localField:'item',
                           foreignField:'_id',
                           as:'product'
                       } 
                   },
                   {
                       $project:{
                           item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                       }
                   },
                  
                   
                   {
                    $sort:{'createdAt':-1}
                }

                   
               
                  
               ]).toArray()
            // //    console.log("hau=iiiii")
            // //    console.log(orderItem)
   
               resolve (orderItem)
               
                
                
           })
    },

    getInvoice:(orderId)=>{

            return new Promise(async (resolve,reject)=>{
                console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                console.log(orderId);
                console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    
                let orderItem=await db.get().collection(collection.ORDER_COLLECTIOIN).aggregate([
                       {
                           $match:{_id:objectId(orderId)}
                       },

                       {
                           $unwind:'$products'
                       },
                    //    {
                    //        $project:{
                    //            item:'$products.item',
                    //            quantity:'$products.quantity',
                    //            paymentMethod:1
                               

                    //        }
                    //    },
                    //    {
                    //        $lookup:{
                    //            from:collection.PRODUCT_COLLECTION,
                    //            localField:'products.item',
                    //            foreignField:'_id',
                    //            as:'product'
                    //        } 
                    //    },
                    //    {
                    //     $unwind:'$product'

                    //    },

                      { 
                        $lookup:{
                        from:collection.ADDRESS_COLLECTION,
                        localField:'addressId',
                        foreignField:'_id',
                        as:'address'


                      }

                       },

                       {
                        $unwind:'$address'
                    },

                    //    {
                    //        $project:{
                    //            item:1,quantity:1,paymentMethod:1,address:1,product:{$arrayElemAt:['$product',0]}
                    //        }
                    //    }
                    // {
                    //     $project: {
                    //         product: {$arrayElemAt:['$products',0]},
                    //         addressDetails :1, totalAmount:1, date:1
                    //     }
                    // }
    
                       
                   
                      
                   ]).toArray()
                   console.log("fnsbjkfdsjlkbfdsklbskljlfdblfjbi")
                   console.log(orderItem[0])
       
                   resolve (orderItem[0])
                   
                    
                    
               })
        },

        // orderStatus:(orderid)=>{
        //     return new Promise(async(resolve,reject)=>{
        //         let

        //     })

        // },
    


    addNewAdress:(address,userId)=>{
       
        // let user=userId
        console.log(address);

        console.log(userId);
        let newAddress={
            userId:objectId(userId),
            firstName:address.firstName,
            lastName:address.lastName,
            address:address.address,
            country:address.country,
            city:address.city,
            state:address.state,
            email:address.email,
            pincode:address.pincode,
            phone:address.phone

        }
        console.log(newAddress);
        db.get().collection(collection.ADDRESS_COLLECTION).insertOne(newAddress).then((response)=>{ 
            resolve(response)

    })},

    getAddress:(userId)=>{
        console.log("userId");
        console.log(userId)
       return new Promise(async(resolve,reject)=>{
       let address=await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).toArray();
    //    console.log(address)
       resolve(address);

       })

       
      
    },

    getAddressEdit:(addressId)=>{
        console.log("addressId");
        console.log(addressId)
       return new Promise(async(resolve,reject)=>{
       let address=await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id: objectId(addressId)});
       console.log(address)
       resolve(address);

       })

    
      
    },


    updateAddress:(address,addressId,userId)=>{
       
        // let user=userId
        console.log(address);

        console.log(addressId);
        let newAddress={
            userId:objectId(userId),
            firstName:address.firstName,
            lastName:address.lastName,
            address:address.address,
            country:address.country,
            city:address.city,
            state:address.state,
            email:address.email,
            pincode:address.pincode,
            phone:address.phone

        }
        console.log(newAddress);
        return new Promise(async(resolve,reject)=>{
     let updateAdress= await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({_id: objectId(addressId)},{
            $set:{
                firstName:address.firstName,
            lastName:address.lastName,
            address:address.address,
            country:address.country,
            city:address.city,
            state:address.state,
            email:address.email,
            pincode:address.pincode,
            phone:address.phone

            }

        }).then((response)=>{ 
            
            resolve(response)
        })

    })

},

deleteAddress:(addessId)=>{
    // console.log("haiii");
     return new Promise(async (resolve,reject)=>{
      let deleteAddress= await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:objectId(addessId)})
     //    console.log(response)
         resolve(deleteAddress)
        
     })
 },
//     addToWishList:(productId,userId)=>{
//         console.log("haiii");
//         let proObj={
//             item:objectId(productId),  
//             quantity:1, 
//             img:1



//     }
//     console.log(proObj);

// }

    addToWishList:(proId,userId)=>{
        console.log("nvnvnvnvnvnvnnnnnnnnnnnn..................,,,,,,,,,,,,,,,,,,,,,,");
        let product = {
            item:objectId(proId)
        }
        return new Promise(async(resolve,reject)=>{
            let findWishList=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            console.log(findWishList)
            if(findWishList){
                let prodExist=findWishList.products.findIndex(product=> product.item.toString()==objectId(proId).toString())
                console.log('========= prodExist ============')
                console.log(prodExist);
                if(prodExist!=-1){
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    { 
                        $addToSet:{products:product}
                    }
                    ).then((response)=>{
                        resolve(response)
                    })
                }
                else{
                    console.log("its entering to the else");
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $push:{products:product}
                    }
                    ).then((response)=>{
                        resolve(response)
                    })
                }
            }
            else{
                console.log("its a new product");
                wishListObj={
                    user:objectId(userId),
                    products:[product]
                }

                console.log('============ wishlist obj =============')
                console.log(wishListObj)
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then((response)=>{
                    resolve(response)
                })
            }
        })
    },
 
    
    wishlistProducts:(userId)=>{
        console.log(userId);
      return new Promise(async(resolve,reject)=>{
      let items= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
            $match:{user:objectId(userId)}
        },
        {
            $unwind:'$products'
        },
     
        {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'products.item',
                foreignField:'_id',
                as:'items'
            } 
        },
        {
            $unwind:'$items'
            }
        
    
       
    ]).toArray()
    console.log("hau=iiiii")
    console.log(items)

    resolve (items)
  })
     
},


removeWishList:(productId,userId)=>{
    console.log('[[[[[[[[[[[[[[[[[[[[Wisklist,,,,,,,,,,,,,,,,,,,,,,,,,,,,<<<<<<<<<')

    console.log(userId)
    console.log(productId);

    return new Promise(
        (resolve,reject)=>{
        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(productId)},{
            $pull:{products:{item:objectId(productId)}}
        }).then((data)=>{
            console.log("kkekekekekkeeeeekkkkkkkkkkkllllllllllllllllllll");
            console.log(data);

            resolve({removeWishList:true});
           // console.log(resolve);
        })

    })
},

//!!+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Razzor

generateRazorPay: (orderId, total) => {
    return new Promise((resolve, reject) => {

        instance.orders.create({
            amount: total*100,
            currency: "INR",
            receipt: "" + orderId,

        }, (err, order) => {
            if (err) throw err
            console.log("New Order: ", order);
            resolve(order)
        })
    })
},

verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
        const crypto=require('crypto');

        const { createHmac } = await import('node:crypto');
        const secret = process.env.RAZOR_PAY_SECRET;
        const hash = createHmac('sha256', secret)
            .update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            .digest('hex');

            if(hash===details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        console.log(hash);
    })
},
changeStatus:(orderId)=>{
    console.log(orderId);
    console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTIOIN).updateOne({_id:objectId(orderId)},
        {
            $set:{status:'confirmed'}
        }).then(()=>{
            oderStatus=("condirmed")
            resolve(oderStatus)
        })
    })
},
// updateProfile:(userData,userId)=>{
//     console.log(userData)
//     // console.log(userId)
//     return new Promise((resolve,reject)=>{
//         db.get().collection(collection.PROFILE_COLLECTION).insertOne({user:objectId(userId)},
//         {
//             $set:{ 
//                 fname:userData.fname,
//                 sname:userData.sname,
//                 email:userData.email,
//                 phone:userData.phone,
               
              
//             }

//         }).then((response)=>{
//             resolve(response)
//         })

//     })

// },



// updateProfile:(userData,userId)=>{
       
//     // let user=userId
//     // console.log(address);

//     console.log(userId);
//     let newAddress={
//         userId:objectId(userId),
//         firstName:userData.firstName,
//         lastName:userData.lastName,
//         email:userData.email,
//         phone:userData.phone,

//     }
//     console.log(newAddress);
//     db.get().collection(collection.PROFILE_COLLECTION).insertOne(newAddress).then((response)=>{ 
//         resolve(response)

// })},


getProfileDetails:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let profile = await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)})
            resolve(profile)
        })

},

searchProduct:(payload)=>{
    console.log('in usesr helpers');
    
        return new Promise(async(resolve,reject)=>{
            let search = await db.get().collection(collection.PRODUCT_COLLECTION).find({name: {$regex: new RegExp( payload + '.*', 'i')}
        }).toArray();
        search = search.slice(0, 10)
        console.log("searchhh");
        console.log(search);
        resolve(search)
        })
    
},
filterProducts:(filterbrand)=>{
    console.log('=============filter brand name===========')
    let brands = filterbrand.brand
    console.log(brands)
    if(typeof(brands) == 'string'){
        let brand = [brands]
        brands = brand
    }
    console.log(brands)
    return new Promise(async(resolve,reject)=>{

        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find(
            {

                brandName:{$in:brands}
            }
        ).toArray()
        console.log('================ filter ==========')
        console.log(products)
        resolve(products)
    //     if (Array.isArray(filterItems)){
    //         console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    //         console.log(filterItems);
    //         filterItems.forEach(convert);
    //         function convert(item,index,arr){
    //             arr[index] = objectId(item)
    //         }

           
    //         let filter = await db.get().collection('product').find([{


    //             brand:{$in: filterItems}
    //         },
          
                
                
    //      ] )
    //         .toArray()
    //         resolve(filter)
    //         console.log("lllllllllllllllllllllllllllllllllllllllllllllllllllll>>>>>>>>>>>>>>>>>>>>>>>>");
    //         console.log(filter);
    //     }else{
    //         let filterData = objectId(filterItems)
    //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>filterData");
    //         console.log(filterData);
    //         let filter = await db.get().collection(collection.PRODUCT_COLLECTION).find({
    //             brand:{$in:[filterData]}
    //         }).toArray()
    //         resolve(filter)
    //         console.log(filter);
    //     }
    })
},



getOrderProductQuantity:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let OrderProdctQunatity= await db.get().collection(collection.ORDER_COLLECTIOIN).aggregate([{$match:{_id:objectId(orderId)}},{
            $unwind:'$products'
          },
          {
            $project:{
              productId:"$products.item",
                quantity:"$products.quantity"
            }
          },
          ]).toArray().then((response)=>{
       
      
            console.log(response);
            resolve(response)
            
        })
    })
},

updateStockDecrease:({productId,quantity})=>{
    console.log(productId);
    


    return new Promise(async(resolve, reject)=>{
        console.log('into int');
        console.log(quantity);
        quantity=parseInt(quantity)

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
            $inc:{stock: -quantity}
        })
    })

},

 
updateStockIncrease:({productId,quantity})=>{
    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)}, {
      $inc: {"stock": +quantity},
  })
  },

 checkwallet:(userId)=>{
    return  new Promise(async(resolve,reject)=>{


    })

 },


  walletAmountCheck:(userId,totalprice)=>{
    console.log(userId);
    userId=userId
    return new Promise(async(resolve,reject)=>{
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
        console.log(user.wallet +" wallet amount");
        walletAmount=user.wallet
        if(walletAmount>=totalprice){

            resolve(walletAmount)


        }
        else{
            resolve(null)
        }})
    },
        

     walletAmountCheckForUser:(userId)=>{
            console.log(userId);
            userId=userId
            return new Promise(async(resolve,reject)=>{
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                console.log(user.wallet +" wallet amount");
                walletAmount=  Math.round(user.wallet)
               
        
                    resolve(walletAmount)
        
        
                
             
                
        

        

    })
   
},


WalletAmountReduce:(userId,totlAmount)=>{
    return new Promise(async(resolve,reject)=>{

        let retunPayment=await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
            $inc:{"wallet": -totlAmount}
        })
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
        console.log(user.wallet +"new wallet amount");

        resolve()

    })
   
}


}


