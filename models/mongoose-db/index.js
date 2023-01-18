import mongoose from "mongoose";
import { timestampsPlugin } from "./plugins/index.js";

mongoose.plugin(timestampsPlugin);

// mongoose connection --start--

export const userDb = await mongoose
  .createConnection(process.env.USER_DB_URL || "")
  .asPromise()
  .then((db) => {
    db.once("open", () =>
      console.log(`MongoDb connected on url: ${process.env.USER_DB_URL}`)
    );
    return db;
  });

export const companyDb = await mongoose
  .createConnection(process.env.COMPANY_DB_URL || "")
  .asPromise()
  .then((db) => {
    db.once("open", () =>
      console.log(`MongoDb connected on url: ${process.env.COMPANY_DB_URL}`)
    );
    return db;
  });
