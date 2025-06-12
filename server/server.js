require("dotenv").config()
const mongoose=require("mongoose")
const conectDB=require("./config/dbConn")
const express=require("express")
const cors=require("cors")
const corsOptions=require("./config/corsOptions")
const PORT=process.env.PORT||2023
const app=express()
const rateLimit = require("express-rate-limit");

// יצירת מגביל בקשות כללי
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // מגביל ל־100 בקשות לכל IP ב־15 דקות
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// להוסיף את זה לפני שאר המסלולים
app.use(limiter);

conectDB()
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("public"))
const routes = require("./service/routes");

app.use('/api/admin',require("./routes/AdminRoute"))
app.use('/api/users',require("./routes/UserRoute"))
app.use('/api/session',require("./routes/SessionRoute"))
app.use('/api/feedback',require("./routes/SessionFeedbackRoute"))
app.use('/api/auth',require("./routes/AuthRoute"))
app.use('/api/autha',require("./routes/AdminAuthRoute"))
app.use('/api/functionToken',require("./middleware/verifyJWT"))
app.use('/api/files', require('./routes/UploadRoute'));
app.use('/api/records', require('./routes/RecordRoute'));

app.use("/api", routes);

app.use((req,res)=>{
    res.status(404).send("404-not defind")
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