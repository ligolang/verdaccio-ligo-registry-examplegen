import { Logger, IPluginMiddleware, PluginOptions } from "@verdaccio/types";
import { Client } from "pg";
import debugF from "debug";

const debug = debugF("verdaccio:plugin:ligo-registry:examplegen");

import { Router, Request, Response, NextFunction, Application } from "express";

import { CustomConfig } from "../types/index";
export function addScope(scope: string, packageName: string): string {
  return `@${scope}/${packageName}`;
}

export default class VerdaccioMiddlewarePlugin
  implements IPluginMiddleware<CustomConfig>
{
  public logger: Logger;
  public client: Client;
  public constructor(options: PluginOptions<CustomConfig>) {
    this.logger = options.logger;
    this.client = new Client();
  }
  public register_middlewares(app: Application): void {
    debug("Registering");
    try {
      const router = Router();
      this.client.connect();
      router.get(
        "/all",
        async (
          _request: Request,
          response: Response & { report_error?: Function }
        ): Promise<void> => {
          let res = await this.client.query("SELECT * FROM publish");
          response.status(200).json(res.rows);
        }
      );
      router.get(
        "/(@:scope/)?:packageName/:version",
        async (
          request: Request,
          response: Response & { report_error?: Function },
          next: NextFunction
        ): Promise<void> => {
          const packageName = request.params.scope
            ? addScope(request.params.scope, request.params.packageName)
            : request.params.package;
          const { version } = request.params;
          debug(packageName, version);
          let res = await this.client.query(
            "SELECT * FROM publish WHERE name = $1 and version = $2",
            [packageName, version]
          );
          response.status(200).json(res.rows);
        }
      );
      app.use("/examplegen", router);
      debug("registered");
    } catch (e) {
      this.client.end();
      debug(
        "Failed to establish connection to postgres. Not registering verdaccio-ligo-registry-examplegen plugin"
      );
      debug(e);
    } finally {
    }
  }
}
