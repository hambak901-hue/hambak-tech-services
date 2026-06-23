import ExcelJS from "exceljs";
import path from "path";
import mongoose from "mongoose";

// Import your database models
import Order from "./models/order.js";
import Service from "./models/service.js";
import Transaction from "./models/transaction.js";

async function generateMasterTracker() {
  // Ensure we are connected to MongoDB before running calculations
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing from your .env configuration.");
    }
    await mongoose.connect(process.env.MONGO_URI);
  }

  const workbook = new ExcelJS.Workbook();
  
  // Style Configuration Matrix
  const FONT_NAME = "Segoe UI";
  const colors = {
    navy: "1B365D",
    lightBlue: "2B6CB0",
    zebra: "F7FAFC",
    summary: "EDF2F7",
    profitGreen: "E6FFFA",
    expenseRed: "FFF5F5"
  };

  const fontTitle = { name: FONT_NAME, size: 16, bold: true, color: { argb: "FFFFFF" } };
  const fontSection = { name: FONT_NAME, size: 12, bold: true, color: { argb: "1B365D" } };
  const fontHeader = { name: FONT_NAME, size: 11, bold: true, color: { argb: "FFFFFF" } };
  const fontBody = { name: FONT_NAME, size: 11, bold: false, color: { argb: "000000" } };
  const fontBold = { name: FONT_NAME, size: 11, bold: true, color: { argb: "000000" } };

  const thinBorderSide = { style: "thin", color: { argb: "CBD5E0" } };
  const thinBorder = { top: thinBorderSide, left: thinBorderSide, bottom: thinBorderSide, right: thinBorderSide };
  const doubleBottomBorder = { top: thinBorderSide, bottom: { style: "double", color: { argb: "1B365D" } } };

  // ==========================================================================
  // TAB 1: DASHBOARD
  // ==========================================================================
  const wsDash = workbook.addWorksheet("Dashboard", { views: [{ showGridLines: true }] });
  
  wsDash.mergeCells("A1:G2");
  const titleCell = wsDash.getCell("A1");
  titleCell.value = "HAMBAK TECH & SERVICES - MASTER MANAGEMENT DASHBOARD";
  titleCell.font = fontTitle;
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // KPI Summary Cards Configuration (Linked dynamically to transaction sheets)
  const kpis = [
    { labelCell: "B4", numCell: "B5", label: "TOTAL REVENUE", formula: "='Sales Transactions'!G32", color: colors.profitGreen },
    { labelCell: "D4", numCell: "D5", label: "TOTAL EXPENSES", formula: "='Expense Transactions'!E32", color: colors.expenseRed },
    { labelCell: "F4", numCell: "F5", label: "NET PROFIT", formula: "=B5-D5", color: colors.summary }
  ];

  kpis.forEach(kpi => {
    const lCell = wsDash.getCell(kpi.labelCell);
    lCell.value = kpi.label;
    lCell.font = { name: FONT_NAME, size: 9, bold: true, color: { argb: "4A5568" } };
    lCell.alignment = { horizontal: "center", vertical: "middle" };
    lCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: kpi.color } };
    lCell.border = thinBorder;

    const nCell = wsDash.getCell(kpi.numCell);
    nCell.value = { formula: kpi.formula };
    nCell.font = { name: FONT_NAME, size: 20, bold: true, color: { argb: "1B365D" } };
    nCell.alignment = { horizontal: "center", vertical: "middle" };
    nCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: kpi.color } };
    nCell.border = thinBorder;
    nCell.numFmt = '"₦"#,##0.00';
  });

  wsDash.getCell("A8").value = "Revenue By Category";
  wsDash.getCell("A8").font = fontSection;
  wsDash.getCell("A9").value = "Category";
  wsDash.getCell("B9").value = "Total Sales (₦)";
  wsDash.getCell("A9").fill = wsDash.getCell("B9").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.lightBlue } };
  wsDash.getCell("A9").font = wsDash.getCell("B9").font = fontHeader;

  const categories = [
    "ICT Training Services", "Website Development", "Graphic Design", 
    "Computer Services", "Printing & Documentation", "Business Documentation",
    "Digital Marketing", "ICT Consultancy", "VTU Services", "POS Services", "Other"
  ];

  categories.forEach((cat, i) => {
    const rowNum = 10 + i;
    wsDash.getCell(`A${rowNum}`).value = cat;
    wsDash.getCell(`A${rowNum}`).font = fontBody;
    wsDash.getCell(`A${rowNum}`).border = thinBorder;

    wsDash.getCell(`B${rowNum}`).value = { formula: `=SUMIF('Sales Transactions'!D$5:D$30, A${rowNum}, 'Sales Transactions'!G$5:G$30)` };
    wsDash.getCell(`B${rowNum}`).font = fontBody;
    wsDash.getCell(`B${rowNum}`).border = thinBorder;
    wsDash.getCell(`B${rowNum}`).numFmt = '"₦"#,##0.00';
  });

  const totalSalesRow = 10 + categories.length;
  wsDash.getCell(`A${totalSalesRow}`).value = "Total Calculated";
  wsDash.getCell(`A${totalSalesRow}`).font = fontBold;
  wsDash.getCell(`B${totalSalesRow}`).value = { formula: `=SUM(B10:B${totalSalesRow - 1})` };
  wsDash.getCell(`B${totalSalesRow}`).font = fontBold;
  wsDash.getCell(`B${totalSalesRow}).border = doubleBottomBorder;
  wsDash.getCell(`B${totalSalesRow}`).numFmt = '"₦"#,##0.00';

  // Online Gateway Revenue Performance Tracker
  const startGatewayRow = totalSalesRow + 3;
  wsDash.getCell(`A${startGatewayRow}`).value = "Online Gateway Channel Matrix";
  wsDash.getCell(`A${startGatewayRow}`).font = fontSection;
  wsDash.getCell(`A${startGatewayRow+1}`).value = "Gateway";
  wsDash.getCell(`B${startGatewayRow+1}`).value = "Volume Processed";
  wsDash.getCell(`A${startGatewayRow+1}`).fill = wsDash.getCell(`B${startGatewayRow+1}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.lightBlue } };
  wsDash.getCell(`A${startGatewayRow+1}`).font = wsDash.getCell(`B${startGatewayRow+1}`).font = fontHeader;

  const gateways = ["Paystack", "Flutterwave", "Online Transfer", "Wallet Balance", "Cash", "POS"];
  gateways.forEach((g, i) => {
    const rNum = startGatewayRow + 2 + i;
    wsDash.getCell(`A${rNum}`).value = g;
    wsDash.getCell(`A${rNum}`).font = fontBody;
    wsDash.getCell(`A${rNum}`).border = thinBorder;

    wsDash.getCell(`B${rNum}`).value = { formula: `=SUMIF('Sales Transactions'!H$5:H$30, A${rNum}, 'Sales Transactions'!G$5:G$30)` };
    wsDash.getCell(`B${rNum}`).font = fontBody;
    wsDash.getCell(`B${rNum}`).border = thinBorder;
    wsDash.getCell(`B${rNum}`).numFmt = '"₦"#,##0.00';
  });

  // ==========================================================================
  // TAB 2: LIVE SALES TRANSACTIONS INTAKE
  // ==========================================================================
  const wsSales = workbook.addWorksheet("Sales Transactions", { views: [{ showGridLines: true }] });
  wsSales.getCell("A1").value = "DAILY SALES RECORD BOOK & WEB INTAKE LEDGER";
  wsSales.getCell("A1").font = fontSection;

  const headersSales = ["Date", "Invoice ID", "Customer Name", "Category", "Service/Product Details", "Quantity", "Amount (₦)", "Payment Method", "Handled By"];
  headersSales.forEach((h, i) => {
    const cell = wsSales.getCell(4, i + 1);
    cell.value = h;
    cell.font = fontHeader;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
    cell.alignment = { horizontal: "center" };
  });

  // FETCH ALL SUCCESSFUL ORDERS FROM DATABASE & POPULATE SPREADSHEET
  const dbOrders = await Order.find({}).populate("service").sort({ createdAt: -1 }).limit(26).lean();

  dbOrders.forEach((order, rIdx) => {
    const dateStr = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : "";
    const invoiceId = `HTS-${order._id.toString().slice(-5).toUpperCase()}`;
    const category = order.service ? order.service.category : "Other";
    const serviceName = order.service ? order.service.name : "Custom Operations Request";
    const paymentChannel = order.amount > 0 ? "Wallet Balance" : "System Dynamic Sync";

    const rowData = [
      dateStr,
      invoiceId,
      order.customerName || "Anonymous Hub User",
      category,
      serviceName,
      order.quantity || 1,
      order.amount || 0,
      paymentChannel,
      "Web Intake"
    ];

    rowData.forEach((val, cIdx) => {
      const cell = wsSales.getCell(5 + rIdx, cIdx + 1);
      cell.value = val;
      cell.font = fontBody;
      cell.border = thinBorder;
      if (cIdx + 1 === 7) cell.numFmt = '"₦"#,##0.00';
    });
  });

  // PAD OUT UNUSED CELLS SO THE INPUT BOOK IS PRE-STYLED FOR MANUAL ENTRY TOO
  for (let r = 5 + dbOrders.length; r <= 31; r++) {
    for (let c = 1; c <= headersSales.length; c++) {
      const cell = wsSales.getCell(r, c);
      cell.border = thinBorder;
      cell.font = fontBody;
      if (c === 7) cell.numFmt = '"₦"#,##0.00';
    }
  }

  wsSales.getCell("F32").value = "TOTAL REVENUE";
  wsSales.getCell("F32").font = fontBold;
  wsSales.getCell("G32").value = { formula: "=SUM(G5:G31)" };
  wsSales.getCell("G32").font = fontBold;
  wsSales.getCell("G32").border = doubleBottomBorder;
  wsSales.getCell("G32").numFmt = '"₦"#,##0.00';

  // Add Interactive Cell Validations for Dropdowns
  wsSales.dataValidations.add("D5:D31", {
    type: "list",
    allowBlank: true,
    formulae: ['"ICT Training Services,Website Development,Graphic Design,Computer Services,Printing & Documentation,Business Documentation,Digital Marketing,ICT Consultancy,VTU Services,POS Services,Other"']
  });

  wsSales.dataValidations.add("H5:H31", {
    type: "list",
    allowBlank: true,
    formulae: ['"Paystack,Flutterwave,Online Transfer,Wallet Balance,Cash,POS"']
  });

  // ==========================================================================
  // TAB 3: EXPENSE TRANSACTIONS
  // ==========================================================================
  const wsExp = workbook.addWorksheet("Expense Transactions", { views: [{ showGridLines: true }] });
  wsExp.getCell("A1").value = "COMPANY EXPENSES RECORD BOOK";
  wsExp.getCell("A1").font = fontSection;

  const headersExp = ["Date", "Expense ID", "Category", "Description / Purpose", "Amount (₦)", "Payment Method", "Status"];
  headersExp.forEach((h, i) => {
    const cell = wsExp.getCell(4, i + 1);
    cell.value = h;
    cell.font = fontHeader;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
    cell.alignment = { horizontal: "center" };
  });

  // Dynamically load any negative mutations or cash flow reversals logged
  const dbRefunds = await Transaction.find({ type: "refund" }).sort({ createdAt: -1 }).limit(10).lean();
  
  dbRefunds.forEach((ref, rIdx) => {
    const dateStr = ref.createdAt ? new Date(ref.createdAt).toISOString().split('T')[0] : "";
    const rowData = [
      dateStr,
      ref.reference || "REFUND",
      "Other",
      ref.description || "Order Cancellation Refund Reversal",
      ref.amount || 0,
      ref.paymentMethod || "Wallet",
      "Paid"
    ];

    rowData.forEach((val, cIdx) => {
      const cell = wsExp.getCell(5 + rIdx, cIdx + 1);
      cell.value = val;
      cell.font = fontBody;
      cell.border = thinBorder;
      if (cIdx + 1 === 5) cell.numFmt = '"₦"#,##0.00';
    });
  });

  for (let r = 5 + dbRefunds.length; r <= 31; r++) {
    for (let c = 1; c <= headersExp.length; c++) {
      const cell = wsExp.getCell(r, c);
      cell.border = thinBorder;
      cell.font = fontBody;
      if (c === 5) cell.numFmt = '"₦"#,##0.00';
    }
  }

  wsExp.getCell("D32").value = "TOTAL EXPENSES";
  wsExp.getCell("D32").font = fontBold;
  wsExp.getCell("E32").value = { formula: "=SUM(E5:E31)" };
  wsExp.getCell("E32").font = fontBold;
  wsExp.getCell("E32").border = doubleBottomBorder;
  wsExp.getCell("E32").numFmt = '"₦"#,##0.00';

  wsExp.dataValidations.add("C5:C31", {
    type: "list",
    allowBlank: true,
    formulae: ['"Rent & Utilities,Internet & Data,Power & Fuel,Office Supplies,Staff Salaries,Marketing,Repairs & Maintenance,Other"']
  });

  // Column width formatting adjustments
  wsDash.getColumn("A").width = 35; wsDash.getColumn("B").width = 22;
  wsSales.getColumn("D").width = 25; wsSales.getColumn("E").width = 35; wsSales.getColumn("H").width = 20;

  const destPath = path.resolve("./Hambak_Tech_Services_Master_Account_Book.xlsx");
  await workbook.xlsx.writeFile(destPath);
}

// Ensure execution triggers correctly when called by child processes
generateMasterTracker()
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
