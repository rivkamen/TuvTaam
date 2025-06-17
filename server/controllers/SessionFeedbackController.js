const gcs = require("../service/gcsService");
const Admin = require("../models/Admin");
const SessionFeedback = require("../models/SessionFeedback");
const { uploadToGCSWithBackup, deleteFromGCS } = require("../service/gcsService");

const createSession = async (req, res) => {
  const { userId, messages, title } = req.body;
  if (!userId || !messages) {
    return res.status(400).json({ message: "required field is missing" });
  }

  const messagesWithUploads = await Promise.all(messages.map(async (msg) => {
    if (msg.path && msg.path.startsWith("temp")) {
      const fakeFile = { originalname: msg.path, buffer: Buffer.from("") }; // דמה
      const uploadResult = await uploadToGCSWithBackup(fakeFile);
      msg.path = uploadResult.name;
    }
    return msg;
  }));

  const session = await SessionFeedback.create({ userId, messages: messagesWithUploads, title });

  if (session) {
    return res.status(201).json({
      success: true,
      message: `Session ${session.title} created successfully`,
    });
  } else {
    return res.status(400).json({ message: "failed" });
  }
};
const getSessions=async(req,res)=>{
  const session = await SessionFeedback.find().populate('userId', 'email').lean();
  if(!session)
  {
    res.status(500).json({ error: error.message });
  }

  return res.status(200).json(session);

}

const getSessionById=async(req,res)=>{
const {_id}=req.params
  const session = await SessionFeedback.find().populate('userId', 'email').lean();

const admin=await Admin.findById({_id:req.user._id})
if(!session)
{
  return  res.status(401).json({message:"not found"})
}
if(session.userId==req.user._id || admin){
  
    return res.json(session)
}
return res.status(405).json({message:"unauthorized"})

}
// const getMessages = async (req, res) => {
//     const { _id } = req.params; // session ID
//     const session = await SessionFeedback.findById(_id).lean();
//     // const admin = await Admin.findById({ _id: req.user._id });

//     if (!session) return res.status(404).json({ message: "session not found" });

//     if (/*session.userId.toString() === req.user._id.toString() || admin*/true) {
//         return res.status(200).json(session.messages);
//     }

//     return res.status(403).json({ message: "unauthorized" });
// };

const getMessages = async (req, res) => {
  try {
    const { _id } = req.params; // session ID
    const session = await SessionFeedback.findById(_id).lean();

    if (!session) {
      return res.status(404).json({ message: "session not found" });
    }

    const messagesWithUrls = await Promise.all(
      session.messages.map(async (message) => {
        if (message.path) {
          try {
            const signedUrlData = await gcs.generateSignedUrl(message.path);
            return {
              ...message,
              signedUrl: signedUrlData.signedUrl,
              expiresAt: signedUrlData.expiresAt
            };
          } catch (error) {
            console.error("Error generating signed URL for path:", message.path, error.message);
            return message; // מחזירים את ההודעה גם אם אין קובץ חתום
          }
        } else {
          return message; // הודעה בלי path לא צריכה שינוי
        }
      })
    );

    return res.status(200).json(messagesWithUrls);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMessageById = async (req, res) => {
    const { _id, messageId } = req.params; // session ID and message ID
    const session = await SessionFeedback.findById(_id).lean();
    const admin = await Admin.findById({ _id: req.user._id });

    if (!session) return res.status(404).json({ message: "session not found" });

    if (session.userId.toString() !== req.user._id.toString() && !admin) {
        return res.status(403).json({ message: "unauthorized" });
    }

    const message = session.messages.find(msg => msg._id.toString() === messageId);
    if (!message) return res.status(404).json({ message: "message not found" });

    return res.status(200).json(message);
};
const updateSession = async (req, res) => {
  const { _id } = req.params;
  const { messages, title } = req.body;

  const session = await SessionFeedback.findById(_id).exec();
  const admin = await Admin.findById({ _id: req.user._id });

  if (!session) return res.status(401).json({ message: "not found" });

  if (session.userId == req.user._id || admin) {
    if (messages) {
      const updatedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.path && msg.path.startsWith("temp")) {
          const fakeFile = { originalname: msg.path, buffer: Buffer.from("") };
          const uploadResult = await uploadToGCSWithBackup(fakeFile);
          msg.path = uploadResult.name;
        }
        return msg;
      }));
      session.messages = updatedMessages;
    }

    if (title) session.title = title;
    await session.save();

    return res.status(201).json({
      success: true,
      message: `session ${session.title} updated successfully`,
    });
  }

  return res.status(405).json({ message: "unauthorized" });
};

