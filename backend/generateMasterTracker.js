import ExcelJS from "exceljs";
import path from "path";
import mongoose from "mongoose";

// Import core collection schemas
import Order from "./models/order.js";
import Transaction from "./models/transaction.js";

async function generateMasterTracker() {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI variable is missing.");
    await mongoose.connect(process.env.MONGO_URI);
  }

  const workbook = new ExcelJS.Workbook();
  const FONT_NAME = "Segoe UI";
  
  const colors = {
    navy: "1B365D",
    lightBlue: "2B6CB0",
    darkTeal: "0D9488",
    zebra: "F7FAFC",
    summary: "EDF2F7",
    profitGreen: "E6FFFA",
    expenseRed: "FFF5F5"
  };

  const fontTitle = { name: FONT_NAME, size: 16, bold: true, color: { argb: "FFFFFF" } };
  const fontSection = { name: FONT_NAME, size: 12, bold: true, color: { argb: "1B365D" } };
  const fontHeader = { name: FONT_NAME, size: 11, bold: true, color: { argb: "FFFFFF" } };
  const fontBody = { name: FONT_NAME, size: 11, color: { argb: "000000" } };
  const fontBold = { name: FONT_NAME, size: 11, bold: true, color: { argb: "000000" } };

  const thinBorderSide = { style: "thin", color: { argb: "CBD5E0" } };
  const thinBorder = { top: thinBorderSide, left: thinBorderSide, bottom: thinBorderSide, right: thinBorderSide };
  const doubleBottomBorder = { top: thinBorderSide, bottom: { style: "double", color: { argb: "1B365D" } } };

  // ==========================================================================
  // TAB 1: BUSINESS DASHBOARD
  // ==========================================================================
  const wsDash = workbook.addWorksheet("Dashboard", { views: [{ showGridLines: true }] });
  
  wsDash.mergeCells("A1:M2");
  const tCell = wsDash.getCell("A1");
  tCell.value = "HAMBAK TECH & SERVICES – MAIN OPERATIONS REAL-TIME DASHBOARD";
  tCell.font = fontTitle;
  tCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
  tCell.alignment = { horizontal: "center", vertical: "middle" };

  // Core Corporate Financial Metrics Grid Setup
  const dashboardKpis = [
    { label: "🧮 Total Transactions", cell: "A4", valCell: "A5", formula: "=COUNTA('Transactions Log'!A5:A1000)" },
    { label: "💰 Total Amount", cell: "D4", valCell: "D5", formula: "=SUM('Transactions Log'!M5:M1000)", fmt: '"₦"#,##0.00' },
    { label: "💼 Total Commission", cell: "G4", valCell: "G5", formula: "=SUM('Transactions Log'!N5:N1000)", fmt: '"₦"#,##0.00' },
    { label: "Total Profit", cell: "J4", valCell: "J5", formula: "=SUM('Transactions Log'!V5:V1000)", fmt: '"₦"#,##0.00' }
  ];

  dashboardKpis.forEach(kpi => {
    wsDash.getCell(kpi.cell).value = kpi.label;
    wsDash.getCell(kpi.cell).font = fontBold;
    wsDash.getCell(kpi.cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.summary } };
    wsDash.getCell(kpi.cell).border = thinBorder;

    const vCell = wsDash.getCell(kpi.valCell);
    vCell.value = { formula: kpi.formula };
    vCell.font = { name: FONT_NAME, size: 14, bold: true, color: { argb: colors.navy } };
    vCell.border = thinBorder;
    if (kpi.fmt) vCell.numFmt = kpi.fmt;
  });

  // Top Category Dynamic Yield Block
  wsDash.getCell("A8").value = "📊 TOP CATEGORIES SUMMARY";
  wsDash.getCell("A8").font = fontSection;
  wsDash.getCell("A9").value = "Category";
  wsDash.getCell("B9").value = "Total Volume Sales (₦)";
  wsDash.getCell("A9").fill = wsDash.getCell("B9").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.lightBlue } };
  wsDash.getCell("A9").font = wsDash.getCell("B9").font = fontHeader;

  const categories = ["POS & Agency Banking", "Document & Design", "Specialized Services", "Computer Training", "Online & Educational", "Recharge & VTU"];
  categories.forEach((cat, idx) => {
    const row = 10 + idx;
    wsDash.getCell(`A${row}`).value = cat;
    wsDash.getCell(`A${row}`).border = thinBorder;
    wsDash.getCell(`B${row}`).value = { formula: `=SUMIF('Transactions Log'!E5:E1000, A${row}, 'Transactions Log'!M5:M1000)` };
    wsDash.getCell(`B${row}`).border = thinBorder;
    wsDash.getCell(`B${row}`).numFmt = '"₦"#,##0.00';
  });

  // ==========================================================================
  // TAB 2: TRANSACTIONS LOG (YOUR CORE FORMAT)
  // ==========================================================================
  const wsTx = workbook.addWorksheet("Transactions Log", { views: [{ showGridLines: true }] });
  
  const headersTx = [
    "Date", "Time", "Receipt_No", "Staff_Name", "Category", "Service_Name", "Type", "Unit", 
    "Quantity", "Entered_Amount", "Unit_Price", "POS_Charge", "Total_Amount", "Staff_Commission", 
    "Payment_Method", "Receipt_Delivery", "Customer_Phone", "Notes", "Real_Date", "Service_Group", 
    "Buying_Price (auto)", "Profit (auto)"
  ];

  headersTx.forEach((h, i) => {
    const cell = wsTx.getCell(4, i + 1);
    cell.value = h;
    cell.font = fontHeader;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
    cell.alignment = { horizontal: "center" };
  });

  // Fetch orders logged via web portal checkouts or staff form endpoints
  const dbOrders = await Order.find({}).populate("service").sort({ createdAt: -1 }).lean();

  dbOrders.forEach((order, idx) => {
    const r = 5 + idx;
    const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
    
    wsTx.getCell(`A${r}`).value = dateObj.toLocaleDateString("en-GB");
    wsTx.getCell(`B${r}`).value = dateObj.toLocaleTimeString("en-GB");
    wsTx.getCell(`C${r}`).value = `HMB-${dateObj.getFullYear()}${(dateObj.getMonth()+1).toString().padStart(2,'0')}-${100 + idx}`;
    wsTx.getCell(`D${r}`).value = order.handledBy || "Web Intake";
    wsTx.getCell(`E${r}`).value = order.service?.category || "Document & Design";
    wsTx.getCell(`F${r}`).value = order.service?.name || "Photocopy";
    wsTx.getCell(`G${r}`).value = "Fixed";
    wsTx.getCell(`H${r}`).value = "Job";
    wsTx.getCell(`I${r}`).value = order.quantity || 1;
    wsTx.getCell(`J${r}`).value = order.amount || 0;
    wsTx.getCell(`K${r}`).value = order.service?.price || 0;
    wsTx.getCell(`L${r}`).value = { formula: `=IF(E${r}="POS & Agency Banking", 100, 0)` }; // Automated tier tracking logic rules
    wsTx.getCell(`M${r}`).value = { formula: `=IF(L${r}>0, J${r}+L${r}, J${r})` };
    wsTx.getCell(`N${r}`).value = { formula: `=M${r}*0.02` }; // 2% Standardized System Commission Evaluation
    wsTx.getCell(`O${r}`).value = order.paymentMethod || "Wallet Balance";
    wsTx.getCell(`P${r}`).value = "WhatsApp";
    wsTx.getCell(`Q${r}`).value = order.customerPhone || "N/A";
    wsTx.getCell(`R${r}`).value = order.message || "Processed successfully.";
    wsTx.getCell(`S${r}`).value = dateObj.toLocaleDateString("en-US");
    wsTx.getCell(`T${r}`).value = "SERVICE";
    wsTx.getCell(`U${r}`).value = order.service?.buyingPrice || 0;
    wsTx.getCell(`V${r}`).value = { formula: `=M${r}-U${r}` };

    // Format Number Configurations
    ["J", "K", "L", "M", "N", "U", "V"].forEach(col => {
      wsTx.getCell(`${col}${r}`).numFmt = '"₦"#,##0.00';
      wsTx.getCell(`${col}${r}`).font = fontBody;
      wsTx.getCell(`${col}${r}`).border = thinBorder;
    });
  });

  // ==========================================================================
  // TAB 3: AJO / COOPERATIVE SECTION
  // ==========================================================================
  const wsAjo = workbook.addWorksheet("Ajo Section", { views: [{ showGridLines: true }] });
  wsAjo.getCell("A1").value = "COOPERATIVE DAILY CONTRIBUTION MANAGEMENT SYSTEM";
  wsAjo.getCell("A1").font = fontSection;

  const headersAjo = ["Collection Date", "Account ID", "Customer Name", "Phone Number", "Target Scheme Group", "Cycle Period", "Amount Deposited (₦)", "Staff Collector", "Balance Status"];
  headersAjo.forEach((h, i) => {
    const cell = wsAjo.getCell(4, i + 1);
    cell.value = h;
    cell.font = fontHeader;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkTeal } };
  });

  // Generate blank template space rows to allow managers to run offline sync checks easily
  for (let r = 5; r <= 20; r++) {
    for (let c = 1; c <= headersAjo.length; c++) {
      const cell = wsAjo.getCell(r, c);
      cell.border = thinBorder;
      if (c === 7) cell.numFmt = '"₦"#,##0.00';
    }
  }

  // Set scannable operational layout sizes
  wsDash.getColumn("A").width = 30; wsDash.getColumn("B").width = 25;
  wsTx.getColumn("E").width = 25; wsTx.getColumn("F").width = 35; wsTx.getColumn("M").width = 18;
  wsAjo.getColumn("C").width = 25; wsAjo.getColumn("E").width = 25;

  const destPath = path.resolve("./Hambak_Tech_Services_Master_Account_Book.xlsx");
  await workbook.xlsx.writeFile(destPath);
}

generateMasterTracker()
  .then(() => { process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
