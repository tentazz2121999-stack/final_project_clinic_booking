import dotenv from "dotenv";
dotenv.config();

const env = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  minCancelHoursBefore: Number(process.env.MIN_CANCEL_HOURS_BEFORE || 2),
};

export default env;
