const gcs = require("../service/gcsService");
const Admin = require("../models/Admin");
const SessionFeedback = require("../models/SessionFeedback");
const { uploadToGCSWithBackup, deleteFromGCS } = require("../service/gcsService");
const { User } = require('../models/User')

// 1. צור מיפוי של לקוחות SSE פתוחים
const clients = {};

// 2. פתח endpoint לקבלת הודעות ב-Server-Sent Events
// const sseConnection = (req, res) => {
//   const sessionId = req.params._id;
// res.set({
//   'Content-Type': 'text/event-stream',
//   'Cache-Control': 'no-cache',
//   'Connection': 'keep-alive',
//   'Access-Control-Allow-Origin': '*', // או ספציפית origin שלך
// });

//   res.flushHeaders();

//   // שליחה ראשונית למנוע timeout
// res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

//   if (!clients[sessionId]) clients[sessionId] = [];
//   clients[sessionId].push(res);

//   req.on('close', () => {
//     clients[sessionId] = clients[sessionId].filter((r) => r !== res);
//   });
// };
// const sseConnection = (req, res) => {
//   const sessionId = req.params._id;

//   res.set({
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     'Connection': 'keep-alive',
//     'Access-Control-Allow-Origin': '*', // אפשר להחליף ל-origin ספציפי
//   });

//   res.flushHeaders();

//   // שליחה ראשונית למנוע timeout
//   res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

//   if (!clients[sessionId]) {
//     clients[sessionId] = [];
//   }
//   clients[sessionId].push(res);

//   req.on('close', () => {
//     clients[sessionId] = clients[sessionId].filter((r) => r !== res);
//   });
// };

const sseConnection = (req, res) => {
  const sessionId = req.params._id;

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // אפשר להחליף ל-origin ספציפי
  });

  res.flushHeaders();

  const clientCountBefore = clients[sessionId]?.length || 0;

  // שליחה ראשונית למנוע timeout
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

  if (!clients[sessionId]) {
    clients[sessionId] = [];
  }
  clients[sessionId].push(res);
console.log(`🔌 לקוח חדש התחבר ל-SSE של השיחה ${sessionId} (סה"כ עכשיו: ${clients[sessionId].length})`);

  req.on('close', () => {
    clients[sessionId] = clients[sessionId].filter((r) => r !== res);
  console.log(`🔌 חיבור ל-SSE נסגר. סה"כ עכשיו: ${clients[sessionId]?.length || 0}`);
  });
};

