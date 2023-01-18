import { login, logout } from "../controllers/auth.js";

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/logout", isAuthenticated, logout);

export { authRouter };
