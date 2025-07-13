import { Application, Request } from "express";
import proxy from "express-http-proxy";

type ServiceMap = {
  [key: string]: string;
};

export function setupProxyRoutes(app: Application, services: ServiceMap): void {
  Object.entries(services).forEach(([routePrefix, target]) => {
    console.log(`Mounting proxy: /${routePrefix} -> ${target}`);

    // Debug middleware to see what routes are being hit
    app.use(`/${routePrefix}`, (req, res, next) => {
      next();
    });

    // Special proxy for file upload routes (no body parsing)
    app.use(
      `/${routePrefix}/documents/upload`,
      proxy(target, {
        proxyReqPathResolver: (req: Request) => {
          const targetPath = req.originalUrl.replace(`/${routePrefix}`, "");
          console.log(
            `File upload request to: ${req.originalUrl}, forwarding to: ${targetPath}`
          );
          return targetPath;
        },
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
          const user = (srcReq as any).user;
          const headers = proxyReqOpts.headers as Record<string, string>;

          if (user) {
            headers["x-user-id"] = user.userId.toString();
            headers["x-user-email"] = user.email;
            headers["x-user-admin"] = user.isAdmin.toString();
          }

          return proxyReqOpts;
        },
        parseReqBody: false, // Don't parse body for file uploads
        limit: "50mb",
        timeout: 30000,
      })
    );

    // Default proxy for all other routes (with body parsing)
    app.use(
      `/${routePrefix}`,
      proxy(target, {
        proxyReqPathResolver: (req: Request) => {
          const targetPath = req.originalUrl.replace(`/${routePrefix}`, "");
          console.log(
            `Regular request to: ${req.originalUrl}, forwarding to: ${targetPath}`
          );
          return targetPath;
        },
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
          const user = (srcReq as any).user;
          const headers = proxyReqOpts.headers as Record<string, string>;

          if (user) {
            headers["x-user-id"] = user.userId.toString();
            headers["x-user-email"] = user.email;
            headers["x-user-admin"] = user.isAdmin.toString();
          }

          return proxyReqOpts;
        },
        // Parse body for JSON requests, don't parse for file uploads
        parseReqBody: true, // Enable body parsing for JSON requests
        limit: "50mb", // Increase body size limit
        timeout: 30000, // 30 second timeout
      })
    );
  });
}
