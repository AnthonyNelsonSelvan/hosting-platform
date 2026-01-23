const errorHandler = (err, req, res, next) => {
  if (err.name === "MulterError" && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected field",
      message: `Expected field name not found. check your input key.`,
    });
  }
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
};

export default errorHandler;
