const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/product')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' +file.originalname )
    }
});
 const upload = multer({ storage: storage });


// handle storage using multer
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/brand')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' +file.originalname )
        // cb(null, file.originalname + '-' + Date.now())
    }
});
 const upload2 = multer({ storage: storage2 });
 module.exports= {
    upload,
    upload2
};