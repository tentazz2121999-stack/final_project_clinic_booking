const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

function toPublicUser(user) {
  const { password, refreshToken, ...publicUser } = user;
  return publicUser;
}

function buildTokenPayload(user) {
  return { id: user.id, role: user.role, email: user.email };
}

async function register(data) {
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

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  return issueTokens(user);
}

async function issueTokens(user) {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refreshAccessToken(token) {
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

async function logout(userId) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

module.exports = { register, login, refreshAccessToken, logout, toPublicUser };
