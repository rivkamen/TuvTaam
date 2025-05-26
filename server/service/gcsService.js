// const { Storage } = require("@google-cloud/storage");
// const path = require("path");

// const storage = new Storage({
//   keyFilename: path.join(__dirname, "gcs-key.json"),
// });
// const bucketName = "taam-video-bucket";
// const bucket = storage.bucket(bucketName);

// exports.uploadToGCS = (file) => {
//   return new Promise((resolve, reject) => {
//     const blob = bucket.file(Date.now() + "_" + file.originalname);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: file.mimetype,
//     });

//     blobStream.on("error", reject);

//     blobStream.on("finish", () => {
//       const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
//       resolve({ url: publicUrl, name: blob.name });
//     });

//     blobStream.end(file.buffer);
//   });
// };

// exports.streamFromGCS = (fileName, range, res) => {
//   const file = bucket.file(fileName);
//   file.getMetadata().then((data) => {
//     const size = data[0].size;
//     const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
//     const end = size - 1;
//     const stream = file.createReadStream({ start, end });

//     res.writeHead(206, {
//       "Content-Range": `bytes ${start}-${end}/${size}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": end - start + 1,
//       "Content-Type": data[0].contentType,
//     });

//     stream.pipe(res);
//   });
// };
// const { Storage } = require("@google-cloud/storage");
// const path = require("path");
// const crypto = require("crypto");

// const storage = new Storage({
//   keyFilename: path.join(__dirname, "gcs-key.json"),
// });

// const bucketName = "your-bucket-name"; // שימי כאן את השם האמיתי של הדלי שלך
// const bucket = storage.bucket(bucketName);

// // פונקציית העלאה
// const uploadToGCS = (file) => {
//   return new Promise((resolve, reject) => {
//     const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
//     const blob = bucket.file(uniqueName);

//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: file.mimetype,
//     });

//     blobStream.on("error", (err) => reject(err));

//     blobStream.on("finish", () => {
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//       resolve({ publicUrl, name: blob.name });
//     });

//     blobStream.end(file.buffer);
//   });
// };

// // פונקציית הזרמה (streaming)
// const streamFromGCS = (fileName, range, res) => {
//   const file = bucket.file(fileName);

//   file.getMetadata().then((data) => {
//     const size = parseInt(data[0].size, 10);
//     const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
//     const end = size - 1;

//     const stream = file.createReadStream({ start, end });

//     res.writeHead(206, {
//       "Content-Range": `bytes ${start}-${end}/${size}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": end - start + 1,
//       "Content-Type": data[0].contentType,
//     });

//     stream.pipe(res);
//   }).catch((err) => {
//     res.status(500).send("Error streaming file: " + err.message);
//   });
// };

// // פונקציית מחיקה
// const deleteFromGCS = (fileName) => {
//   return new Promise((resolve, reject) => {
//     const file = bucket.file(fileName);

//     file.delete()
//       .then(() => resolve({ success: true, message: `${fileName} deleted.` }))
//       .catch((err) => reject(err));
//   });
// };
// const generateSignedUrl = async (fileName, expiresInMinutes = 15) => {
//   const file = bucket.file(fileName);

//   const options = {
//     version: "v4",
//     action: "read",
//     expires: Date.now() + expiresInMinutes * 60 * 1000, // זמן פקיעה במילישניות
//   };

//   try {
//     const [url] = await file.getSignedUrl(options);
//     return { signedUrl: url };
//   } catch (err) {
//     throw new Error("Failed to generate signed URL: " + err.message);
//   }
// };

// module.exports = {
//   uploadToGCS,
//   streamFromGCS,
//   deleteFromGCS,
//   generateSignedUrl
// };
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();
const BACKUP_DIR = path.join(__dirname,"..", "uploads");

const storage = new Storage({
  keyFilename: path.join(__dirname, "gcs-key.json"),
});

const bucketName = "taam-video-bucket"; // שימי כאן את השם האמיתי של הדלי שלך
const bucket = storage.bucket(bucketName);

// פונקציית העלאה
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
    const blob = bucket.file(uniqueName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => reject(err));

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve({ publicUrl, name: blob.name });
    });

    blobStream.end(file.buffer);
  });
};
// const uploadToGCSWithBackup = (file) => {
//   return new Promise((resolve, reject) => {
//     const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
//     const backupPath = path.join(BACKUP_DIR, uniqueName);

//     // גיבוי לקובץ מקומי
//     try {
//       fs.writeFileSync(backupPath, file.buffer);
//     } catch (err) {
//       return reject(new Error("שגיאה בגיבוי המקומי: " + err.message));
//     }

//     const blob = bucket.file(uniqueName);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: file.mimetype,
//     });

//     blobStream.on("error", (err) => reject(err));

//     blobStream.on("finish", () => {
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//       resolve({ publicUrl, name: blob.name, localBackupPath: backupPath });
//     });

