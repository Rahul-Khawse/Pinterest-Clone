const multer = require('multer');
const { v4: uuidv4 } = require('uuid');  // For generating unique filenames
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {   
        cb(null, './public/images/uploads');  // File will be saved in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        const uniqueFilename = uuidv4();  // Generating unique filenames 
        cb(null, uniqueFilename + path.extname(file.originalname));  // File will be saved with a unique filename
    }
});

const upload = multer({ storage: storage });

module.exports = upload;