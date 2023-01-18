import { Schema } from "mongoose";
import { companyDb } from "./mongoose-db/index.js";

const CompanySchema = new Schema({
  name: {
    type: String,
    trim: true,
    index: { unique: true },
  },
});

export const Company = companyDb.model("Company", CompanySchema);
