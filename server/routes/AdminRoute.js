const express=require("express")
const router=express.Router()
const {getAdminInfo, getAdmin, updateAdmin ,getAdminById,getAdminByMailAndPassword}=require("../controllers/AdminController")

router.get("/getAdmin",getAdmin)
router.get("/getAdminInfo",getAdminInfo)
router.post("/updateAdmin",updateAdmin)
router.get("/getAdminById",getAdminById)
router.post("/getAdminByMailAndPassword",getAdminByMailAndPassword)

module.exports=router
