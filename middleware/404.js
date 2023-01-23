export const handle404 = (_req, res, _next) => {
  res.status(404);
  res.json("Invalid Path!");
};
