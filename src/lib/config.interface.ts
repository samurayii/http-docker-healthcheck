import { IApiServerConfig, IWebServerConfig } from "../http";
import { ILoggerConfig } from "logger-flx";
import { IAuthorizationConfig } from "./authorization";
import { IDockerHealthcheckConfig } from "./docker-healthcheck";
import { IDockerConnectorConfig } from "./docker-connector";

export interface IAppConfig {
    logger: ILoggerConfig
    api: IApiServerConfig
    web: IWebServerConfig
    authorization: IAuthorizationConfig
    docker_healthcheck: IDockerHealthcheckConfig
    docker: IDockerConnectorConfig
}