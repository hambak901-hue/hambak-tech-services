import mongoose from "mongoose";

// Strict schema validation for your entire 18-pillar array + packages
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, default: "active" }, // active, coming-soon
  pricing: [{
    item: { type: String, required: true },
    priceDisplay: { type: String, required: true }
  }]
}, { timestamps: true });

const packageSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  price: { type: String, required: true },
  features: [String]
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

const seedHambakData = async () => {
  try {
    const serviceCount = await Service.countDocuments();
    if (serviceCount > 0) {
      console.log("✅ Hambak services are already securely deployed in MongoDB.");
      return;
    }

    console.log("🚀 Initializing Hambak Tech & Services Data Arrays...");

    const servicesData = [
      {
        title: "Computer Training & ICT Education",
        category: "ICT Training Services",
        pricing: [
          { item: "Basic Computer Training (1 Month)", priceDisplay: "25000" },
          { item: "Advanced Computer Training (2 Months)", priceDisplay: "45000" },
          { item: "Microsoft Word Training", priceDisplay: "15000" },
          { item: "Microsoft Excel Training", priceDisplay: "20000" },
          { item: "Microsoft PowerPoint Training", priceDisplay: "15000" },
          { item: "Internet & Email Training", priceDisplay: "10000" },
          { item: "Complete ICT Certificate Course", priceDisplay: "75000" },
          { item: "One-on-One Training (Per Session)", priceDisplay: "10000" }
        ]
      },
      {
        title: "Website Development",
        category: "Website Development",
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
        title: "Graphic Design Services",
        category: "Graphic Design",
        pricing: [
          { item: "Logo Design", priceDisplay: "15,000 - 50,000" },
          { item: "Business Card Design", priceDisplay: "10,000" },
          { item: "Flyer Design", priceDisplay: "15,000" },
          { item: "Banner Design", priceDisplay: "20,000" },
          { item: "Poster Design", priceDisplay: "15,000" },
          { item: "Certificate Design", priceDisplay: "10,000" },
          { item: "Social Media Design (Per Layout)", priceDisplay: "5,000" }
        ]
      },
      {
        title: "Software, Database & Digital Solutions",
        category: "ICT & Technology Services",
        pricing: [
          { item: "Business Management Systems", priceDisplay: "Custom Quote" },
          { item: "School Management Systems", priceDisplay: "Custom Quote" },
          { item: "Inventory Systems", priceDisplay: "Custom Quote" },
          { item: "Customer Management Systems", priceDisplay: "Custom Quote" }
        ]
      },
      {
        title: "Computer Services & Hardware Engineering",
        category: "Computer Services",
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
        title: "Business Registration & Documentation",
        category: "Business Documentation",
        pricing: [
          { item: "Business Name Registration Assistance", priceDisplay: "Based on Scope" },
          { item: "Company Documentation & Setup", priceDisplay: "Based on Scope" },
          { item: "Business Plan Writing", priceDisplay: "50,000 - 300,000" },
          { item: "Business Proposal Layouts", priceDisplay: "30,000 - 150,000" },
          { item: "Company Profile Creation", priceDisplay: "30,000 - 100,000" }
        ]
      },
      {
        title: "Printing & Documentation Services",
        category: "Printing & Documentation",
        pricing: [
          { item: "Typing (Per Page)", priceDisplay: "300 - 1,000" },
          { item: "Black & White Printing (Per Page)", priceDisplay: "100" },
          { item: "Colour Printing (Per Page)", priceDisplay: "300 - 500" },
          { item: "Photocopy (Per Page)", priceDisplay: "50 - 100" },
          { item: "Scanning (Per Page)", priceDisplay: "200" },
          { item: "Lamination", priceDisplay: "500 - 2,000" },
          { item: "Spiral Binding", priceDisplay: "1,500 - 5,000" },
          { item: "Project Work Preparation", priceDisplay: "Negotiable" }
        ]
      },
      {
        title: "CV & Professional Documents",
        category: "Business Documentation",
        pricing: [
          { item: "CV/Resume Writing", priceDisplay: "5,000 - 15,000" },
          { item: "Cover Letter Writing", priceDisplay: "3,000 - 5,000" },
          { item: "Application Letters", priceDisplay: "3,000" }
        ]
      },
      {
        title: "VTU Services",
        category: "VTU Services",
        pricing: [
          { item: "Airtime Purchase", priceDisplay: "Standard Rate" },
          { item: "Data Subscription", priceDisplay: "Standard Rate" },
          { item: "Electricity Bill Payment", priceDisplay: "100 - 500 Service Charge" },
          { item: "Cable TV Subscription", priceDisplay: "100 - 500 Service Charge" },
          { item: "Exam PIN Sales (WAEC/NECO)", priceDisplay: "Market Rate" }
        ]
      },
      {
        title: "POS & Payment Services",
        category: "POS Services",
        pricing: [
          { item: "Withdrawal/Deposit (1,000 - 5,000)", priceDisplay: "100" },
          { item: "Withdrawal/Deposit (6,000 - 10,000)", priceDisplay: "200" },
          { item: "Withdrawal/Deposit (11,000 - 20,000)", priceDisplay: "300" },
          { item: "Withdrawal/Deposit (21,000 - 50,000)", priceDisplay: "500" },
          { item: "Withdrawal/Deposit (Above 50,000)", priceDisplay: "1%" }
        ]
      },
      {
        title: "Cooperative & Savings Management",
        category: "Ajo / Cooperative Management",
        pricing: [
          { item: "Daily Savings Collection (Ajo/Ososu)", priceDisplay: "Negotiable" },
          { item: "Monthly Cooperative Management", priceDisplay: "5% - 10% Admin Fee" },
          { item: "Group Savings Administration", priceDisplay: "Negotiable" }
        ]
      },
      {
        title: "Online Marketing & Advertising Setup",
        category: "Digital Marketing",
        pricing: [
          { item: "Social Media Channels Setup", priceDisplay: "15,000" },
          { item: "Monthly Social Media Management", priceDisplay: "50,000 - 200,000" },
          { item: "Facebook/Instagram Ads Setup", priceDisplay: "20,000" },
          { item: "WhatsApp Business Ecosystem Setup", priceDisplay: "10,000" },
          { item: "Digital Marketing Consultation", priceDisplay: "20,000 Per Session" }
        ]
      },
      {
        title: "Content Creation Services",
        category: "Digital Marketing",
        pricing: [
          { item: "Business Content Writing", priceDisplay: "Negotiable" },
          { item: "Product Copy & Descriptions", priceDisplay: "Negotiable" }
        ]
      },
      {
        title: "ICT Consultancy",
        category: "ICT Consultancy",
        pricing: [
          { item: "ICT Advisory Consultation", priceDisplay: "20,000/hr" },
          { item: "Business Digital Setup Transformation", priceDisplay: "100,000+" },
          { item: "School/Company Setup", priceDisplay: "Based on Project Scope" }
        ]
      },
      {
        title: "Business Consultancy",
        category: "ICT Consultancy",
        pricing: [
          { item: "Startup Guidance & Planning", priceDisplay: "Negotiable" },
          { item: "Business Process Improvement", priceDisplay: "Negotiable" }
        ]
      },
      {
        title: "Wallet & Fintech Platform",
        category: "Future Services",
        status: "coming-soon",
        pricing: [{ item: "Fintech Core Integration", priceDisplay: "Coming Soon" }]
      },
      {
        title: "E-Learning Platform",
        category: "Future Services",
        status: "coming-soon",
        pricing: [{ item: "LMS Core Engine Development", priceDisplay: "Coming Soon" }]
      },
      {
        title: "Analytics & Reporting Engine",
        category: "Future Services",
        status: "coming-soon",
        pricing: [{ item: "Analytics Tracking Dashboard", priceDisplay: "Coming Soon" }]
      }
    ];

    const packagesData = [
      {
        packageName: "Starter Package",
        price: "50,000",
        features: ["Logo Design", "Business Card Design", "Social Media Setup"]
      },
      {
        packageName: "Business Growth Package",
        price: "250,000",
        features: ["Business Website", "Logo Design", "Company Profile", "Social Media Setup"]
      },
      {
        packageName: "Premium Digital Package",
        price: "500,000+",
        features: ["Business Website", "Branding Materials", "Digital Marketing Setup", "Staff Training", "Business Consultation"]
      },
      {
        packageName: "Enterprise Package",
        price: "Custom Quote",
        features: ["Full Business Automation", "Website + Core Database", "E-learning Platform", "Wallet/Payment System", "Analytics Dashboard"]
      }
    ];

    await Service.insertMany(servicesData);
    await Package.insertMany(packagesData);

    console.log("🏆 ALL 18 HAMBAK CORES & SYSTEM BUNDLES INITIALIZED LIVE SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Data seeding routine halted:", error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📡 MongoDB Cluster Hooked Up: ${conn.connection.host}`);
    
    // Fire the seed validation immediately upon clean engine connection
    await seedHambakData();
  } catch (error) {
    console.error(`❌ Connection error recorded: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
