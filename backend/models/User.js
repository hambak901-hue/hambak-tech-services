import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
USER SCHEMA
========================= */

const userSchema = new mongoose.Schema({

/* BASIC INFO */

name:{
type:String,
required:true,
trim:true
},

username:{
type:String,
required:true,
unique:true,
trim:true
},

email:{
type:String,
required:true,
unique:true,
trim:true
},

phone:{
type:String,
required:true
},

/* AUTH */

password:{
type:String,
required:true,
minlength:6
},

role:{
type:String,
enum:[
"user",
"student",
"admin"
],
default:"user"
},

/* PROFILE */

avatar:{
type:String,
default:""
},

bio:{
type:String,
default:""
},

address:{
type:String,
default:""
},

/* WALLET */

wallet:{
type:Number,
default:0
},

/* STATUS */

isVerified:{
type:Boolean,
default:false
},

isBlocked:{
type:Boolean,
default:false
},

/* PASSWORD RESET */

resetPasswordToken:String,

resetPasswordExpire:Date

},
{
timestamps:true
});

/* =========================
HASH PASSWORD
========================= */

userSchema.pre(
"save",
async function(next){

if(!this.isModified("password")){

return next();

}

this.password =
await bcrypt.hash(
this.password,
10
);

next();

}
);

/* =========================
COMPARE PASSWORD
========================= */

userSchema.methods.comparePassword =
async function(password){

return await bcrypt.compare(
password,
this.password
);

};

/* =========================
GENERATE JWT TOKEN
========================= */

userSchema.methods.generateToken =
function(){

return jwt.sign(

{
id:this._id,
role:this.role
},

process.env.JWT_SECRET,

{
expiresIn:
process.env.JWT_EXPIRE
}

);

};

/* =========================
EXPORT MODEL
========================= */

const User =
mongoose.model(
"User",
userSchema
);

export default User;