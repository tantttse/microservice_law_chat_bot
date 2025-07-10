import { Application, Request } from "express";
import proxy from "express-http-proxy";

type ServiceMap = {
  [key: string]: string;
};

export function setupProxyRoutes(app: Application, services: ServiceMap): void {
  Object.entries(services).forEach(([routePrefix, target]) => {
    console.log(`Mounting proxy: /${routePrefix} -> ${target}`);
    app.use(`/${routePrefix}`, proxy(target, {
      proxyReqPathResolver: (req: Request) => {
        console.log(`Incoming request to: ${req.originalUrl}`);
        return req.url;
      },
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        const user = (srcReq as any).user;
        const headers = proxyReqOpts.headers as Record<string, string>;

        if (user) {
          headers['x-user-id'] = user.userId.toString();
          headers['x-user-email'] = user.email;
          headers['x-user-admin'] = user.isAdmin.toString();
        }

        return proxyReqOpts;
      }
    }));
  });
}