const deleteSession = async (req, res) => {
  const { _id } = req.params;
  const session = await SessionFeedback.findById(_id).exec();
  const admin = await Admin.findById({ _id: req.user._id });

  if (!session) return res.status(401).json({ message: "not found" });

  if (admin) {
    for (const msg of session.messages) {
      if (msg.path) {
        await deleteFromGCSIfExists(msg.path);
      }
    }
    await session.deleteOne();
    return res.status(201).json({ success: true, message: `one session deleted successfully` });
  }

  return res.status(405).json({ message: "unauthorized" });
};

// const createMessage = async (req, res) => {
//   const { _id } = req.params;
 
//   const {message} = req.body;
//   const file = req.file;

//   const session = await SessionFeedback.findById(_id).exec();
  
//   if (!session) return res.status(404).json({ message: "session not found" });
 

//   if (file) {
//     try {
//       const uploadResult = await uploadToGCSWithBackup(file);
//       message.path = uploadResult.publicUrl;
//     } catch (err) {
        
//       return res.status(500).json({ message: "File upload failed", error: err.message });
//     }
//   }
//  if (message.fromUser === undefined) {
//     message.fromUser = false; // ברירת מחדל אם לא נשלח
//   }

//   session.messages= [...session.messages, message];
 
//   await session.save();

//   return res.status(201).json({
//     success: true,
//     message: `Message added to session "${session.title}"`,
//     data: message
//   });
// };

// const createMessage = async (req, res) => {
//   console.log("🚀 התחלת createMessage");

//   const { _id } = req.params;
//   console.log("📌 מזהה סשן:", _id);

//   const message  = req.body;
//   console.log(req.body);
  
//   console.log("📩 הודעה מהגוף:", message);

//   const file = req.file;
//   if (file) {
//     console.log("📁 קובץ מצורף:", file.originalname);
//   } else {
//     console.log("🚫 אין קובץ מצורף");
//   }

//   let session;
//   try {
//     session = await SessionFeedback.findById(_id).exec();
//     console.log("🔍 מצאתי סשן:", session ? session.title : "לא נמצא");
//   } catch (err) {
//     console.error("❌ שגיאה באיתור סשן:", err);
//     return res.status(500).json({ message: "Error finding session", error: err.message });
//   }

//   if (!session) {
//     console.warn("⚠️ סשן לא נמצא");
//     return res.status(404).json({ message: "session not found" });
//   }

//   if (file) {
//     try {
//       console.log("☁️ מתחיל העלאה ל-GCS...");
//       const uploadResult = await uploadToGCSWithBackup(file);
//       console.log("✅ העלאה ל-GCS הושלמה:", uploadResult.publicUrl);
//       console.log(uploadResult);
      
//       message.path = uploadResult.name;
//     } catch (err) {
//       console.error("❌ שגיאה בהעלאת הקובץ ל-GCS:", err);
//       return res.status(500).json({ message: "File upload failed", error: err.message });
//     }
//   }

//   if (message.fromUser === undefined) {
//     message.fromUser = false;
//     console.log("ℹ️ fromUser לא היה מוגדר, מגדיר ל-false");
//   }

