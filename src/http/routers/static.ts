import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as path from "path";
import * as fs from "fs";
import * as chalk from "chalk";
import * as mime from "mime-types";
import { IWebServerConfig } from "../";

@Controller("/static", "web-server")
export class UIStatic {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }  

    @Get("/(.*)", "web-server")
    async list (ctx: Context): Promise<void> {

        const file_path = ctx.params[0];
        const config: IWebServerConfig = ctx.koad.config;

        if (file_path === undefined) {
            ctx.body = "Not Found";
            ctx.status = 404;
            return;
        }

        const static_folder = path.resolve(process.cwd(), config.static.folder);
        const full_file_path = path.resolve(static_folder, file_path.replace("..",""));
        const file_name = path.basename(full_file_path);

        if (file_name[0] === "." && config.static.hidden === false) {
            ctx.body = "Not Found";
            ctx.status = 404;
            return;
        }

        try {
            await fs.promises.access(full_file_path, fs.constants.R_OK);
        } catch (error) {
            this._logger.error(`[${this._app_id}] Error access to file ${full_file_path}. ${error.message}`);
            this._logger.log(error.stack);
            ctx.body = "Not Found";
            ctx.status = 404;
            return;
        }

        const stats = await fs.promises.stat(full_file_path);

        if (stats.isDirectory() === true) {
            ctx.body = "Not Found";
            ctx.status = 404;
            return;
        }

        const stream = fs.createReadStream(full_file_path);

        ctx.response.set("content-type", <string>mime.lookup(full_file_path));
        ctx.body = stream;
        ctx.status = 200;
    
    }

}