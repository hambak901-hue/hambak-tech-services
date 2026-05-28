import mongoose from "mongoose";

/* =========================
SERVICE SCHEMA
========================= */

const serviceSchema = new mongoose.Schema({

  /* BASIC INFO */

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: [
      "NIN",
      "Printing",
      "VTU",
      "Training",
      "Registration",
      "POS",
      "Design",
      "Internet",
      "Gaming",
      "Business",
      "Other"
    ]
  },

  /* PRICE */

  price: {
    type: Number,
    required: true,
    default: 0
  },

  discountPrice: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    default: "NGN"
  },

  /* IMAGE */

  image: {
    type: String,
    default: ""
  },

  /* STATUS */

  available: {
    type: Boolean,
    default: true
  },

  featured: {
    type: Boolean,
    default: false
  },

  /* DETAILS */

  duration: {
    type: String,
    default: ""
  },

  requirements: {
    type: [String],
    default: []
  },

  benefits: {
    type: [String],
    default: []
  },

  /* ADMIN */

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{
  timestamps: true
});

/* =========================
INDEXES
========================= */

serviceSchema.index({
  category: 1
});

serviceSchema.index({
  featured: 1
});

/* =========================
MODEL
========================= */

const Service =
  mongoose.model(
    "Service",
    serviceSchema
  );

export default Service;