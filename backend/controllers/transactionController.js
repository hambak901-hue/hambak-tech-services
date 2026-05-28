import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/* =========================
CREATE TRANSACTION
========================= */

export const createTransaction =
async (req,res)=>{

try{

const {

type,
amount,
description,
paymentMethod

} = req.body;

/* GENERATE REFERENCE */

const reference =
`HTS-${Date.now()}`;

/* CREATE TRANSACTION */

const transaction =
await Transaction.create({

user:req.user._id,

type,

amount,

description,

paymentMethod,

reference,

status:"successful"

});

/* WALLET OPERATIONS */

if(type === "wallet_funding"){

await User.findByIdAndUpdate(

req.user._id,

{
$inc:{
wallet:Number(amount)
}
}

);

}

/* WITHDRAWAL */

if(type === "withdrawal"){

await User.findByIdAndUpdate(

req.user._id,

{
$inc:{
wallet:-Number(amount)
}
}

);

}

/* RESPONSE */

res.status(201).json({

success:true,

message:
"Transaction created successfully",

transaction

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

/* =========================
GET MY TRANSACTIONS
========================= */

export const getMyTransactions =
async (req,res)=>{

try{

const transactions =
await Transaction.find({

user:req.user._id

})
.sort({createdAt:-1});

res.status(200).json({

success:true,

count:transactions.length,

transactions

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

/* =========================
GET SINGLE TRANSACTION
========================= */

export const getSingleTransaction =
async (req,res)=>{

try{

const transaction =
await Transaction.findById(
req.params.id
);

if(!transaction){

return res.status(404).json({

success:false,

message:
"Transaction not found"

});

}

res.status(200).json({

success:true,

transaction

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

/* =========================
ADMIN: GET ALL TRANSACTIONS
========================= */

export const getAllTransactions =
async (req,res)=>{

try{

const transactions =
await Transaction.find()
.populate(
"user",
"name email"
)
.sort({createdAt:-1});

res.status(200).json({

success:true,

count:transactions.length,

transactions

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};