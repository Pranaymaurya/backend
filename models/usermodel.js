import mongoose from "mongoose";

const user=mongoose.Schema(
    {
        name:{type:String},
        email:{type:String},
        password:{type:String},
    }
)
const employemodule=mongoose.model('user',user)
export default employemodule;