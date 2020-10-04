import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import { IHttpController, HttpController } from "../../lib/http-controller";

@Controller("/v1/services", "api-server")
export class RouteServices {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _http_healthcheck: IHttpController = <IHttpController>Catalog(HttpController)
    )  {
        this._logger.info(`[${this._app_id}] Controller "${this._name}" assigned to application with prefix ${this._prefix}`, "dev");
    }

    @Get("/list", "api-server")
    async list (ctx: Context): Promise<void> {

        const result = this._http_healthcheck.getInfo();

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

    @Get("/info/:id", "api-server")
    async info (ctx: Context): Promise<void> {
        
        const id = ctx.params.id;
        const result = this._http_healthcheck.getServiceInfo(id);

        if (result === undefined) {
            ctx.body = { 
                status: "fail",
                message: `Service "${id}" not found`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: result
            };
        }

        ctx.status = 200;
    
    }

}