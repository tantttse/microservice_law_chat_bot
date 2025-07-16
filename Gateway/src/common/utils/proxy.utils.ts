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
      console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
      console.log(`Incoming request headers:`, req.headers); 
      next();
    });

    // Special proxy for file upload routes (no body parsing)
    app.use(
      `/${routePrefix}/documents/upload`,
      proxy(target, {
        proxyReqPathResolver: (req: Request) => {
          const targetPath = req.originalUrl.replace(`/${routePrefix}`, "");
          console.log(
            `File upload request: ${req.method} ${req.originalUrl} -> ${target}${targetPath}`
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
        parseReqBody: false, 
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
            `Regular request: ${req.method} ${req.originalUrl} -> ${target}${targetPath}`
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
            console.log(`Default proxy - Headers set:`, {
              "x-user-id": headers["x-user-id"],
              "x-user-email": headers["x-user-email"],
              "x-user-admin": headers["x-user-admin"],
            }); 
          } 

          return proxyReqOpts;
        },
        parseReqBody: true,
        limit: "50mb",
        timeout: 30000,
      })
    );
  });
}