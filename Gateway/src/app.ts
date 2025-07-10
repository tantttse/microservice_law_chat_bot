// app.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from 'dotenv';

import { ErrorHandler } from "./common/errors/error-handler";
import { setupProxyRoutes } from "./common/utils/proxy.utils";
import { routesServer } from "./config/route.config";
import { gatewayAuthMiddleware ,requireAdmin } from "./common/middlewares/auth.middlewares"; 
import './common/types';
dotenv.config();

export default async function runApp(app: Application): Promise<void> {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(gatewayAuthMiddleware);

  setupProxyRoutes(app, routesServer.services);

  app.use(ErrorHandler);
}
