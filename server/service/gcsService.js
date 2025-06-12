
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
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
    const blob = bucket.file(uniqueName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => reject(err));

    blobStream.on("finish", async () => {
      try {
        const [signedUrl] = await blob.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 15 * 60 * 1000, // 15 דקות במילישניות
        });
        resolve({ signedUrl, name: blob.name });
      } catch (err) {
        reject(new Error("Failed to generate signed URL: " + err.message));
      }
    });

    blobStream.end(file.buffer);
  });
};

const deleteLocalBackup = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(new Error("שגיאה במחיקת הגיבוי המקומי: " + err.message));
      resolve({ success: true, message: `גיבוי ${filePath} נמחק.` });
    });
  });
};

// const uploadToGCSWithBackup = (file) => {
//   console.log("🚀 100% - התחלת uploadToGCSWithBackup", {
//     originalname: file?.originalname,
//     bufferExists: !!file?.buffer,
//     mimetype: file?.mimetype,
//   });

//   return new Promise((resolve, reject) => {
//     let uniqueName;
//     let backupPath;

//     try {
//       uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
//       backupPath = path.join(BACKUP_DIR, uniqueName);
//       console.log("📦 200% - שם ייחודי נוצר:", uniqueName);
//     } catch (err) {
//       console.error("❌ שגיאה ביצירת שם ייחודי או נתיב:", err);
//       return reject(err);
//     }

//     try {
//       fs.writeFileSync(backupPath, file.buffer);
//       console.log("💾 300% - גיבוי מקומי נשמר ב:", backupPath);
//     } catch (err) {
//       console.error("❌ שגיאה בגיבוי המקומי:", err);
//       return reject(new Error("שגיאה בגיבוי המקומי: " + err.message));
//     }

//     const blob = bucket.file(uniqueName);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: file.mimetype,
//     });

//     console.log("☁️ 400% - התחלת העלאה ל-GCS:", blob.name);

//     blobStream.on("error", (err) => {
//       console.error("❌ שגיאה בהעלאה ל-GCS:", err);
//       reject(err);
//     });

//     blobStream.on("finish", async () => {
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//       console.log("✅ 500% - ההעלאה ל-GCS הושלמה:", publicUrl);

//       try {
//         await deleteLocalBackup(backupPath);
//         console.log("🧹 600% - הגיבוי המקומי נמחק");
//       } catch (delErr) {
//         console.warn("⚠️ לא הצלחנו למחוק את הגיבוי המקומי:", delErr.message);
//       }

//       resolve({ publicUrl, name: blob.name });
//     });

//     try {
//       blobStream.end(file.buffer);
//       console.log("📤 450% - buffer נשלח ל-GCS");
//     } catch (err) {
//       console.error("❌ שגיאה בשליחת buffer ל-GCS:", err);
//       reject(err);
//     }
//   });
// };
const uploadToGCSWithBackup = (file) => {
  console.log("🚀 100% - התחלת uploadToGCSWithBackup", {
    originalname: file?.originalname,
    bufferExists: !!file?.buffer,
    mimetype: file?.mimetype,
  });

  return new Promise(async (resolve, reject) => {
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
      console.log("✅ 500% - ההעלאה ל-GCS הושלמה:", uniqueName);

      try {
        await deleteLocalBackup(backupPath);
        console.log("🧹 600% - הגיבוי המקומי נמחק");
      } catch (delErr) {
        console.warn("⚠️ לא הצלחנו למחוק את הגיבוי המקומי:", delErr.message);
      }

      try {
        // יצירת URL חתום עם תוקף של 15 דקות
        const [signedUrl] = await blob.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 15 * 60 * 1000, // 15 דקות במילישניות
        });

        resolve({ signedUrl, name: uniqueName });
      } catch (urlErr) {
        console.error("❌ שגיאה ביצירת signed URL:", urlErr);
        reject(urlErr);
      }
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
