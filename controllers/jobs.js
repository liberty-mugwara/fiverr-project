import { Candidate, Job } from "../models/index.js";
import { throw400, throw403 } from "../errors/http.js";

import { authorize } from "../auth/index.js";
import { validatePostBody } from "../utils/index.js";

export const postJob = async (req, res, next) => {
  try {
    authorize(res.locals.user, ["admin"]);

    const { name, description } = req.body;
    validatePostBody(req, ["name", "description"]);

    const existingJob = await Job.findOne({ name });

    if (existingJob) throw400("Job already exists");
    // create job
    const job = await (
      await Job.create({
        name,
        description,
        company: res.locals.user.companyId,
      })
    ).populate("company");

    res.status(201);
    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (_req, res, next) => {
  try {
    const requiredScopes = ["admin"];
    authorize(res.locals.user, requiredScopes);

    const jobs = await Job.find({
      company: res.locals.user.companyId,
    })
      .populate("company")
      .exec();

    res.status(200);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

export const jobAddCandidate = async (req, res, next) => {
  try {
    authorize(res.locals.user, ["admin", "staff"]);
    const jobId = req.params.jobId;

    const { name, email } = req.body;
    validatePostBody(req, ["name", "email"]);

    const job = await Job.findById(jobId);

    if (!job) throw400("Invalid Job id");

    if (job.company.toString() !== res.locals.user.companyId) {
      throw403(
        "Forbidden: You are not allowed to create a candidate for this job. The job is not from your company."
      );
    }

    const existingCandidateForJob = await Candidate.findOne({
      email,
      jobSeeked: job._id,
    });

    if (existingCandidateForJob) {
      throw400(
        `Candidate with this email already exists for the job posting: ${job.name}`
      );
    }

    const candidate = await (
      await Candidate.create({
        email,
        name,
        jobSeeked: job._id,
      })
    ).populate("jobSeeked");

    res.status(201);
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
};

export const jobListCandidates = async (req, res, next) => {
  try {
    authorize(res.locals.user, ["admin", "staff"]);
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);

    if (!job) throw400("Invalid Job id");

    if (job.company.toString() !== res.locals.user.companyId) {
      throw403(
        "Forbidden: You are not allowed to access this job. The job is not from your company."
      );
    }

    const candidates = await Candidate.find({
      jobSeeked: job._id,
    });

    res.status(200);
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
};
