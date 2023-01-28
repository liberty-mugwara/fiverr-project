import { Company, User } from "../models/index.js";
import { authorize, generateScope } from "../auth/index.js";

import { HttpError } from "../errors/http.js";
import { generateAccessToken } from "../auth/index.js";
import { hash } from "bcrypt";

export const createUser = async (req, res, next) => {
  let company;
  try {
    const { name, email, password, companyName } = req.body;

    // TODO: validate and normalize email

    let isAdmin = false;
    let isStaff = false;
    let createCompany = false;
    company = await Company.findById(res.locals.user?.companyId);
    let requiredScopes = ["admin", "staff"];

    if (!company) {
      createCompany = true;
      isAdmin = true;
      requiredScopes = []; // The first user for a company doesn't need auth
    } else {
      // if company, the user creating this user must be authenticated
      if (!res.locals.authenticated) {
        res.status(401);
        return res.json("You are not authorized, please login");
      }

      authorize(res.locals.user, requiredScopes, {
        allScopesRequired: false,
      });

      // check if user is creating user from same company

      if (res.locals.user.companyId !== company._id.toString()) {
        res.status(403);
        return res.json("Forbidden: You are not allowed to create this user");
      }
      console.log("=====>", res.locals);
      if (
        res.locals.user.roles.includes("admin") ||
        res.locals.user.roles.includes("staff")
      ) {
        isStaff = true;
      } else {
        res.status(403);
        return res.json("Forbidden: You are not allowed to create this user");
      }
    }

    const requiredFields = ["name", "email", "password", "companyName"];
    if (!createCompany) requiredFields.pop();
    const missingFields = requiredFields.filter((f) => !req.body[f]);

    if (missingFields.length) {
      throw new HttpError({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
        statusCode: 400,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new HttpError({
        message: `User with email ${email} already exists`,
        statusCode: 400,
      });
    }

    if (createCompany) company = await Company.create({ name: companyName });

    const createData = {
      name,
      email,
      password: await hash(password, 10),
      company: company._id,
      isAdmin,
      isStaff,
    };

    // create user
    const user = await (await User.create(createData)).populate("company");
    await generateScope(user);
    res.status(201);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.user._id).populate("company");
    res.status(200);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_req, res, next) => {
  try {
    const requiredScopes = ["admin", "staff"];
    authorize(res.locals.user, requiredScopes, { allScopesRequired: false });

    const users = await User.find({
      company: res.locals.user.companyId,
    }).populate("company");

    res.status(200);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};
