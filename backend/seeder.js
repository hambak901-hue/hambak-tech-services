import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Define a safe inline Schema structure to ensure strict data validation
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  subServices: [String],
  status: { type: String, default: "active" }, // active, coming-soon
  basePrice: { type: Number, default: 0 }
}, { timestamps: true });

// Fallback to avoid model compilation collisions
const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

dotenv.config();

const servicesData = [
  // 1. ICT & Technology Services
  {
    title: "Computer Training & ICT Education",
    category: "ICT & Technology",
    subServices: ["Basic Computer Training", "Advanced Computer Training", "ICT Certificate Courses", "Microsoft Word/Excel/PowerPoint", "Digital Skills Training", "Computer Appreciation for Beginners"]
  },
  {
    title: "Website Development",
    category: "ICT & Technology",
    subServices: ["Business Website Design", "E-commerce Development", "Personal Portfolio Websites", "School & Religious Institution Portals", "Website Maintenance & Redesign"]
  },
  {
    title: "Graphic Design Services",
    category: "ICT & Technology",
    subServices: ["Logo Design", "Business Card & Flyer Design", "Banner & Poster Layouts", "Certificate Design", "Company Branding Materials"]
  },
  {
    title: "Software & Digital Solutions",
    category: "ICT & Technology",
    subServices: ["Business Management Systems", "School Management Systems", "Inventory Trackers", "Customer Management Systems", "Database Solutions"]
  },
  {
    title: "Computer Services & Hardware Engineering",
    category: "ICT & Technology",
    subServices: ["Computer & Software Installation", "System Troubleshooting & Maintenance", "Virus Removal", "Data Backup & Recovery", "Hardware Upgrades"]
  },

  // 2. Business Support Services
  {
    title: "Business Registration & Documentation",
    category: "Business Support",
    subServices: ["Business Name Registration Assistance", "Company Documentation", "Business Proposal & Profile Creation", "Company Portfolio Design", "Contract Documentation"]
  },
  {
    title: "Printing & Documentation Services",
    category: "Business Support",
    subServices: ["Document Typing & Formatting", "Premium Printing & Photocopying", "Scanning & Lamination", "Spiral Binding", "Academic Project Work Preparation"]
  },
  {
    title: "CV & Professional Documents",
    category: "Business Support",
    subServices: ["CV & Resume Writing", "Cover Letter Writing", "Application Letters", "Professional Corporate Profiles"]
  },

  // 3. Financial & Agency Services
  {
    title: "VTU Services",
    category: "Financial & Agency",
    subServices: ["Airtime Purchase", "Data Subscription", "Electricity Bill Payment", "Cable TV Subscription", "Exam PIN Sales (WAEC/NECO)"]
  },
  {
    title: "POS & Payment Services",
    category: "Financial & Agency",
    subServices: ["Cash Withdrawal & Deposit", "Fund Transfers", "Utility Bill Payments", "Agency Banking Operations"]
  },
  {
    title: "Cooperative & Savings Management",
    category: "Financial & Agency",
    subServices: ["Ajo/Ososu Savings Scheme Automation", "Cooperative Savings Management", "Financial Contribution Programs", "Group Savings Administration"]
  },

  // 4. Digital Marketing Services
  {
    title: "Online Marketing & Advertising",
    category: "Digital Marketing",
    subServices: ["Social Media Management", "Business Promotion & Growth", "Facebook & Instagram Marketing", "WhatsApp Business Ecosystem Setup", "Brand Awareness Campaigns"]
  },
  {
    title: "Content Creation",
    category: "Digital Marketing",
    subServices: ["Business Content Writing", "Product Descriptions", "Social Media Copywriting", "Promotional Materials"]
  },

  // 5. Consultancy Services
  {
    title: "ICT Consultancy",
    category: "Consultancy",
    subServices: ["Technology Advisory", "Business Digital Transformation", "ICT Setup for Schools & Businesses", "Digital Strategy Planning"]
  },
  {
    title: "Business Consultancy",
    category: "Consultancy",
    subServices: ["Startup Guidance", "Business Development & Planning", "Digital Business Setup", "Business Process Improvement"]
  },

  // 6. Future Services (Flagged as coming-soon)
  {
    title: "Wallet & Fintech Platform",
    category: "Future Tech",
    status: "coming-soon",
    subServices: ["Digital Wallet Services", "Wallet Funding & Internal Transfers", "Transaction History Tracking", "Digital Payments"]
  },
  {
    title: "E-Learning Platform",
    category: "Future Tech",
    status: "coming-soon",
    subServices: ["Online Courses", "Video Training Modules", "Student Performance Dashboards", "Digital Certificate Issuance"]
  },
  {
    title: "Analytics & Reporting Engine",
    category: "Future Tech",
    status: "coming-soon",
    subServices: ["Business Intelligence Analytics", "Customer Behavior Analytics", "Sales Performance Reports"]
  }
];

const importData = async () => {
  try {
    await connectDB();
    
    // Clear out existing sample placeholder records safely
    await Service.deleteMany();
    
    // Insert the 18 clean Hambak operational data structures
    await Service.insertMany(servicesData);
    
    console.log("🏆 HAMBAK ENTERPRISE SERVICE CORES REGISTERED IN MONGO CLUSTER SUCCESSFULLY!");
    process.exit();
  } catch (error) {
    console.error(`Error with data ingestion layout: ${error.message}`);
    process.exit(1);
  }
};

importData();
                  
