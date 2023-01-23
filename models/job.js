import { Schema } from "mongoose";
import { companyDb } from "./mongoose-db/index.js";

const JobSchema = new Schema({
  name: {
    type: String,
    trim: true,
    index: { unique: true },
  },
  description: { type: String, trim: true },
  company: { type: Schema.Types.ObjectId, ref: "Company" },
});

export const Job = companyDb.model("Job", JobSchema);
