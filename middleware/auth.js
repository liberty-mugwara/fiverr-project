import { HttpError } from "../errors/http.js";
// import { HttpError } from "../errors/http.js";
import { getTokenUser } from "../auth/index.js";

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {(error?:Error)=>void} next
 */
export const setAuthContext = async (req, res, next) => {
  const user = await getTokenUser(req);
  res.locals.user = user;
  res.locals.authenticated = !!user;
  next();
};

// must be used after setAuthContext
export const isAuthenticated = (req, res, next) => {
  if (res.locals.authenticated) {
    next();
  } else {
    res.status(401);
    res.json("You are not authorized, please login");
  }
};
