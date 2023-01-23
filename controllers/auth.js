import { authenticateLogin, generateAccessToken } from "../auth/index.js";

import { HttpError } from "../errors/http.js";
import { User } from "../models/index.js";

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateLogin({ email, password });
    const token = await generateAccessToken(user);
    res.status(200);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const logout = async (req, res, next) => {
  try {
    const token = (req.get("Authorization") || "").replace("Bearer", "").trim();
    const user = await User.findById(res.locals.user._id);
    user.jwt = "";
    await user.save();
    res.status(200);
    res.json("Successfully logged out");
  } catch (error) {
    next(error);
  }
};
