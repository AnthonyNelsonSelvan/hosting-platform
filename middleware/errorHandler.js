const errorHandler = (err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected field",
        message: `Expected field name not found. check your input key.`,
      });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File to large",
        message:
          "File too large, Limit is 50MB incase any problem reach out to us.",
      });
    }
  }
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
};

export default errorHandler;
