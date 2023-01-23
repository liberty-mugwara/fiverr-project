import { HttpError } from "../errors/http.js";

export const validatePostBody = (req, requiredFields) => {
  const missingFields = requiredFields.filter((f) => !req.body[f]);

  if (missingFields.length) {
    throw new HttpError({
      message: `The following fields are required: ${missingFields.join(", ")}`,
      statusCode: 400,
    });
  }
};
