const bcrypt=require("bcrypt")
const jwt= require('jsonwebtoken')
const Admin = require("../models/Admin")
const adminLogin=async(req,res)=>{
    const {username, email, password} = req.body
    if (!email || !password ||!username) 
        return res.status(400).json({message:'required field is missing'})
    const admin=await Admin.findOne({email}).lean()
    if(admin){
        const match = await bcrypt.compare(password,admin.password)
        if(match){
            const userInfo= {_id:admin._id,username:admin.username,email:admin.email,role: 'admin'}
            const token = jwt.sign(userInfo,process.env.ACCESS_TOKEN_SECRET)
            return res.json({token:token})
        }
        else
            return res.status(401).json({message:"unauthorized"})
    }
    else
        res.status(401).json({message:"unauthorized"})
}
const adminRegister=async(req,res)=>{
    const {username,password,email} = req.body
    if (!email || !username || !password) {
        return res.status(400).json({message:'required field is missing'})
        }
    if(password!=process.env.ADMIN)
    {
        return res.status(400).json({message:'failed'})
    }
    const duplicate=await Admin.findOne({email}).lean()
    if(duplicate)
       return res.status(409).json({message:"duplicate email"})
    const hashedPwd = await bcrypt.hash(password, 10)
    const userObject= {username,password:hashedPwd,email}
    const admin = await Admin.create(userObject)
    if(admin){
       return res.status(201).json({success:true,
            message:`admin ${admin.username} created successfuly`,
            })
    }
    else
        return res.status(400).json({message:"failed"})
}
module.exports={adminLogin,adminRegister}