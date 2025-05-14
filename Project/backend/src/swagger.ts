import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import path from "path";
import { Application } from "express";

const swaggerSpec = yaml.load(path.join(__dirname, "./swagger.yaml")); 

export const setupSwagger = (app: Application): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
