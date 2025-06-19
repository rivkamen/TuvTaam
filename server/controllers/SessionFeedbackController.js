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

  if (!session) return res.status(401).json({ message: "not found" });

  if (req.user.role==='admin') {
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
    console.log("🚀 fromUser לא נמצא, מגדירים ל-true");
    
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
  if (!session) return res.status(404).json({ message: "session not found" });
 
  const isUser = session.userId.find(id => id.toString() === req.user._id.toString());

  if (!isUser && req.user.role !== 'admin' && false) return res.status(403).json({ message: "unauthorized" });
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
const isUser = session.userId.find(id => id.toString() === req.user._id.toString());
  if (!isUser && req.user.role !== 'admin' && false) return res.status(403).json({ message: "unauthorized" });

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
const updateMessageReadStatus = async (req, res) => {
  const { _id, messageId } = req.params;
  const session = await SessionFeedback.findById(_id).exec();
  if (!session) return res.status(404).json({ message: "Session not found" });

  // בדיקה שהיוזר הוא הבעלים של הסשן או אדמין
  if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && false) {
    return res.status(403).json({ message: "unauthorized" });
  }

  const message = session.messages.id(messageId);
  if (!message) return res.status(404).json({ message: "Message not found" });

  message.isRead = true;

  try {
    await session.save();
    return res.status(200).json({ success: true, message: "Message marked as read" });
  } catch (err) {
    return res.status(500).json({ message: "Error updating message", error: err.message });
  }
};
const markAllMessagesAsRead = async (req, res) => {
  try {
    const { _id } = req.params; // session ID
    const session = await SessionFeedback.findById(_id).exec();

    if (!session) {
      return res.status(404).json({ message: "session not found" });
    }

    const isOwner = session.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin && false) {
      return res.status(403).json({ message: "unauthorized" });
    }

    let updatedCount = 0;
    session.messages.forEach(msg => {
      if (!msg.isRead) {
        msg.isRead = true;
        updatedCount++;
      }
    });

    await session.save();

    return res.status(200).json({
      success: true,
      message: `${updatedCount} messages marked as read.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {createSession,getSessions,getSessionById,getMessages,getMessageById,updateSession,deleteSession,createMessage,updateMessage,deleteMessage,getUserSessions,updateMessageReadStatus,markAllMessagesAsRead}

// שאר הפונקציות (getSessions, getSessionById, getMessages וכו') נשארות כפי שהן כי הן רק קוראות מידע.
