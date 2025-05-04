const Admin=require("../models/Admin")


const verifyAdmin=(req,res,next)=>{
   
    if (req.user.role !== 'admin') {
                return res.status(403).json({message:'forbiddenad'})
    }
        
        
    
      next()
}  

module.exports=verifyAdmin