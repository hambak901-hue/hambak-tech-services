import User from "../models/User.js";

/* =========================
GET ALL USERS
========================= */

export const getUsers = async (req,res)=>{

try{

const users =
await User.find()
.select("-password")
.sort({createdAt:-1});

res.status(200).json({

success:true,
count:users.length,
users

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
DELETE USER
========================= */

export const deleteUser = async (req,res)=>{

try{

const user =
await User.findById(
req.params.id
);

if(!user){

return res.status(404).json({

success:false,
message:"User not found"

});

}

await user.deleteOne();

res.status(200).json({

success:true,
message:"User deleted successfully"

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};