const express=require("express")
const router=express.Router()
const passport = require("passport");
const {login,register,loginWithGoogle}=require("../controllers/AuthController.js")
router.post("/login",login)
router.post("/register",register)
// התחלת התחברות עם גוגל
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// נקודת חזרה מגוגל
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  loginWithGoogle
);
module.exports=router