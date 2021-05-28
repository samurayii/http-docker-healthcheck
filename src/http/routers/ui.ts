import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import { IHttpController, HttpController, IHttpControllerHealthcheckInfo } from "../../lib/http-controller";
import { resolve } from "path";
import * as fs from "fs";
import Handlebars from "handlebars";

@Controller("/", "web-server")
export class RouteUI {

    private readonly _full_templates_path: string
    private readonly _index_template: HandlebarsTemplateDelegate<{
        prefix: string
        data: IHttpControllerHealthcheckInfo[]
    }>

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _http_healthcheck: IHttpController = <IHttpController>Catalog(HttpController)
    )  {
        this._logger.info(`[${this._app_id}] Controller "${this._name}" assigned to application with prefix ${this._prefix}`, "dev");
        this._full_templates_path = resolve(__dirname, "../templates");
        this._index_template = Handlebars.compile(fs.readFileSync(resolve(this._full_templates_path, "index.hbs")).toString());
    }

    @Get("/", "web-server")
    @Get("/index.html", "web-server")
    async index (ctx: Context): Promise<void> {

        const result = this._http_healthcheck.getInfo();

        ctx.body = this._index_template({
            prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
            data: result
        });
        
        ctx.set("Content-Type", "text/html");
        ctx.status = 200;
    
    }

}