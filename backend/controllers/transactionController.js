import https from "https";
import Transaction from "../models/Transaction.js";
import User from "../models/userModel.js";

/* ==========================================================
   PAYSTACK MATRIX: INITIALIZE DEPOSIT
   ========================================================== */
export const initializePaystackDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Please provide a valid deposit amount." });
    }

    // Paystack processes currency inputs in Kobo values (Multiply by 100)
    const paystackAmount = Math.round(Number(amount) * 100); 
    const reference = `HTS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Safely capture frontend web origins to prevent routing back into API ports
    const frontendOrigin = req.headers.origin || `${req.protocol}://${req.get("host")}`;

    const params = JSON.stringify({
      email: req.user.email,
      amount: paystackAmount,
      reference,
      callback_url: `${frontendOrigin}/pages/dashboard.html`
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    // Initialize clean secure request execution pipeline
    const paystackReq = https.request(options, (paystackRes) => {
      let data = '';

      paystackRes.on('data', (chunk) => { data += chunk; });

      paystackRes.on('end', async () => {
        try {
          const responseData = JSON.parse(data);

          if (responseData.status && responseData.data) {
            // Register a baseline 'pending' record into your MongoDB cluster safely
            await Transaction.create({
              user: req.user._id || req.user.id,
              type: "deposit", // Synced directly with your main query array enum types
              amount: Number(amount),
              reference,
              description: "Paystack online wallet funding session initial entry",
              paymentMethod: "card",
              status: "pending"
            });

            return res.status(200).json({
              success: true,
              authorization_url: responseData.data.authorization_url,
              reference
            });
          } else {
            return res.status(400).json({
              success: false,
              message: responseData.message || "Paystack initialization rejected parameters."
            });
          }
        } catch (innerError) {
          return res.status(500).json({ success: false, message: "Error parsing checkout gateway payload response." });
        }
      });
    });

    paystackReq.on('error', (error) => {
      console.error("Paystack API Pipeline Exception:", error);
      return res.status(500).json({ success: false, message: "External network gateway communication failed." });
    });

    paystackReq.write(params);
    paystackReq.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   PAYSTACK MATRIX: VERIFY DEPOSIT & FUND WALLET
   ========================================================== */
export const verifyPaystackDeposit = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, message: "A transactional reference token parameter is required." });
    }

    const existingTx = await Transaction.findOne({ reference });
    if (!existingTx) {
      return res.status(404).json({ success: false, message: "Transaction record not found in system logs." });
    }

    if (existingTx.status === "successful") {
      return res.status(200).json({ success: true, message: "Transaction already processed and funded." });
    }

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const verifyReq = https.request(options, (verifyRes) => {
      let data = '';

      verifyRes.on('data', (chunk) => { data += chunk; });

      verifyRes.on('end', async () => {
        try {
          const responseData = JSON.parse(data);

          if (responseData.status && responseData.data.status === "success") {
            // Update data log parameters locally
            existingTx.status = "successful";
            await existingTx.save();

            // Locate user profile and credit wallet matrices cleanly
            const user = await User.findById(existingTx.user);
            if (user) {
              user.wallet = (user.wallet || 0) + existingTx.amount;
              await user.save();
            }

            return res.status(200).json({
              success: true,
              message: "Wallet funded successfully through Paystack checkout channels.",
              newWalletBalance: user ? user.wallet : 0
            });
          } else {
            existingTx.status = "failed";
            await existingTx.save();
            return res.status(400).json({ success: false, message: "Payment confirmation processing was rejected by Paystack." });
          }
        } catch (innerErr) {
          return res.status(500).json({ success: false, message: "Error unpacking verification values response." });
        }
      });
    });

    verifyReq.on('error', (error) => {
      return res.status(500).json({ success: false, message: "Verification processing request loop runtime fault." });
    });

    verifyReq.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   CREATE MANUAL TRANSACTION / CORE ROUTINE
   ========================================================== */
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, paymentMethod } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ success: false, message: "Amount and transactional type tracking required." });
    }

    const userId = req.user._id || req.user.id;
    const userProfile = await User.findById(userId);
    
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile context not found." });
    }
    
    /* OVERDRAFT GUARD PROTECTION ROUTINE */
    if ((type === "withdrawal" || type === "service_payment" || type === "vtu" || type === "printing" || type === "nin") && (userProfile.wallet || 0) < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance to perform operation."
      });
    }

    const reference = `HTS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount: Number(amount),
      description: description || `${type} processing record`,
      paymentMethod: paymentMethod || "wallet",
      reference,
      status: "successful"
    });

    /* UPDATE BALANCES DYNAMICALLY IN DB */
    if (type === "wallet_funding" || type === "deposit" || type === "refund") {
      await User.findByIdAndUpdate(userId, { $inc: { wallet: Number(amount) } });
    } else {
      await User.findByIdAndUpdate(userId, { $inc: { wallet: -Number(amount) } });
    }

    res.status(201).json({
      success: true,
      message: "Transaction logged and balance synchronized successfully",
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   GET CURRENT LOGGED IN USER LOGS
   ========================================================== */
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ADMIN: MONITOR ALL SYSTEM TRANSFERS
   ========================================================== */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
