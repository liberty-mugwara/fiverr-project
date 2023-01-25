import {
  getJobs,
  jobAddCandidate,
  jobListCandidates,
  postJob,
} from "../controllers/jobs.js";

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

const jobsRouter = express.Router();

jobsRouter.post("/", isAuthenticated, postJob);
jobsRouter.get("/", isAuthenticated, getJobs);

jobsRouter.post("/:jobId/candidates", isAuthenticated, jobAddCandidate);
jobsRouter.get("/:jobId/candidates", isAuthenticated, jobListCandidates);

export { jobsRouter };
