import { Logger, IPluginMiddleware, PluginOptions } from "@verdaccio/types";
import { Client } from "pg";
import { Application } from "express";
import { CustomConfig } from "../types/index";
export declare function addScope(scope: string, packageName: string): string;
export default class VerdaccioMiddlewarePlugin implements IPluginMiddleware<CustomConfig> {
    logger: Logger;
    client: Client;
    constructor(options: PluginOptions<CustomConfig>);
    register_middlewares(app: Application): void;
}
