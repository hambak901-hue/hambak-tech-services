import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";

/* =========================
REGISTER USER
========================= */

export const registerUser = async (req, res) => {

try{

const {
name,
username,
email,
phone,
password
} = req.body;

/* CHECK REQUIRED FIELDS */

if(
!name ||
!username ||
!email ||
!phone ||
!password
){

return res.status(400).json({

success:false,
message:"Please fill all fields"

});

}

/* CHECK EXISTING USER */

const existingUser =
await User.findOne({

$or:[
{ email },
{ username }
]

});

if(existingUser){

return res.status(400).json({

success:false,
message:"User already exists"

});

}

/* CREATE USER */

const user =
await User.create({

name,
username,
email,
phone,
password

});

/* GENERATE TOKEN */

const token =
generateToken(
user._id,
user.role
);

/* RESPONSE */

res.status(201).json({

success:true,
message:"Registration successful",
token,

user:{
id:user._id,
name:user.name,
username:user.username,
email:user.email,
phone:user.phone,
role:user.role
}

});

}catch(error){

console.log(error);

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
LOGIN USER
========================= */

export const loginUser = async (req,res)=>{

try{

const {
email,
password
} = req.body;

/* CHECK INPUT */

if(!email || !password){

return res.status(400).json({

success:false,
message:"Please provide email and password"

});

}

/* FIND USER */

const user =
await User.findOne({ email });

if(!user){

return res.status(401).json({

success:false,
message:"Invalid credentials"

});

}

/* CHECK PASSWORD */

const isMatch =
await user.comparePassword(password);

if(!isMatch){

return res.status(401).json({

success:false,
message:"Invalid credentials"

});

}

/* GENERATE TOKEN */

const token =
generateToken(
user._id,
user.role
);

/* RESPONSE */

res.status(200).json({

success:true,
message:"Login successful",
token,

user:{
id:user._id,
name:user.name,
username:user.username,
email:user.email,
phone:user.phone,
role:user.role,
wallet:user.wallet
}

});

}catch(error){

console.log(error);

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
GET CURRENT USER
========================= */

export const getMe = async (req,res)=>{

try{

const user =
await User.findById(req.user._id)
.select("-password");

res.status(200).json({

success:true,
user

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
LOGOUT USER
========================= */

export const logoutUser = async (req,res)=>{

res.status(200).json({

success:true,
message:"Logged out successfully"

});

};