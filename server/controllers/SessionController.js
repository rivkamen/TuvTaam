const Session = require("../models/Session");
const Admin = require("../models/Admin");
const createSession=async(req,res)=>{

    const {userId,adminId,messages/*,title*/} = req.body
    console.log("hi");
    
    if (!userId ||!messages) {
        return res.status(400).json({message:'required field is missing'})
        }
    
    const sessionObject= {userId,adminId,messages/*,title*/}
    const session = await Session.create(sessionObject)
    if(session){
console.log('success');

      return res.status(201).json({
        success: true,
        message: `Session created successfully`,
    });
    }
    else
    console.log('success');

        return res.status(400).json({message:"failed"})
      
}

const getSessions=async(req,res)=>{
  // const session=await Session.find().lean()
  const session = await Session.find().populate('userId', 'email').lean();

  if(!session)
  {
    res.status(500).json({ error: error.message });
  }

  return res.status(200).json(session);

}

const getSessionById=async(req,res)=>{
const {_id}=req.params
// const session=await Session.findById(_id).lean()
const session = await Session.findById(_id).populate('userId', 'email').lean();

if(!session)
{
  return  res.status(401).json({message:"not found"})
}
if(session.userId==req.user._id || req.user.role === 'admin'){
  
    return res.json(session)
}
return res.status(405).json({message:"unaouthorisedid"})

}
const updateSession=async(req,res)=>{
  const {_id}=req.params
    const {messages/*,title*/}=req.body 
    const session=await Session.findById(_id).exec()
    console.log(req.user._id);
    
const admin=await Admin.findById({_id:req.user._id})
console.log(admin);

    if(!session){
    return res.status(401).json({message:"not found"})
    }
    if(session.userId==req.user._id || admin){
        if(messages){
            session.messages=messages;
        }
        // if(title)
        // {
        //     session.title=title;
        // }
        const MyUpdateSession=await session.save()
        return res.status(201).json({success:true,
            message:`session updated successfuly`,
            })
    }

return res.status(405).json({message:"unaouthorised"})

}

const deleteSession=async(req,res)=>{
  const {_id}=req.params
  const session=await Session.findById(_id).exec()
  const admin=await Admin.findById({_id:req.user._id})

if(!session){
  return res.status(401).json({message:"not found"})

  }
  if(admin){
      await session.deleteOne()
      return res.status(201).json({success:true,
          message:`one session deleted successfuly`
          })
      }
  return res.status(405).json({message:"unaouthorised"})
     }
const createMessage=async(req,res)=>{
    const {_id}=req.params
    console.log(_id);
    
const message = req.body;
    const session=await Session.findById(_id).exec()
    console.log(message.message);
    
// const admin=await Admin.findById({_id:req.user._id})
    if(!session){
    return res.status(401).json({message:"not found"})
    }
    if(/*session.userId==req?.user?._id || /*admin*/true){
                  console.log("hi");

        if(message){          
            if(message.message.content){
              
            session.messages=[...session.messages,message.message];
            console.log(session.messages);

        }
        if(/*session.userId==req.user._id*/true){
            message.fromUser=false
        }
        }
        const MyUpdateMessage=await session.save()
        return res.status(201).json({success:true,
            message:`message updated successfuly`,
            })
    }

return res.status(405).json({message:"unaouthorised"})

}
const getMessages = async (req, res) => {
    const { _id } = req.params; // session ID
    const session = await Session.findById(_id).lean();
    // const admin = await Admin.findById({ _id: req.user._id });

    if (!session) return res.status(404).json({ message: "session not found" });

    if (/*session.userId.toString() === req.user._id.toString() || admin*/true) {
        return res.status(200).json(session.messages);
    }

    return res.status(403).json({ message: "unauthorized" });
};
const getMessageById = async (req, res) => {
    const { _id, messageId } = req.params; // session ID and message ID
    const session = await Session.findById(_id).lean();
    const admin = await Admin.findById({ _id: req.user._id });

    if (!session) return res.status(404).json({ message: "session not found" });

    if (session.userId.toString() !== req.user._id.toString() && !admin) {
        return res.status(403).json({ message: "unauthorized" });
    }

    const message = session.messages.find(msg => msg._id.toString() === messageId);
    if (!message) return res.status(404).json({ message: "message not found" });

    return res.status(200).json(message);
};

const updateMessage = async (req, res) => {
    const { _id, messageId } = req.params; // _id של session, messageId של ההודעה
    const { content } = req.body;
  
    const session = await Session.findById(_id).exec();
  
    if (!session) return res.status(404).json({ message: "session not found" });
  
  
    const msg = session.messages.id(messageId);
    if (!msg) return res.status(404).json({ message: "message not found" });
  
    if (content) msg.content = content;
  
    await session.save();
  
    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      updatedMessage: msg,
    });
  };
  const deleteMessage = async (req, res) => {
    const { _id, messageId } = req.params; // session ID, message ID
    const session = await Session.findById(_id).exec();
    // const admin = await Admin.findById(req.user._id );
  
    if (!session) return res.status(404).json({ message: "session not found" });
const isUser = session.userId.toString() === req.user._id.toString();
    if (!isUser && !req.user.role==='admin') return res.status(403).json({ message: "unauthorized" });
  
    const msg = session.messages.id(messageId);
    if (!msg) return res.status(404).json({ message: "message not found" });
  
session.messages.pull({ _id: messageId });
    await session.save();
  
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  };
  const getUserSessions = async (req, res) => {

    try {
      
      const userId = req.user._id;
      console.log(userId);
      
      // const sessions = await Session.find({ userId }).lean();
  const sessions = await Session.find({ userId }).populate('userId', 'email').lean();
console.log(sessions);

      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

module.exports = {createSession,getSessions,getSessionById,getMessages,getMessageById,updateSession,deleteSession,createMessage,updateMessage,deleteMessage,getUserSessions}
