
const jwt=require('jsonwebtoken')
const sseVerifyJWT=(req,res,next)=>{
   
    const token=req.query.token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded)=>{
            if(err) return res.status(403).json({message:'forbidden'})
            req.user=decoded

            next()
        }
    )
}   
module.exports=sseVerifyJWT