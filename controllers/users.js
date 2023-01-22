import { Company, User } from "../models/index.js";

import { HttpError } from "../errors/http.js";
import { authorize } from "../auth/index.js";
import { generateAccessToken } from "../auth/index.js";
import { hash } from "bcrypt";

export const createUser = async (req, res) => {
  let company;
  try {
    const { name, email, password, companyName } = req.body;

    const requiredFields = ["name", "email", "password", "companyName"];
    const missingFields = requiredFields.filter((f) => !req.body[f]);

    if (missingFields.length) {
      throw new HttpError({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
        statusCode: 400,
      });
    }

    // TODO: validate and normalize email

    let isAdmin = false;
    let isStaff = false;
    let isCandidate = false;
    let createCompany = false;
    company = await Company.findOne({ name: companyName });
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
      console.log(
        res.locals.user.companyId,
        company._id.toString(),
        res.locals.user.companyId !== company._id.toString()
      );
      if (res.locals.user.companyId !== company._id.toString()) {
        res.status(403);
        return res.json("Forbidden: You are not allowed to create this user");
      }

      if (res.locals.user.roles.includes("admin")) {
        // admins creates staff
        isStaff = true;
      } else if (res.locals.user.roles.includes("staff")) {
        // staffs creates candidates
        isCandidate = true;
      } else {
        // candidates are not allowed to create users
        res.status(403);
        return res.json("Forbidden: You are not allowed to create this user");
      }
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
      isCandidate,
    };

    // create user
    const user = await (await User.create(createData)).populate("company");
    const token = await generateAccessToken(user);

    res.status(201);
    res.json({ user, token });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json(err.message);
    } else {
      console.error(err);
      res.status(500);
      res.json("Internal Serve Error.");
    }
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(res.locals.user._id).populate("company");
    res.status(200);
    res.json({ user });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json(err.message);
    } else {
      console.error(err);
      res.status(500);
      res.json("Internal Serve Error.");
    }
  }
};

export const getUsers = async (req, res) => {
  try {
    const requiredScopes = ["admin", "staff"];
    // authorize(res.locals.user, requiredScopes, { allScopesRequired: false });

    const users = await User.find({
      //   company: res.locals.user.companyId,
    }).populate("company");
    res.status(200);
    res.json({ users });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json(err.message);
    } else {
      console.error(err);
      res.status(500);
      res.json("Internal Serve Error.");
    }
  }
};
