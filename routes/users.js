import { createUser, getUsers, me } from "../controllers/users.js";

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.post("/", createUser);
usersRouter.get("/me", isAuthenticated, me);
usersRouter.get("/", isAuthenticated, getUsers);

export { usersRouter };
