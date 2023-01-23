import { Company } from "../company.js";
import { Schema } from "mongoose";
import { userDb } from "../mongoose-db/index.js";

const UserSchema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    // employees
    isStaff: { type: Boolean, default: false },
    isCandidate: { type: Boolean, default: false },
    scope: String,
    company: { type: Schema.Types.ObjectId, ref: Company },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    email: {
      type: String,
      trim: true,
      index: { unique: true },
    },
    jwt: String,
  },
  {
    toObject: {
      transform: function (_doc, ret, _options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.jwt;
        return ret;
      },
    },
    toJSON: {
      transform: function (_doc, ret, _options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.jwt;
        return ret;
      },
    },
  }
);

export const User = userDb.model("User", UserSchema);
