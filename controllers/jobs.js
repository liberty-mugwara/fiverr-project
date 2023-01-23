import { HttpError } from "../errors/http.js";
import { Job } from "../models/index.js";
import { authorize } from "../auth/index.js";
import { validatePostBody } from "../utils/index.js";

export const postJob = async (req, res, next) => {
  try {
    authorize(res.locals.user, ["admin"]);

    const { name, description } = req.body;
    validatePostBody(req, ["name", "description"]);

    const existingJob = await Job.findOne({ name });

    if (existingJob) {
      throw new HttpError({ message: `Job already exists`, statusCode: 400 });
    }

    const createData = {
      name,
      description,
      company: res.locals.user.companyId,
    };

    // create job
    const job = await (await Job.create(createData)).populate("company");

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
    }).populate("company");

    res.status(200);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};
