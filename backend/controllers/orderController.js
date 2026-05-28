import Order from "../models/Order.js";
import Service from "../models/Service.js";

/* =========================
CREATE ORDER
========================= */

export const createOrder = async (req,res)=>{

try{

const serviceData =
await Service.findById(req.body.service);

if(!serviceData){

return res.status(404).json({

success:false,
message:"Service not found"

});

}

const order =
await Order.create({

customerName:req.body.customerName,

customerEmail:req.body.customerEmail,

customerPhone:req.body.customerPhone,

service:req.body.service,

quantity:req.body.quantity,

amount:req.body.amount,

message:req.body.message,

file:req.file
? `/uploads/${req.file.filename}`
: ""

});

res.status(201).json({

success:true,
message:"Order placed successfully",
order

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
GET ALL ORDERS
========================= */

export const getOrders = async (req,res)=>{

try{

const orders =
await Order.find()
.populate("service")
.sort({createdAt:-1});

res.status(200).json({

success:true,
count:orders.length,
orders

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
UPDATE ORDER STATUS
========================= */

export const updateOrderStatus = async (req,res)=>{

try{

const order =
await Order.findById(
req.params.id
);

if(!order){

return res.status(404).json({

success:false,
message:"Order not found"

});

}

order.status =
req.body.status
|| order.status;

await order.save();

res.status(200).json({

success:true,
message:"Order updated",
order

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
DELETE ORDER
========================= */

export const deleteOrder = async (req,res)=>{

try{

const order =
await Order.findById(
req.params.id
);

if(!order){

return res.status(404).json({

success:false,
message:"Order not found"

});

}

await order.deleteOne();

res.status(200).json({

success:true,
message:"Order deleted"

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};