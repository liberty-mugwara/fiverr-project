import { authenticateLogin, generateAccessToken } from "../auth/index.js";

import { HttpError } from "../errors/http.js";
import { User } from "../models/index.js";

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateLogin({ email, password });
    const token = await generateAccessToken(user);
    res.status(200);
    res.json({ token });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json(err.message);
    } else {
      res.status(500);
      res.json("Internal Serve Error.");
    }
  }
};

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const logout = async (req, res) => {
  try {
    const token = (req.get("Authorization") || "").replace("Bearer", "").trim();
    const user = await User.findById(res.locals.user._id);
    const otherJwts = user.jwts.filter((v) => v !== token);
    user.jwts = otherJwts;
    await user.save();
    res.status(200);
    res.json("Successfully logged out");
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json(err.message);
    } else {
      res.status(500);
      res.json("Internal Serve Error.");
    }
  }
};