const createSession = async (req, res) => {

    const { userId, title} = req.body;
console.log(userId);

    // 🧠 קח userId או מה־body או מה־token
    const userIdd = userId || req.user?._id;

  
    if (!userIdd) {
      return res.status(400).json({ message: "userId is missing" });
    }

    const user = await User.findById(userIdd).lean(); // ⬅️ await היה חסר
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

  const session = await SessionFeedback.create({ userId:userIdd, messages:[], title });


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
// const createMessage = async (req, res) => {
//   console.log("🚀 התחלת createMessage");

//   const { _id } = req.params;
//   const message = req.body;
//   const file = req.file;

//   let session;
//   try {
//     session = await SessionFeedback.findById(_id).exec();
//     if (!session) {
//       return res.status(404).json({ message: "session not found" });
//     }
//   } catch (err) {
//     return res.status(500).json({ message: "Error finding session", error: err.message });
//   }

//   if (file) {
//     try {
//       const uploadResult = await uploadToGCSWithBackup(file);
//       message.path = uploadResult.name;

//       try {
//         const signedUrlData = await gcs.generateSignedUrl(message.path);
//         message.signedUrl = signedUrlData.signedUrl;
//         message.expiresAt = signedUrlData.expiresAt;
//       } catch (error) {
//         console.error("⚠️ שגיאה ביצירת signed URL:", error.message);
//       }

//     } catch (err) {
//       return res.status(500).json({ message: "File upload failed", error: err.message });
//     }
//   }

//   if (message.fromUser === undefined) {
//     message.fromUser = false;
//   }

//   session.messages.push(message);

//   try {
//     await session.save();
//   } catch (err) {
//     return res.status(500).json({ message: "Error saving session", error: err.message });
//   }

//   // 🔴 שליחת עדכון ללקוחות SSE
//   const subscribers = clients[_id];
// if (subscribers) {
//   console.log(`[SSE] שולחת ל-${subscribers.length} מאזינים עבור שיחה ${_id}`);
//   const msgToSend = JSON.stringify({ sessionId: _id });
//   subscribers.forEach((clientRes) => {
//     clientRes.write(`event: message\ndata: ${msgToSend}\n\n`);
//   });
// } else {
//   console.log(`[SSE] אין מאזינים מחוברים לשיחה ${_id}`);
// }

  
//   return res.status(201).json({
//     success: true,
//     message: `Message added to session \"${session.title}\"`,
//     data: message,
//   });
// };
const createMessage = async (req, res) => {
  console.log("🚀 התחלת createMessage");

  const { _id } = req.params;
  const message = req.body;
  const file = req.file;

  console.log("📥 הודעה שהתקבלה מהקליינט:", message);

  let session;
  try {
    session = await SessionFeedback.findById(_id).exec();
    if (!session) {
      console.warn("⚠️ שיחה לא נמצאה:", _id);
      return res.status(404).json({ message: "session not found" });
    }
    console.log("📚 session נמצא:", session._id);
  } catch (err) {
    console.error("❌ שגיאה בשליפת session:", err.message);
    return res.status(500).json({ message: "Error finding session", error: err.message });
  }

  if (file) {
    console.log("📎 קובץ מצורף – מנסה להעלות...");
    try {
      const uploadResult = await uploadToGCSWithBackup(file);
      message.path = uploadResult.name;
      console.log("✅ קובץ הועלה:", message.path);

      try {
        const signedUrlData = await gcs.generateSignedUrl(message.path);
        message.signedUrl = signedUrlData.signedUrl;
        message.expiresAt = signedUrlData.expiresAt;
        console.log("🔐 signed URL נוצר:", signedUrlData.signedUrl);
      } catch (error) {
        console.error("⚠️ שגיאה ביצירת signed URL:", error.message);
      }

    } catch (err) {
      console.error("❌ העלאת קובץ נכשלה:", err.message);
      return res.status(500).json({ message: "File upload failed", error: err.message });
    }
  }

  if (message.fromUser === undefined) {
    message.fromUser = false;
  }
console.log("💬 מוסיף הודעה לשיחה:", message);

  session.messages.push(message);

  try {
    await session.save();
    console.log("💾 הודעה נשמרה בהצלחה בשיחה:", session._id);
  } catch (err) {
    console.error("❌ שגיאה בשמירת השיחה:", err.message);
    return res.status(500).json({ message: "Error saving session", error: err.message });
  }

  // 🔴 שליחת עדכון ללקוחות SSE
  const subscribers = clients[_id];
  if (subscribers && subscribers.length) {
    console.log(`[📡 SSE] שולחת ל-${subscribers.length} מאזינים עבור שיחה ${_id}`);
    const msgToSend = JSON.stringify({ sessionId: _id, message });
    subscribers.forEach((clientRes, index) => {
      console.log(`📨 שולחת למאזין [${index + 1}]:`, msgToSend);
      clientRes.write(`event: message\ndata: ${msgToSend}\n\n`);
    });
  } else {
    console.log(`[📭 SSE] אין מאזינים מחוברים לשיחה ${_id}`);
  }

  return res.status(201).json({
    success: true,
    message: `Message added to session \"${session.title}\"`,
    data: message,
  });
};

const updateMessage = async (req, res) => {
  const { _id, messageId } = req.params;
  const { content, path } = req.body;

  const session = await SessionFeedback.findById(_id).exec();
  if (!session) return res.status(404).json({ message: "session not found" });

  const isUser = session.userId.find(id => id.toString() === req.user?._id.toString());
  if (!isUser && req.user.role !== 'admin') return res.status(403).json({ message: "unauthorized" });

  const msg = session.messages.id(messageId);
  if (!msg) return res.status(404).json({ message: "message not found" });

  if (content !== undefined){ 
    msg.content = content; 
     msg.isEdited = true;
}
  if (path !== undefined) msg.path = path;

  await session.save();

  // 🔔 שליחת הודעה מיידית ללקוח
  if (clients[_id]) {
    clients[_id].forEach(res => {
      res.write(`event: message-updated\ndata: ${JSON.stringify({ message: msg })}\n\n`);
    });
  }

  return res.status(200).json({
    success: true,
    message: "Message updated successfully",
    updatedMessage: msg,
  });
};
const deleteMessage = async (req, res) => {
  const { _id, messageId } = req.params;
  const session = await SessionFeedback.findById(_id).exec();
  if (!session) return res.status(404).json({ message: "session not found" });

  const isUser = session.userId.find(id => id.toString() === req.user?._id.toString());
  if (!isUser && req.user.role !== 'admin') return res.status(403).json({ message: "unauthorized" });

  const msg = session.messages.id(messageId);
  if (!msg) return res.status(404).json({ message: "message not found" });

  if (msg.path) await deleteFromGCS(msg.path);
  // session.messages.pull({ _id: messageId });
  msg.isDeleted = true;
  msg.path = null;

  await session.save();

  // 🔔 שליחת אירוע מחיקה
  if (clients[_id]) {
    clients[_id].forEach(res => {
      res.write(`event: message-deleted\ndata: ${JSON.stringify({ messageId })}\n\n`);
    });
  }

  return res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
};

// const deleteMessage = async (req, res) => {
//   const { _id, messageId } = req.params;
//   const session = await SessionFeedback.findById(_id).exec();
//   if (!session) return res.status(404).json({ message: "session not found" });
 
//   const isUser = session.userId.find(id => id.toString() === req.user._id.toString());

//   if (!isUser && req.user.role !== 'admin' && false) return res.status(403).json({ message: "unauthorized" });
//   const msg = session.messages.id(messageId);
//   if (!msg) return res.status(404).json({ message: "message not found" });
//   if (msg.path) await deleteFromGCS(msg.path);
// session.messages.pull({ _id: messageId });
//   await session.save();

//   return res.status(200).json({
//     success: true,
//     message: "Message deleted successfully",
//   });
// };
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
  
// const updateMessage = async (req, res) => {
//   const { _id, messageId } = req.params; // _id של session, messageId של ההודעה
//   const { content, path } = req.body;

//   const session = await SessionFeedback.findById(_id).exec();
//   if (!session) return res.status(404).json({ message: "session not found" });
// const isUser = session.userId.find(id => id.toString() === req.user?._id.toString());
//   if (!isUser && req.user.role !== 'admin' && false) return res.status(403).json({ message: "unauthorized" });

//   const msg = session.messages.id(messageId);
//   if (!msg) return res.status(404).json({ message: "message not found" });

//   if (content !== undefined) msg.content = content;
//   if (path !== undefined) msg.path = path;

//   await session.save();

//   return res.status(200).json({
//     success: true,
//     message: "Message updated successfully",
//     updatedMessage: msg,
//   });
// };
const updateMessageReadStatus = async (req, res) => {
  console.log("🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒🦒");
  
  const { _id, messageId } = req.params;
  const session = await SessionFeedback.findById(_id).exec();
  if (!session) return res.status(404).json({ message: "Session not found" });

  // בדיקה שהיוזר הוא הבעלים של הסשן או אדמין
  if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
// const markAllMessagesAsRead = async (req, res) => {
//   try {
//     const { _id } = req.params; // session ID

    
//     const session = await SessionFeedback.findById(_id).exec();

//     if (!session) {
//       return res.status(404).json({ message: "session not found" });
//     }

//     const isOwner = session.userId.toString() === req.user._id.toString();
//     const isAdmin = req.user.role === 'admin';

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ message: "unauthorized" });
//     }

