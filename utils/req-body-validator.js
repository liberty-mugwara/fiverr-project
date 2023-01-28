import { HttpError, throw400 } from "../errors/http.js";

export const validatePostBody = (req, requiredFields) => {
  const missingFields = requiredFields.filter((f) => !req.body[f]);

  if (missingFields.length) {
    throw400(`The following fields are required: ${missingFields.join(", ")}`);
  }
};
