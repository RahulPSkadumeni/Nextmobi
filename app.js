var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var hbs = require('express-handlebars');
var expbs = require('express-handlebars');


var db=require('./config/connection')
var session=require('express-session');
const colors = require('colors');

//var productHelper=require('../helpers/producthelpers')
const hbshelpers=require('./helpers/hbshelpers')


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

const hbs=expbs.create({
  extname: 'hbs',defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/',
  helpers:{
    
    
    
    ifEquals: (value1,value2,options) => {

      if (value1 == value2) {
        
        return options.fn()
      } else {
        
        return options.inverse();
      }
    },


    ifGreaterthan: (value1,value2,options) => {

      if (value1 > value2) {
        
        return options.fn()
      } else {
        
        return options.inverse();
      }
    },




    
    ifStatus:(status, value1, value2, value3, bool,options)=>{

      if(status==value1 || status==value2 || status==value3 ){
          if(bool){
              return options.fn(bool)
          }
         return options.fn()
      }else{
          if(bool)
          {   
              return options.inverse(bool);      
          }
  
          return options.inverse();   
      }
  },

  ifstockEquals: (value1,value2,options) => {

    if (value1 == value2) {
      
      return options.fn()
    } else {
      
      return options.inverse();
    }
  },


  
  ifOrderStatusEquals: (status,value1,value2,options) => {

    if (status == value1 || status== value2) {
      
      return options.fn()
    } else {
      
      return options.inverse();
    }
  },


  IfDelivery: (status,value1,options) => {

    if (status == value1 ) {
      
      return options.fn()
    } else {
      
      return options.inverse();
    }
  },


  

//   ifEquals:(value1,value2,value3,options)=>{

//     if(value1==value2){
//         if(value3){
//             return options.fn(value3)
//         }
//        return options.fn()
//     }else{
//         if(value3)
//         {   
//             return options.inverse(value3);      
//         }

//         return options.inverse();   
//     }
// },


    // ifStatusEquals: (status, value1, value2, value3, options)=>{
    //   if(status==value1 || status==value2 || status==value3){

    //     return options.fn()
    //   }
    // },
    count: (index)=> {
      return index+1
       
   },
    indexing:(index,page,limit)=>{
      console.log('.>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log(index ,page ,limit);
      if(page&&limit){
        return ((parseInt(page)-1)*limit)+parseInt(index)+1
      }else{
        return parseInt(index)+1;
      }
    }}
  
});





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine);

// app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', 
// helpers:hbshelpers,
// layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/', runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true,},}));
app.use(session({secret:'Key',cookie:{maxAge:600000}}))




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.set('cache-control', 'no-store')
  next();
})

db.connect((err)=>{
  if (err)
    console.log("connection error => "+ err);
  
  else console.log('database connected')

})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// app.post('/getSearch',(req,res)=>{
//   let payload=req.body.payload.trim();
//   console.log('payload' .red .bgYellow);

// });



module.exports = app;
