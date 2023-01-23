import { getJobs, postJob } from "../controllers/jobs.js";

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

const jobsRouter = express.Router();

jobsRouter.post("/", isAuthenticated, postJob);
jobsRouter.get("/", isAuthenticated, getJobs);

export { jobsRouter };
