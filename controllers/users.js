import { Company, User } from "../models/index.js";
import { authorize, generateScope } from "../auth/index.js";
import { throw400, throw401, throw403 } from "../errors/http.js";

import { hash } from "bcrypt";
import { validatePostBody } from "../utils/req-body-validator.js";

export const createUser = async (req, res, next) => {
  let company;
  const authUser = res.locals.user;
  try {
    const { name, email, password, companyName } = req.body;

    company = companyName
      ? await Company.findOne({ name: companyName })
      : await Company.findById(authUser?.companyId);

    const isAdmin = !company;
    const isStaff = !!company;
    const requiredScopes = company ? ["admin", "staff"] : [];
    const requiredFields = ["name", "email", "password"];
    if (!company) requiredFields.push("companyName");

    // if company, the user creating this user must be authenticated
    if (company) {
      if (!res.locals.authenticated) throw401();
      authorize(authUser, requiredScopes);

      // check if user is creating user from same company
      if (authUser.companyId !== company._id.toString()) {
        throw403("Forbidden: You are not allowed to create this user");
      }
      if (!requiredScopes.some((scope) => authUser.roles.includes(scope))) {
        throw403("Forbidden: You are not allowed to create this user");
      }
    }

    validatePostBody(req, requiredFields);

    const existingUser = await User.findOne({ email });

    if (existingUser) throw400(`User with email ${email} already exists`);

    if (!company) company = await Company.create({ name: companyName });

    // create user
    const user = await (
      await User.create({
        name,
        email,
        password: await hash(password, 10),
        company: company._id,
        isAdmin,
        isStaff,
      })
    ).populate("company");
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
