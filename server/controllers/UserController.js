const User = require("../models/User");
const Admin = require("../models/Admin");


const getUsers=async(req,res)=>{
  const users=await User.find().lean()
  if(!users)
  {
    res.status(500).json({ error: error.message });
  }

  return res.status(200).json(users);

}

const getUserById=async(req,res)=>{
const {_id}=req.params
const user=await User.findById(_id).lean()
const admin=await Admin.findById({_id:req.user._id})
if(!user)
{
  return  res.status(401).json({message:"not found"})
}
if(user._id==req.user._id || admin){
  
    return res.json(user)
}
return res.status(405).json({message:"unaouthorisedid"})

}
const updateUser=async(req,res)=>{
  const {_id}=req.params
    const {password,username,email}=req.body
    const user=await User.findById(_id).exec()
const admin=await Admin.findById({_id:req.user._id})
    if(!user){
    return res.status(401).json({message:"not found"})
    }
    console.log(user._id);
console.log(req.user._id);
    if(user._id==req.user._id || admin){
        // if(password){
        //     user.password=password
        // }
        if(username){
            user.username=username;
        }
        if(email)
        {
            user.email=email;
        }
        const MyUpdateUser=await user.save()
        return res.status(201).json({success:true,
            message:`user ${user.name}updated successfuly`,
            })
    }

return res.status(405).json({message:"unaouthorised"})

}

const deleteUser=async(req,res)=>{
  const {_id}=req.params
  const user=await User.findById(_id).exec()
  const admin=await Admin.findById({_id:req.user._id})

if(!user){
  return res.status(401).json({message:"not found"})

  }
  if(user._id==req.user._id || admin){
      await user.deleteOne()
      return res.status(201).json({success:true,
          message:`one user deleted successfuly`
          })
      }
  return res.status(405).json({message:"unaouthorised"})
     }


module.exports = {getUsers,getUserById,updateUser,deleteUser}

