import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { signToken } from "../auth/token.js";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message on purpose: do not reveal whether the email exists.
  const invalid = new AppError(401, "Invalid email or password");

  if (!user || !user.passwordHash) {
    throw invalid;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw invalid;
  }

  const publicUser = toPublicUser(user);
  const token = signToken({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return { token, user: publicUser };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
