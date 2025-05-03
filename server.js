require("dotenv").config()
const mongoose=require("mongoose")
const conectDB=require("./config/dbConn.js")
const express=require("express")
const cors=require("cors")
const corsOptions=require("./config/corsOptions")
const PORT=process.env.PORT||2023
const app=express()
conectDB()
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("public"))
app.use('/api/users',require("./routes/UserRoute"))
// app.use('/api/auth',require("./routes/auths"))
// app.use('/api/functionToken',require("./middleware/verifyJWT"))



// app.get("",(req,res)=>{
//     res.status(404).send("not defind")
// })

// app.post('*',(req,res)=>{
//     res.status(404).send("not defind")
// })
// app.all((req, res) => {
//     res.status(404).send("not defined");
//   });
app.use((req,res)=>{
    res.status(404).send("not defind")
}) 
mongoose.connection.once("open",()=>{
    console.log("conect to mongoDB")
    app.listen(PORT,()=>{
        console.log(`running on port ${PORT}`)
    })
})
mongoose.connection.on("error",(err)=>{
    console.log("error")
    console.log(err)
})