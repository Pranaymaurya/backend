import e from "express";
import employemodule from "./models/usermodel.js";
const router=e.Router()

 const register=router.post('/register',(res,req)=>{
    employemodule.create(req.body)
    .then((data)=>{
        res.send(data)
        })
    .catch((err)=>console.log(err))

})

export default register;
