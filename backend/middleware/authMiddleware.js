import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================
PROTECT ROUTES
========================= */

export const protect = async (
req,
res,
next
)=>{

try{

let token;

/* GET TOKEN */

if(

req.headers.authorization &&

req.headers.authorization.startsWith(
"Bearer"
)

){

token =
req.headers.authorization.split(" ")[1];

}

/* NO TOKEN */

if(!token){

return res.status(401).json({

success:false,

message:"Not authorized"

});

}

/* VERIFY TOKEN */

const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);

/* FIND USER */

req.user =
await User.findById(decoded.id)
.select("-password");

/* USER NOT FOUND */

if(!req.user){

return res.status(401).json({

success:false,

message:"User not found"

});

}

next();

}catch(error){

console.log(error);

return res.status(401).json({

success:false,

message:"Token failed"

});

}

};

/* =========================
ADMIN ONLY
========================= */

export const adminOnly = (
req,
res,
next
)=>{

if(
req.user &&
req.user.role === "admin"
){

next();

}else{

return res.status(403).json({

success:false,

message:"Admin access only"

});

}

};