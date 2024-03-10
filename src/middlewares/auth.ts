import { Request, Response, NextFunction } from "express";
import respond from "../utils/respond";
import User from "../models/signup";
import jwt from "jsonwebtoken";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.header("X-API-KEY");
  const authorizationHeader = req.headers.authorization;
  const token = (authorizationHeader as string).split(" ")[1];
  // Check if API key is provided and valid

  // Check if it's valid
  if (!token) return respond(res, 401, "Please Authenticate");
  const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
  if (!decoded) return respond(res, 401, "Please Authenticate");
  // @ts-ignore
  if (decoded?.type !== "auth")
    return respond(res, 401, "Please provide a valid token...");

  // Check if the user exists
  const user = await User.findOne({
    // @ts-ignore
    username: decoded.username,
  });

  if (!apiKey || !validateApiKey(user?.toJSON(), apiKey)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!user) return respond(res, 404, "Sorry, but the user is not found!");

  next();
}

export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization; // Get the "Authorization" header
    if (!authorizationHeader) return respond(res, 401, "Please Authenticate");

    // Extract the token part (remove "Bearer ")
    const token = authorizationHeader.split(" ")[1];

    // Check if it's valid
    if (!token) return respond(res, 401, "Please Authenticate");
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
    if (!decoded) return respond(res, 401, "Please Authenticate");
    // @ts-ignore
    if (decoded?.type !== "auth")
      return respond(res, 401, "Please provide a valid token...");

    // Check if the user exists
    const user = await User.findOne({
      // @ts-ignore
      username: decoded.username,
    });

    if (!user) return respond(res, 404, "Sorry, but the user is not found!");
    // @ts-ignore
    req.user = user.toJSON();
    // @ts-ignore
    req.token = token;

    next();
  } catch (e) {
    // If something went wrong
    respond(res, 401, "Please Authenticate");
  }
};

export function validateApiKey(user: any, apiKey: string): boolean {
  // @ts-ignore
  return user?.apiKey === apiKey;
}