//     blobStream.end(file.buffer);
//   });
// };
// // מחיקת קובץ מקומי (גיבוי)
const deleteLocalBackup = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(new Error("שגיאה במחיקת הגיבוי המקומי: " + err.message));
      resolve({ success: true, message: `גיבוי ${filePath} נמחק.` });
    });
  });
};
// const uploadToGCSWithBackup = (file) => {
//   console.log("100% - התחלת העלאה עם גיבוי מקומי");
  
//   return new Promise((resolve, reject) => {
//     const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
//     const backupPath = path.join(BACKUP_DIR, uniqueName);
//   console.log("200% - התחלת העלאה עם גיבוי מקומי");

//     // שמירה מקומית לגיבוי
//     try {
//         console.log("300% - התחלת העלאה עם גיבוי מקומי");

//       fs.writeFileSync(backupPath, file.buffer);
//     } catch (err) {
//       return reject(new Error("שגיאה בגיבוי המקומי: " + err.message));
//     }

//     const blob = bucket.file(uniqueName);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: file.mimetype,
//     });

//     blobStream.on("error", (err) => reject(err));

//     blobStream.on("finish", async () => {
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

//       // ננסה למחוק את הקובץ המקומי
//       try {
//         await deleteLocalBackup(backupPath);
//       } catch (delErr) {
//         console.warn("הגיבוי לא נמחק:", delErr.message); // רק לוג, לא חוסם את ההעלאה
//       }

//       resolve({ publicUrl, name: blob.name });
//     });

//     blobStream.end(file.buffer);
//   });
// };

// פונקציית הזרמה (streaming)
const uploadToGCSWithBackup = (file) => {
  console.log("🚀 100% - התחלת uploadToGCSWithBackup", {
    originalname: file?.originalname,
    bufferExists: !!file?.buffer,
    mimetype: file?.mimetype,
  });

  return new Promise((resolve, reject) => {
    let uniqueName;
    let backupPath;

    try {
      uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
      backupPath = path.join(BACKUP_DIR, uniqueName);
      console.log("📦 200% - שם ייחודי נוצר:", uniqueName);
    } catch (err) {
      console.error("❌ שגיאה ביצירת שם ייחודי או נתיב:", err);
      return reject(err);
    }

    try {
      fs.writeFileSync(backupPath, file.buffer);
      console.log("💾 300% - גיבוי מקומי נשמר ב:", backupPath);
    } catch (err) {
      console.error("❌ שגיאה בגיבוי המקומי:", err);
      return reject(new Error("שגיאה בגיבוי המקומי: " + err.message));
    }

    const blob = bucket.file(uniqueName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    console.log("☁️ 400% - התחלת העלאה ל-GCS:", blob.name);

    blobStream.on("error", (err) => {
      console.error("❌ שגיאה בהעלאה ל-GCS:", err);
      reject(err);
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log("✅ 500% - ההעלאה ל-GCS הושלמה:", publicUrl);

      try {
        await deleteLocalBackup(backupPath);
        console.log("🧹 600% - הגיבוי המקומי נמחק");
      } catch (delErr) {
        console.warn("⚠️ לא הצלחנו למחוק את הגיבוי המקומי:", delErr.message);
      }

      resolve({ publicUrl, name: blob.name });
    });

    try {
      blobStream.end(file.buffer);
      console.log("📤 450% - buffer נשלח ל-GCS");
    } catch (err) {
      console.error("❌ שגיאה בשליחת buffer ל-GCS:", err);
      reject(err);
    }
  });
};


const streamFromGCS = (fileName, range, res) => {
  const file = bucket.file(fileName);

  file.getMetadata().then((data) => {
    const size = parseInt(data[0].size, 10);
    const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
    const end = size - 1;

    const stream = file.createReadStream({ start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": data[0].contentType,
    });

    stream.pipe(res);
  }).catch((err) => {
    res.status(500).send("Error streaming file: " + err.message);
  });
};

// פונקציית מחיקה
const deleteFromGCS = (fileName) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(fileName);

    file.delete()
      .then(() => resolve({ success: true, message: `${fileName} deleted.` }))
      .catch((err) => reject(err));
  });
};

// פונקציה ליצירת URL חתום
const generateSignedUrl = async (fileName, expiresInMinutes = 15) => {
  const file = bucket.file(fileName);

  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + expiresInMinutes * 60 * 1000, // זמן פקיעה במילישניות
  };

  try {
    const [url] = await file.getSignedUrl(options);
    return { signedUrl: url };
  } catch (err) {
    throw new Error("Failed to generate signed URL: " + err.message);
  }
};

module.exports = {
  uploadToGCS,
  uploadToGCSWithBackup,
  streamFromGCS,
  deleteFromGCS,
  generateSignedUrl
};
