import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  github: {
    token: process.env.GITHUB_TOKEN || "",
  },
  paths: {
    tempRepo: "./temp-repo", 
  },
};
