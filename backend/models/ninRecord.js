import mongoose from "mongoose";

const ninRecordSchema = new mongoose.Schema(
    {
        actionType: {
            type: String,
            required: true,
            enum: ["modification", "retrieval", "preEnroll"],
            index: true
        },
        computedCost: {
            type: Number,
            required: true,
            default: 0
        },
        tierLevel: {
            type: String,
            required: true,
            default: "retailer"
        },
        referenceCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        // Captures data from the forms safely
        trackingId: {
            type: String,
            trim: true
        },
        modificationType: {
            type: String,
            enum: ["name", "dob", "phone", ""]
        },
        fullName: {
            type: String,
            trim: true
        },
        firstName: {
            type: String,
            trim: true
        },
        surname: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        stateOfOrigin: {
            type: String,
            trim: true
        },
        deliveryMethod: {
            type: String,
            enum: ["standard", "premium", ""]
        },
        requirements: {
            type: String,
            trim: true
        },
        // Securely logs the file path pointer in your uploads directory
        legalDocPath: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        }
    },
    {
        timestamps: true // Automatically injects createdAt and updatedAt fields
    }
);

const NinRecord = mongoose.model("NinRecord", ninRecordSchema);

export default NinRecord;
