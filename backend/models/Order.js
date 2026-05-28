import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

customerName:{
type:String,
required:true
},

customerEmail:{
type:String,
required:true
},

customerPhone:{
type:String,
required:true
},

service:{
type:mongoose.Schema.Types.ObjectId,
ref:"Service",
required:true
},

serviceName:{
type:String
},

quantity:{
type:Number,
default:1
},

amount:{
type:Number,
required:true
},

status:{
type:String,
enum:[
"Pending",
"Processing",
"Completed",
"Cancelled"
],
default:"Pending"
},

message:{
type:String
},

file:{
type:String
},

createdAt:{
type:Date,
default:Date.now
}

});

const Order =
mongoose.model(
"Order",
orderSchema
);

export default Order;