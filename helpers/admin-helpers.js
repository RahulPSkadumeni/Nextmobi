var db = require('../config/connection')
const bcrypt = require('bcrypt')
const { ORDER_COLLECTIOIN } = require('../config/collections.js')
const { request } = require('express')
const collections = require('../config/collections.js')
var objectId = require('mongodb').ObjectId


module.exports={

    blockUser : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection('user').updateOne({_id: objectId(userId)},
                {$set: {acessStatus: false}}
                )
            resolve(user)
        })
    },

    unblockUser : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection('user').updateOne({_id: objectId(userId)},
                {$set: {acessStatus:true}}
                )
            resolve(user)
        })
    },
 
    

    getTotalSaleGraph : ()=> {
        return new Promise(async (resolve, reject) => {
            console.log('monthly');
            let dailySales = await db.get().collection('order').aggregate([
                {
                    $match: { status: { $nin: ['cancelled','pending'] } }
                },
                {
                    $group: {
                        _id:"$date",
                        total: { $sum: {$toInt:"$totalAmount"} }
                        
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()

            let monthlySales = await db.get().collection('order').aggregate([
                {
                    $match: { status: { $nin: ['cancelled','pending'] } }
                },
                {
                    $group: {
                        _id: "$date",
                        total: { $sum: {$toInt:"$totalAmount"} }
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()

            let yearlySales = await db.get().collection('order').aggregate([
                {
                    $match: { status: { $nin: ['cancelled','pending'] } }
                },
                {
                    $group: {
                        _id:  "$date",

                        total: { $sum: {$toInt:"$totalAmount"} }
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()
            console.log("hahhahahahhahahahahahhahah");
        //    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+dailySales[0].dailySales);
        //     console.log(dailySales, monthlySales, yearlySales);
            resolve({ dailySales, monthlySales, yearlySales });
        })
    },


    getSalesReport : ()=>{
        let month = new Date().getMonth()+1;
        let year = new Date().getFullYear()
        return new Promise(async(resolve,reject)=>{
            let weeklyReport = await db.get().collection('order').find({
                createdAt: {
                    $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
                },
              
            }).toArray()
            // console.log(',.,.......................................,,,,,,,,,,,,,,,,,,,,,,,,,,,');
            // console.log(weeklyReport);
            // console.log(',.,...................vvvvvvvvvvvvvvv  ...,,,,,,,,,,,,,,,,,,,,,,,,,,,');

            let monthlyReport = await db.get().collection(ORDER_COLLECTIOIN).find({
                 "$expr": { "$eq": [{ "$month": "$createdAt" }, month] } 
                }).toArray()

                

            let yearlyReport = await db.get().collection(ORDER_COLLECTIOIN).find({
                "$expr": { "$eq": [{ "$year": "$createdAt" }, year] } 
            }).toArray()
            resolve({weeklyReport, monthlyReport, yearlyReport})
        })
    },
//??????????????????????????????????????DashBoard<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

getPaymentWiseGraph:()=>{
    console.log("hahahahhahahhahahaaahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    try{
        return new Promise(async(resolve,reject)=>{
            let totalPayments = await db.get().collection('order').countDocuments({
                status : {$nin: ['cancelled']}
            })

            let totalCOD = await db.get().collection('order').countDocuments({
                paymentMethod: 'COD', status: {$nin: ['cancelled','pending']}
            })

            let totalRazorpay = await db.get().collection('order').countDocuments({
                paymentMethod: 'Razor pay', status: {$nin: ['cancelled','pending']}
            })

            let totalPaypal = await db.get().collection('order').countDocuments({
                paymentMethod: 'paypal', status: {$nin: ['cancelled','pending']}
            })

            let totalWallet = await db.get().collection('order').countDocuments({
                paymentMethod: 'wallet', status: {$nin: ['cancelled','pending']}
            })




            let percentageCOD = Math.round(totalCOD/totalPayments*100);
            let percentageRazorpay = Math.round(totalRazorpay/totalPayments*100);
            let percentagePaypal = Math.round(totalPaypal/totalPayments*100);
            let percentageWallet=Math.round(totalWallet/totalPayments*100)
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"+percentageCOD);
             console.log(totalPayments, totalCOD, totalRazorpay, totalPaypal,percentageWallet)
            resolve({percentageCOD, percentageRazorpay, percentagePaypal,percentageWallet})
        })
    }
    catch{
        throw(err)
    }
},

getCategoryWiseSales:()=>{
   console.log('>>>>>>>>>>>>>>>>>>>>>helpers for category sales<<<<<<<<<<<<<<<<<<<<<<<<<<<')
     return new  Promise(async(resolve,reject)=>{
        let categoryWiseSales=await db.get().collection(collections.ORDER_COLLECTIOIN).aggregate([
            {
                $match:{
                    'status':{$nin:['cancelled,pending']}
                }
            },

            {
                $project:{
                    products:1
                }
            },
            {
                $unwind:'$products'
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

                $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:'product.item',
                    foreignField:'_id',
                    as:'productDetails',

                }

            },
            {
            $project:{
                    productDetails:1
                }
            },
            {
                $unwind:'$productDetails'
            },
            {
                $group:{
                    _id:'$productDetails.category',count:{$sum:1}
                }
            }
            
                
            ]).toArray()
    //  let categoryWiseSalesData ={}
            //  categoryWiseSalesData.Smartphones = categoryWiseSales[0].count
            // categoryWiseSalesData.Featurephone = categoryWiseSales[1].count 
            // categoryWiseSalesData.Accessories = categoryWiseSales[2].count 
            //  categoryWiseSalesData.total = categoryWiseSalesData.Smartphones+categoryWiseSalesData.Featurephone+categoryWiseSalesData.Accessories
             console.log(categoryWiseSales);
             resolve(categoryWiseSales)
    }
 
)},


getDailySalesTotal:(date)=>{
   console.log(date);

    return new Promise(async (resolve, reject) => {
        console.log('getDailySalesTotal');
        let dailySales = await db.get().collection('order')
        .aggregate(
            [
            {
                $match: { status: { $nin: ['cancelled','pending'] } }
            },
            {
                $match: {
                         date: date
                },

            },
            {
                $group: {
                    _id:null,
                    total: { $sum: {$toInt:"$totalAmount"} }
                    
                }
            },
            
            
        ]

       
        ).toArray()
        // .find({
        //     createdAt: {
        //         $gte: new Date(date)
        //     },
            
          
        // })
        console.log(".................~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

        console.log(dailySales)
        resolve(dailySales)

    })
}




}  



// }
// categoryWiseSales:()=>{
//     return new Promise(async(resolve,reject)=>{
//        let categoryWiseSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
//             {
//                 $match:{
//                     'status':{$nin:['cancelled,pending']}
//                 }
//             },
//             {
//                 $project:{
//                     products:1
//                 }
//             },
//             {
//                 $unwind:'$products'
//             },
//             {
//                 $lookup:{
//                     from:collection.PRODUCT_COLLECTION,
//                     localField:'products.item',
//                     foreignField:'_id',
//                     as:'productDetails'

//                 }
//             },
//             {
//                 $project:{
//                     productDetails:1
//                 }
//             },
//             {
//                 $unwind:'$productDetails'
//             },
//             {
//                 $group:{
//                     _id:'$productDetails.category',count:{$sum:1}
//                 }
//             }


//         ]).toArray()
//         let categoryWiseSalesData ={}
//         categoryWiseSalesData.men = categoryWiseSales[0].count
//         categoryWiseSalesData.women = categoryWiseSales[1].count
//         categoryWiseSalesData.total = categoryWiseSalesData.men+categoryWiseSalesData.women;
//         resolve(categoryWiseSalesData)
//     })
// },
    