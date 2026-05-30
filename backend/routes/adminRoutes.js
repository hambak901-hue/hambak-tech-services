/* ==========================================================
   GLOBAL SYSTEM ERROR EXCEPTION HANDLER
   ========================================================== */
const errorHandler = (err, req, res, next) => {
  console.error("System Exception Executed:", err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "An internal ecosystem operation exception occurred."
  });
};

export default errorHandler;
