import { Schema } from "mongoose";
import { companyDb } from "./mongoose-db/index.js";

const CandidateSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  name: { type: String, required: true, trim: true },
  jobSeeked: { type: Schema.Types.ObjectId, ref: "Job" },
});

export const Candidate = companyDb.model("Candidate", CandidateSchema);
