import { ILogger } from "logger-flx";
import { 
    IDockerConnector, 
    IDockerConnectorContainerInfo, 
    IDockerConnectorContainerInfoConfig 
} from "../docker-connector";
import json_from_schema from "json-from-default-schema";
import * as container_config_schema from "./lib/container_config_schema.json";
import * as Ajv from "ajv";
import { 
    IHttpController, 
    IHttpControllerHealthcheckInfo, 
    IHttpHealthcheck 
} from "./interfaces";
import { HttpHealthcheck } from "./lib/http-healthcheck";
import * as chalk from "chalk";

export * from "./interfaces";

export class HttpController implements IHttpController {

    private _running_flag: boolean
    private _healthcheck_list: {
        [key: string]: {
            id: string
            name: string
            image: string
            created: number
            tags: string[]
            healthcheck: IHttpHealthcheck
        }
    }

    constructor (
        private readonly _docker_connector: IDockerConnector,
        private readonly _logger: ILogger
    ) {

        this._running_flag = false;
        this._healthcheck_list = {};

        this._docker_connector.on("add", (id: string, container_info: IDockerConnectorContainerInfo) => {

            if (this._running_flag === false) {
                return;
            }

            this._logger.log(`${chalk.gray("[Http-connector]")} Adding service "${container_info.name}"`, "dev");

            container_info.config = <IDockerConnectorContainerInfoConfig>json_from_schema(container_info.config, container_config_schema);

            const ajv = new Ajv();
            const validate = ajv.compile(container_config_schema);
            
            if (!validate(container_info.config)) {
                this._logger.error(`${chalk.gray("[Http-connector]")} Config error for service "${container_info.name}"`);
                this._logger.log(`schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
                return;
            }

            const healthcheck = new HttpHealthcheck(container_info.name, container_info.config, this._logger);

            if (this._healthcheck_list[id] !== undefined) {
                this._healthcheck_list[id].healthcheck.stop();
                this._healthcheck_list[id].healthcheck.removeAllListeners();
            }

            this._healthcheck_list[id] = {
                id: id,
                name: container_info.name,
                image: container_info.image,
                created: container_info.created,
                tags: container_info.tags,
                healthcheck: healthcheck
            };

            this._logger.log(`${chalk.gray("[Http-connector]")} Service "${container_info.name} added"`, "dev");

            this._healthcheck_list[id].healthcheck.run();

            this._healthcheck_list[id].healthcheck.on("unhealthy:trigger", () => {
                if (container_info.config.policy === "restart") {

                    this._logger.log(`${chalk.gray("[Http-connector]")} Service "${container_info.name}" restarting ...`, "dev");

                    this._docker_connector.restart(id).then( () => {
                        this._logger.log(`${chalk.gray("[Http-connector]")} Service "${container_info.name}" restarted`, "dev");
                    }).catch( (error) => {
                        this._logger.error(`${chalk.gray("[Http-connector]")} Error restarting service "${container_info.name}". ${error.message}`);
                        this._logger.log(error.stack, "debug");
                    });
                }
            });

        });

        this._docker_connector.on("delete", (id: string) => {
            if (this._healthcheck_list[id] !== undefined) {
                this._healthcheck_list[id].healthcheck.stop();
                this._healthcheck_list[id].healthcheck.removeAllListeners();
                this._logger.log(`${chalk.gray("[Http-connector]")} Service "${this._healthcheck_list[id].name}" deleted`, "dev");
                delete this._healthcheck_list[id];
            }
        });

    }

    stop (): void {
        if (this._running_flag === false) {
            return;
        }
        
        this._running_flag = false;

        for (const id in this._healthcheck_list) {
            this._healthcheck_list[id].healthcheck.stop();
        }

        this._healthcheck_list = {};

        this._logger.log(`${chalk.gray("[Http-connector]")} stopped`, "dev");
    }

    run (): void {

        if (this._running_flag === true) {
            return;
        }

        this._running_flag = true;

        for (const id in this._healthcheck_list) {
            this._healthcheck_list[id].healthcheck.run();
        }

        this._logger.log(`${chalk.gray("[Http-connector]")} started`, "dev");
    }

    getServiceInfo (healthcheck_id: string): IHttpControllerHealthcheckInfo {
        if (this._healthcheck_list[healthcheck_id] === undefined) {
            return;
        }

        const healthcheck_info = this._healthcheck_list[healthcheck_id];

        return {
            healthy: healthcheck_info.healthcheck.healthy,
            image: healthcheck_info.image,
            id: healthcheck_info.id,
            name: healthcheck_info.name,
            created: healthcheck_info.created,
            tags: healthcheck_info.tags,
            service: healthcheck_info.healthcheck.info
        };
    }

    getInfo (): IHttpControllerHealthcheckInfo[] {
        
        const result = [];

        for (const healthcheck_id in this._healthcheck_list) {

            const healthcheck_info = this._healthcheck_list[healthcheck_id];

            result.push({
                healthy: healthcheck_info.healthcheck.healthy,
                image: healthcheck_info.image,
                id: healthcheck_info.id,
                name: healthcheck_info.name,
                created: healthcheck_info.created,
                tags: healthcheck_info.tags,
                service: healthcheck_info.healthcheck.info
            });

        }

        return result;
        
    }

}