module.exports={
ifEquals:(value1,value2,value3,options)=>{

    if(value1==value2){
        if(value3){
            return options.fn(value3)
        }
       return options.fn()
    }else{
        if(value3)
        {   
            return options.inverse(value3);      
        }

        return options.inverse();   
    }
},




// ifStatus:(status, value1, value2, value3, value4, bool,options)=>{

//     if(status==value1 || status==value2 || status==value3 || status==value4 ){
//         if(bool){
//             return options.fn(bool)
//         }
//        return options.fn()
//     }else{
//         if(bool)
//         {   
//             return options.inverse(bool);      
//         }

//         return options.inverse();   
//     }
// },


}