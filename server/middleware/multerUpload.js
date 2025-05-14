const multer = require('multer');

// שימוש בזיכרון (ללא שמירה זמנית בדיסק)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
