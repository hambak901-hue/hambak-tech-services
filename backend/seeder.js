import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Service from "./models/Service.js";

dotenv.config();

const servicesData = [
  {
    _id: new mongoose.Types.ObjectId(), // Generates an internal valid ObjectId wrapper
    id: "static-training", // Links perfectly with frontend static route handles
    title: "Computer Training & ICT Education",
    category: "ICT Training Services",
    status: "active",
    pricing: [
      { item: "Basic Computer Training (1 Month)", priceDisplay: "25,000" },
      { item: "Advanced Computer Training (2 Months)", priceDisplay: "45,000" },
      { item: "Microsoft Word Training", priceDisplay: "15,000" },
      { item: "Microsoft Excel Training", priceDisplay: "20,000" },
      { item: "Microsoft PowerPoint Training", priceDisplay: "15,000" },
      { item: "Internet & Email Training", priceDisplay: "10,000" },
      { item: "Complete ICT Certificate Course", priceDisplay: "75,000" },
      { item: "One-on-One Training", priceDisplay: "10,000 per session" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-web",
    title: "Website Development",
    category: "Website Development",
    status: "active",
    pricing: [
      { item: "Landing Page Website", priceDisplay: "80,000 - 150,000" },
      { item: "Business Website", priceDisplay: "200,000 - 400,000" },
      { item: "School Website", priceDisplay: "300,000 - 600,000" },
      { item: "E-commerce Website", priceDisplay: "500,000 - 1,500,000" },
      { item: "Website Redesign", priceDisplay: "100,000 - 300,000" },
      { item: "Annual Website Maintenance", priceDisplay: "100,000+" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-graphics",
    title: "Graphic Design Services",
    category: "Graphic Design",
    status: "active",
    pricing: [
      { item: "Logo Design", priceDisplay: "15,000 - 50,000" },
      { item: "Business Card Design", priceDisplay: "10,000" },
      { item: "Flyer Design", priceDisplay: "15,000" },
      { item: "Banner Design", priceDisplay: "20,000" },
      { item: "Poster Design", priceDisplay: "15,000" },
      { item: "Certificate Design", priceDisplay: "10,000" },
      { item: "Social Media Design", priceDisplay: "5,000 per design" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-hardware",
    title: "Computer Services & Hardware Engineering",
    category: "Computer Services",
    status: "active",
    pricing: [
      { item: "Software Installation", priceDisplay: "5,000 - 15,000" },
      { item: "Windows Installation", priceDisplay: "10,000 - 20,000" },
      { item: "Virus Removal", priceDisplay: "5,000 - 15,000" },
      { item: "System Maintenance", priceDisplay: "10,000 - 30,000" },
      { item: "Data Recovery", priceDisplay: "20,000 - 100,000" },
      { item: "Computer Upgrade", priceDisplay: "Inspection Required" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-printing",
    title: "Printing & Documentation Services",
    category: "Printing & Documentation",
    status: "active",
    pricing: [
      { item: "Typing (per page)", priceDisplay: "300 - 1,000" },
      { item: "Black & White Printing", priceDisplay: "100 per page" },
      { item: "Colour Printing", priceDisplay: "300 - 500 per page" },
      { item: "Photocopy", priceDisplay: "50 - 100 per page" },
      { item: "Scanning", priceDisplay: "200 per page" },
      { item: "Lamination", priceDisplay: "500 - 2,000" },
      { item: "Spiral Binding", priceDisplay: "1,500 - 5,000" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-documentation",
    title: "Business Registration & Documentation",
    category: "Business Documentation",
    status: "active",
    pricing: [
      { item: "CV Writing", priceDisplay: "5,000 - 15,000" },
      { item: "Cover Letter", priceDisplay: "3,000 - 5,000" },
      { item: "Business Plan", priceDisplay: "50,000 - 300,000" },
      { item: "Business Proposal", priceDisplay: "30,000 - 150,000" },
      { item: "Company Profile", priceDisplay: "30,000 - 100,000" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-marketing",
    title: "Online Marketing & Advertising Setup",
    category: "Digital Marketing",
    status: "active",
    pricing: [
      { item: "Social Media Setup", priceDisplay: "15,000" },
      { item: "Monthly Social Media Management", priceDisplay: "50,000 - 200,000" },
      { item: "Facebook Advertising Setup", priceDisplay: "20,000" },
      { item: "WhatsApp Business Setup", priceDisplay: "10,000" },
      { item: "Digital Marketing Consultation", priceDisplay: "20,000 per session" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-consultancy",
    title: "ICT Consultancy Infrastructure",
    category: "ICT Consultancy",
    status: "active",
    pricing: [
      { item: "ICT Consultation", priceDisplay: "20,000/hr" },
      { item: "Business Digital Setup", priceDisplay: "100,000+" },
      { item: "School ICT Setup", priceDisplay: "Based on Project" },
      { item: "Company ICT Setup", priceDisplay: "Based on Project" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-vtu",
    title: "VTU Automated Operations",
    category: "VTU Services",
    status: "active",
    pricing: [
      { item: "Airtime Purchase", priceDisplay: "Standard Rate" },
      { item: "Data Subscription", priceDisplay: "Standard Rate" },
      { item: "Electricity Bill Payment", priceDisplay: "₦100 - ₦500 Service Charge" },
      { item: "Cable TV Subscription", priceDisplay: "₦100 - ₦500 Service Charge" },
      { item: "Exam PIN Sales", priceDisplay: "Market Rate" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-nin",
    title: "POS Agency Terminal Operations", // Serves as the matching link for NIN context lookups
    category: "POS Services",
    status: "active",
    pricing: [
      { item: "₦1,000 - ₦5,000 Transaction Fee", priceDisplay: "₦100" },
      { item: "₦6,000 - ₦10,000 Transaction Fee", priceDisplay: "₦200" },
      { item: "₦11,000 - ₦20,000 Transaction Fee", priceDisplay: "₦300" },
      { item: "₦21,000 - ₦50,000 Transaction Fee", priceDisplay: "₦500" },
      { item: "Above ₦50,000 Transaction Fee", priceDisplay: "1%" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-ajo",
    title: "Ajo & Cooperative Management Systems",
    category: "Ajo / Cooperative Management",
    status: "active",
    pricing: [
      { item: "Daily Savings Collection", priceDisplay: "Negotiable" },
      { item: "Monthly Cooperative Management", priceDisplay: "5% - 10% Admin Fee" },
      { item: "Group Savings Administration", priceDisplay: "Negotiable" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-wallet",
    title: "Wallet & Fintech Platform",
    category: "Future Services",
    status: "coming-soon",
    pricing: [
      { item: "Digital Core Infrastructure Engine", priceDisplay: "Coming Soon" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-elearning",
    title: "E-Learning Platform",
    category: "Future Services",
    status: "coming-soon",
    pricing: [
      { item: "Online Knowledge Portal Ecosystem", priceDisplay: "Coming Soon" }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    id: "static-analytics",
    title: "Analytics & Reporting Engine",
    category: "Future Services",
    status: "coming-soon",
    pricing: [
      { item: "Deep Metrics Ledger Framework", priceDisplay: "Coming Soon" }
    ]
  }
];

const importData = async () => {
  try {
    // FIXED: Wait until database pipeline verifies live connection state successfully
    await connectDB();
    
    // Wipe clean old mismatch schemas safely
    await Service.deleteMany();
    
    // Insert new clean structures
    await Service.insertMany(servicesData);
    
    console.log("🏆 HAMBAK DATA MATRIX SEEDED TO MONGO SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Data ingestion stopped: ${error.message}`);
    process.exit(1);
  }
};

// Fire the data seeder chain safely
importData();