//   console.log("➕ מוסיף הודעה למערך ההודעות של הסשן");
//   session.messages = [...session.messages, message];

//   try {
//     await session.save();
//     console.log("💾 שמרתי את הסשן עם ההודעה החדשה");
//   } catch (err) {
//     console.error("❌ שגיאה בשמירת הסשן:", err);
//     return res.status(500).json({ message: "Error saving session", error: err.message });
//   }
// console.log(message);

//   console.log("✅ מחזיר תשובה עם סטטוס 201");
//   return res.status(201).json({
//     success: true,
//     message: `Message added to session "${session.title}"`,
//     data: message,
//   });
// };
const createMessage = async (req, res) => {
  console.log("🚀 התחלת createMessage");

  const { _id } = req.params;
  const message = req.body;
  const file = req.file;

  let session;
  try {
    session = await SessionFeedback.findById(_id).exec();
    if (!session) {
      return res.status(404).json({ message: "session not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error finding session", error: err.message });
  }

  if (file) {
    try {
      const uploadResult = await uploadToGCSWithBackup(file);
      message.path = uploadResult.name;

      // 🧠 כאן תוספת חדשה: יצירת signed URL
      try {
        const signedUrlData = await gcs.generateSignedUrl(message.path);
        message.signedUrl = signedUrlData.signedUrl;
        message.expiresAt = signedUrlData.expiresAt;
      } catch (error) {
        console.error("⚠️ שגיאה ביצירת signed URL:", error.message);
        // ממשיכים בלי signedUrl
      }

    } catch (err) {
      return res.status(500).json({ message: "File upload failed", error: err.message });
    }
  }

  if (message.fromUser === undefined) {
    message.fromUser = false;
  }

  session.messages.push(message);

  try {
    await session.save();
  } catch (err) {
    return res.status(500).json({ message: "Error saving session", error: err.message });
  }

  // ✔️ מחזירים את ההודעה עם signedUrl אם יש
  return res.status(201).json({
    success: true,
    message: `Message added to session "${session.title}"`,
    data: message,
  });
};

const deleteMessage = async (req, res) => {
  const { _id, messageId } = req.params;
  const session = await SessionFeedback.findById(_id).exec();
  const admin = await Admin.findById({ _id: req.user._id });

  if (!session) return res.status(404).json({ message: "session not found" });

  const isUser = session.userId.find(id => id.toString() === req.user._id.toString());
  if (!isUser && !admin) return res.status(403).json({ message: "unauthorized" });

  const msg = session.messages.id(messageId);
  if (!msg) return res.status(404).json({ message: "message not found" });

  if (msg.path) await deleteFromGCS(msg.path);

session.messages.pull({ _id: messageId });
  await session.save();

  return res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
};
  const getUserSessions = async (req, res) => {
    console.log("hi");
    
    try {
      const userId = req.user._id;
    const sessions = await SessionFeedback.find({ userId }).populate('userId', 'email').lean();
  
      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
const updateMessage = async (req, res) => {
  const { _id, messageId } = req.params; // _id של session, messageId של ההודעה
  const { content, path } = req.body;

  const session = await SessionFeedback.findById(_id).exec();
  if (!session) return res.status(404).json({ message: "session not found" });

  const msg = session.messages.id(messageId);
  if (!msg) return res.status(404).json({ message: "message not found" });

  if (content !== undefined) msg.content = content;
  if (path !== undefined) msg.path = path;

  await session.save();

  return res.status(200).json({
    success: true,
    message: "Message updated successfully",
    updatedMessage: msg,
  });
};

module.exports = {createSession,getSessions,getSessionById,getMessages,getMessageById,updateSession,deleteSession,createMessage,updateMessage,deleteMessage,getUserSessions}

// שאר הפונקציות (getSessions, getSessionById, getMessages וכו') נשארות כפי שהן כי הן רק קוראות מידע.
