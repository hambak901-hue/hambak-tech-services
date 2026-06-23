import ExcelJS from "exceljs";
import path from "path";

async function generateMasterTracker() {
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

  // KPI Summary Cards Configuration
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

  // Categories Setup
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
  wsDash.getCell(`B${totalSalesRow}`).border = doubleBottomBorder;
  wsDash.getCell(`B${totalSalesRow}`).numFmt = '"₦"#,##0.00';

  // Online Gateway Matrix Section
  const startGatewayRow = totalSalesRow + 3;
  wsDash.getCell(`A${startGatewayRow}`).value = "Online Gateway Channel Matrix";
  wsDash.getCell(`A${startGatewayRow}`).font = fontSection;
  wsDash.getCell(`A${startGatewayRow+1}`).value = "Gateway";
  wsDash.getCell(`B${startGatewayRow+1}`).value = "Volume Processed";
  wsDash.getCell(`A${startGatewayRow+1}`).fill = wsDash.getCell(`B${startGatewayRow+1}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.lightBlue } };
  wsDash.getCell(`A${startGatewayRow+1}`).font = wsDash.getCell(`B${startGatewayRow+1}`).font = fontHeader;

  const gateways = ["Paystack", "Flutterwave", "Online Transfer", "Cash", "POS"];
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
  // TAB 2: SALES TRANSACTIONS
  // ==========================================================================
  const wsSales = workbook.addWorksheet("Sales Transactions", { views: [{ showGridLines: true }] });
  wsSales.getCell("A1").value = "DAILY SALES RECORD BOOK & WEB INTAKE LEDGER";
  wsSales.getCell("A1").font = fontSection;

  const headersSales = ["Date", "Invoice ID", "Customer Name", "Category", "Service/Product Details", "Quantity", "Amount (₦)", "Payment Method", "Handled By"];
  headersSales.forEach((h, i) => {
    const cell = wsSales.getCell(4, i + 1);
    cell.value = h
    cell.font = fontHeader;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.navy } };
    cell.alignment = { horizontal: "center" };
  });

  const sampleSales = [
    ["2026-06-20", "INV-001", "Alani Coker", "ICT Training Services", "Basic Computer Training (1 Month)", 1, 25000, "Cash", "Fatimoh"],
    ["2026-06-21", "INV-002", "Golden Heritage School", "Website Development", "School Website (Deposit)", 1, 300000, "Paystack", "Web Intake"],
    ["2026-06-21", "INV-003", "Chidi Business Hub", "Graphic Design", "Logo & Business Card Design", 1, 25000, "POS", "Aisha"],
    ["2026-06-22", "INV-004", "Grace Amadi", "Printing & Documentation", "Colour Printing & Spiral Binding", 12, 4500, "Cash", "Fatimoh"],
    ["2026-06-23", "INV-005", "Ibeju-Lekki Cooperative", "Ajo / Cooperative Management", "Monthly Setup Fee", 1, 50000, "Flutterwave", "Web Intake"]
  ];

  sampleSales.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      const cell = wsSales.getCell(5 + rIdx, cIdx + 1);
      cell.value = val;
      cell.font = fontBody;
      cell.border = thinBorder;
      if (cIdx + 1 === 7) cell.numFmt = '"₦"#,##0.00';
    });
  });

  // Setup blank data-entry framework grid cells
  for (let r = 5 + sampleSales.length; r <= 31; r++) {
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

  // Data Validation Rules Injection
  wsSales.dataValidations.add("D5:D31", {
    type: "list",
    allowBlank: true,
    formulae: ['"ICT Training Services,Website Development,Graphic Design,Computer Services,Printing & Documentation,Business Documentation,Digital Marketing,ICT Consultancy,VTU Services,POS Services,Other"']
  });

  wsSales.dataValidations.add("H5:H31", {
    type: "list",
    allowBlank: true,
    formulae: ['"Paystack,Flutterwave,Online Transfer,Cash,POS"']
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

  const sampleExpenses = [
    ["2026-06-15", "EXP-001", "Power & Fuel", "Fuel for Generator (Business Center)", 12000, "Cash", "Paid"],
    ["2026-06-18", "EXP-002", "Internet & Data", "Monthly Fiber Broadband Subscription", 25000, "Online Transfer", "Paid"],
    ["2026-06-20", "EXP-003", "Office Supplies", "A4 Paper Cartons (3)", 18500, "POS", "Paid"],
    ["2026-06-22", "EXP-004", "Repairs & Maintenance", "Printer Service & Toner Refill", 15000, "Cash", "Paid"]
  ];

  sampleExpenses.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      const cell = wsExp.getCell(5 + rIdx, cIdx + 1);
      cell.value = val;
      cell.font = fontBody;
      cell.border = thinBorder;
      if (cIdx + 1 === 5) cell.numFmt = '"₦"#,##0.00';
    });
  });

  for (let r = 5 + sampleExpenses.length; r <= 31; r++) {
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

  // Set scannable widths
  wsDash.getColumn("A").width = 35; wsDash.getColumn("B").width = 22;
  wsSales.getColumn("D").width = 25; wsSales.getColumn("E").width = 35; wsSales.getColumn("H").width = 20;

  const destPath = path.resolve("./Hambak_Tech_Services_Master_Account_Book.xlsx");
  await workbook.xlsx.writeFile(destPath);
  console.log(`🏆 EXCEL RUNTIME ENGINE GENERATED SPREADSHEET SUCCESSFULLY AT: ${destPath}`);
}

generateMasterTracker().catch(err => console.error("❌ Generation Stopped: ", err));
