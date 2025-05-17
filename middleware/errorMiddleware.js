const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  console.error(`Error: ${err.message}`);
  console.error(`Status code: ${statusCode}`);
  console.error(`Request URL: ${req.originalUrl}`);
  console.error(`Request method: ${req.method}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(`Stack trace: ${err.stack}`);
  }

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
