import * as process from "process";

export const configuration = () => ({
  port: process.env.PORT || 3000,
  isProduction: process.env.NODE_ENV === "production",
  db: {
    uri: process.env.MONGO_URI,
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
  },
});