//     let updatedCount = 0;
//     session.messages.forEach(msg => {
//       if (!msg.isRead) {
//         msg.isRead = true;
//         updatedCount++;
//       }
//     });

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       message: `${updatedCount} messages marked as read.`,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
const markAllMessagesAsRead = async (req, res) => {
  try {
    console.log("🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸🐸");
    
    const { _id } = req.params; // session ID
    console.log('[markAllMessagesAsRead] התחלה, sessionId:', _id);
    console.log('[markAllMessagesAsRead] משתמש מבקש:', req.user);

    const session = await SessionFeedback.findById(_id).exec();
    console.log('[markAllMessagesAsRead] session שהתקבל:', session);

    if (!session) {
      console.warn('[markAllMessagesAsRead] שיחה לא נמצאה');
      return res.status(404).json({ message: "session not found" });
    }

    const isOwner = session.userId?.toString() === req.user._id?.toString();
    const isAdmin = req.user.role === 'admin';

    console.log('[markAllMessagesAsRead] בדיקת הרשאות - isOwner:', isOwner, 'isAdmin:', isAdmin);

    if (!isOwner && !isAdmin) {
      console.warn('[markAllMessagesAsRead] אין הרשאות למשתמש');
      return res.status(403).json({ message: "unauthorized" });
    }

    let updatedCount = 0;
    session.messages.forEach(msg => {
      if (!msg.isRead) {
        msg.isRead = true;
        updatedCount++;
      }
    });

    console.log(`[markAllMessagesAsRead] כמות הודעות שסומנו כנקראו: ${updatedCount}`);
    
    await session.save();
    console.log('[markAllMessagesAsRead] שיחה נשמרה בהצלחה');

    return res.status(200).json({
      success: true,
      message: `${updatedCount} messages marked as read.`,
    });

  } catch (error) {
    console.error('[markAllMessagesAsRead] שגיאה כללית:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {createSession,getSessions,getSessionById,getMessages,getMessageById,updateSession,deleteSession,createMessage,updateMessage,deleteMessage,getUserSessions,updateMessageReadStatus,markAllMessagesAsRead,sseConnection}

// שאר הפונקציות (getSessions, getSessionById, getMessages וכו') נשארות כפי שהן כי הן רק קוראות מידע.
