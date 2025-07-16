import jwt, { JwtPayload } from "jsonwebtoken";
import { APIError,ValidationError,AppError,STATUS_CODES } from "../errors/app.errors";

interface TokenPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded !== 'object' || decoded === null) {
      throw new ValidationError("Invalid token payload",);
    }

    const { userId, email, isAdmin } = decoded as JwtPayload;

    if (typeof userId !== 'number' || typeof email !== 'string' || typeof isAdmin !== 'boolean') {
      throw new Error("Malformed token data");
    }

    return { userId, email, isAdmin };
  } catch (error) {
    throw new APIError("INVALID_TOKEN", 401, "Invalid or expired token");
  }
}


export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};
