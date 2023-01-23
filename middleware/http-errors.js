export const handleHttpErrors = (error, _req, res, _next) => {
  res.status(error.statusCode || 500);
  res.json(error.message || "Internal Serve Error.");
};
