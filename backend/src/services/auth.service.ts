import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

function toPublicUser(user: User) {
  const { password, refreshToken, ...publicUser } = user;
  return publicUser;
}

function buildTokenPayload(user: User) {
  return { id: user.id, role: user.role, email: user.email };
}

async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict("Email đã được sử dụng");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      role: "PATIENT",
    },
  });

  return issueTokens(user);
}

async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  return issueTokens(user);
}

async function issueTokens(user: User) {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refreshAccessToken(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized("Refresh token không hợp lệ");
  }

  const accessToken = signAccessToken(buildTokenPayload(user));
  return { accessToken };
}

async function logout(userId: number) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

export default { register, login, refreshAccessToken, logout, toPublicUser };
