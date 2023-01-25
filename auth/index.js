import { HttpError } from "../errors/http.js";
import { User } from "../models/index.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export async function authenticateLogin({ email, password } = {}) {
  const user = await User.findOne({ email });

  const isValidPassword =
    user &&
    password &&
    user.isActive &&
    (await compare(password, user.password));

  if (!isValidPassword) {
    throw new HttpError({
      message: `Unauthorized: Incorrect Password Or Username.`,
      statusCode: 401,
    });
  }

  // correct email and password pair
  return user;
}

export async function getUserFromToken(token) {
  try {
    return (token && jwt.verify(token, process.env.JWT_SECRET)) || null;
  } catch (e) {
    return null;
  }
}

export async function verifyAccessToken(userId, token) {
  try {
    const user = await User.findById(userId);

    const storedToken = user.jwt;
    console.log({ user, storedToken, jwt: user.jwt });

    return (
      (storedToken && jwt.verify(storedToken, process.env.JWT_SECRET)) || null
    );
  } catch (e) {
    return null;
  }
}

/**
 *
 * @param {Express.Request} req
 * @returns
 */
export async function getTokenUser(req) {
  try {
    const token = (req.get("Authorization") || "").replace("Bearer", "").trim();

    const tokenUser = await getUserFromToken(token);
    const user = await verifyAccessToken(tokenUser?._id, token);
    console.log({ token, tokenUser, user });

    return user;
  } catch (e) {
    return null;
  }
}

export function authorize(
  user,
  requiredScopes = [],
  options = { allScopesRequired: false }
) {
  // authorize if no requiredScopes
  if (!requiredScopes.length) return;

  const userHasSomeRequiredScopes = requiredScopes.some(
    (scope) => Array.isArray(user?.roles) && user.roles.includes(scope)
  );

  const userHasAllRequiredScopes = requiredScopes.every(
    (scope) => Array.isArray(user?.roles) && user.roles.includes(scope)
  );

  if (!options.allScopesRequired && userHasSomeRequiredScopes) return;
  if (options.allScopesRequired && userHasAllRequiredScopes) return;

  throw new HttpError({
    statusCode: 403,
    message: "Forbidden: You are not Authorized to access this resource",
  });
}

export function generateScope(user) {
  const userScope = [];
  const scopes = ["Admin", "Staff", "Candidate"];
  scopes.forEach((scope) => {
    if (user["is" + scope]) userScope.push(scope.toLowerCase());
  });

  return userScope;
}

export function generateToken(payload) {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (e) {
    throw new HttpError({ statusCode: 500, message: "Internal Server Error" });
  }
}

export async function generateAccessToken(user) {
  try {
    const scope = generateScope(user);
    const token = generateToken({
      roles: scope,
      _id: user._id,
      companyId: user.company?._id || user.company,
      name: user.name,
    });

    user.jwt = token;
    await user.save();
    // TODO: Handle expired tokens
    return token;
  } catch (e) {
    throw e;
  }
}
