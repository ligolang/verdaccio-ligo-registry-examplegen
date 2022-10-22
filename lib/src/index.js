"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScope = void 0;
const pg_1 = require("pg");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("verdaccio:plugin:ligo-registry:examplegen");
const express_1 = require("express");
function addScope(scope, packageName) {
    return `@${scope}/${packageName}`;
}
exports.addScope = addScope;
class VerdaccioMiddlewarePlugin {
    constructor(options) {
        this.logger = options.logger;
        this.client = new pg_1.Client();
    }
    register_middlewares(app) {
        debug("Registering");
        try {
            const router = (0, express_1.Router)();
            this.client.connect();
            router.get("/all", (_request, response) => __awaiter(this, void 0, void 0, function* () {
                let res = yield this.client.query("SELECT * FROM publish");
                response.status(200).json(res.rows);
            }));
            router.get("/:id", (request, response) => __awaiter(this, void 0, void 0, function* () {
                let res = yield this.client.query("SELECT * FROM publish WHERE id = $1", [request.params.id]);
                response.status(200).json(res.rows);
            }));
            router.get("/(@:scope/)?:packageName/:version", (request, response) => __awaiter(this, void 0, void 0, function* () {
                const packageName = request.params.scope
                    ? addScope(request.params.scope, request.params.packageName)
                    : request.params.package;
                const { version } = request.params;
                debug(packageName, version);
                let res = yield this.client.query("SELECT * FROM publish WHERE name = $1 and version = $2", [packageName, version]);
                response.status(200).json(res.rows);
            }));
            app.use("/examplegen", router);
            debug("registered");
        }
        catch (e) {
            this.client.end();
            debug("Failed to establish connection to postgres. Not registering verdaccio-ligo-registry-examplegen plugin");
            debug(e);
        }
        finally {
        }
    }
}
exports.default = VerdaccioMiddlewarePlugin;
