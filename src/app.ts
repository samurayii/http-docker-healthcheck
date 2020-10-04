import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";
import { DockerConnector } from "./lib/docker-connector";
import { HttpController } from "./lib/http-controller";
import * as chalk from "chalk";

import "./http";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);
const docker_connector = new DockerConnector(config.docker, logger);
const http_controller = new HttpController(docker_connector, logger);

Singleton("config", config);
Singleton(Logger.name, logger);
Singleton(HttpController.name, http_controller);

const api_server = new KoaD(config.api, "api-server");
const web_server = new KoaD(config.web, "web-server");

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;

        http_controller.run();

        await docker_connector.run();

        await api_server.listen( () => {
            logger.info(`${chalk.gray("[api-server]")} listening on network interface ${api_server.config.listening}${api_server.prefix}`);
        });

        await web_server.listen( () => {
            logger.info(`${chalk.gray("[web-server]")} listening on network interface ${web_server.config.listening}${web_server.prefix}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.log(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", async () => {
    console.log("Termination signal received");
    http_controller.stop();
    await docker_connector.stop();
    process.exit();
});