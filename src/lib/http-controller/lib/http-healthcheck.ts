import { ILogger } from "logger-flx";
import axios, { AxiosRequestConfig, Method } from "axios";
import { IDockerConnectorContainerInfoConfig } from "../../../lib/docker-connector";
import { IHttpHealthcheck, IHttpHealthcheckInfo } from "../interfaces";
import { EventEmitter } from "events";
import * as chalk from "chalk";

export class HttpHealthcheck extends EventEmitter implements IHttpHealthcheck {

    private _running_flag: boolean
    private readonly _request_config: AxiosRequestConfig
    private _id_interval: ReturnType<typeof setTimeout>
    private _healthy: boolean
    private _current_healthy_attempt: number
    private _current_unhealthy_attempt: number
    private _current_trigger: number

    constructor (
        private readonly _name: string,
        private readonly _config: IDockerConnectorContainerInfoConfig,
        private readonly _logger: ILogger
    ) {

        super();

        this._running_flag = false;
        this._healthy = false;
        this._current_healthy_attempt = 0;
        this._current_unhealthy_attempt = 0;
        this._current_trigger = 0;

        let port = 80;
        let host = this._name;

        if (this._config.host !== undefined) {
            host = this._config.host;
        } else {
            this._config.host = host;
        }

        if (this._config.protocol === "https") {
            port = 443;
        }

        if (this._config.port !== undefined ) {
            port = <number>this._config.port;
        } else {
            this._config.port = port;
        }

        this._config.method = this._config.method.toLowerCase();

        this._request_config = {
            method: <Method>this._config.method,
            headers: this._config.headers,
            timeout: <number>this._config.timeout * 1000,
            url: `${this._config.protocol}://${host}:${port}/${this._config.path.replace(/^\//,"")}`
        };

        this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" added`, "dev");

    }

    get healthy (): boolean {
        return this._healthy;
    }

    get running (): boolean {
        return this._running_flag;
    }

    get info (): IHttpHealthcheckInfo {
        return {
            status: {
                healthy_attempt: this._current_healthy_attempt,
                unhealthy_attempt: this._current_unhealthy_attempt,
                triggered_count: this._current_trigger
            },
            info: {
                path: this._config.path,
                protocol: this._config.protocol,
                method: this._config.method,
                port: <number>this._config.port,
                host: this._config.host,
                timeout: <number>this._config.timeout,
                interval: <number>this._config.interval,
                healthy_after: <number>this._config.healthy_after,
                unhealthy_after: <number>this._config.unhealthy_after,
                initialization_timeout: <number>this._config.initialization_timeout,
                policy: this._config.policy,
                policy_trigger: <number>this._config.policy_trigger,
                headers: this._config.headers
            }
        };
    }

    run (): void {

        if (this._running_flag === true) {
            return;
        }

        this._running_flag = true;

        this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" started`, "dev");

        setTimeout( () => {

            if (this._running_flag === false) {
                return;
            }

            this._cycle();
        }, <number>this._config.initialization_timeout * 1000);
    }

    _cycle (): void {
        this._check().then( () => {

            if (this._running_flag === false) {
                return;
            }

            this._id_interval = setTimeout( () => {

                if (this._running_flag === false) {
                    return;
                }

                this._cycle();

            }, <number>this._config.interval * 1000);
       });
    }

    stop (): void {
        if (this._running_flag === false) {
            return;
        }

        this._running_flag = false;

        clearTimeout(this._id_interval);

        this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" stopped`, "dev");
    }

    _check (): Promise<void> {
        return new Promise( (resolve) => {

            this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" request to: ${chalk.gray(this._request_config.url)}`, "dev");

            axios(this._request_config).then( () => {
                
                this._current_unhealthy_attempt = 0;
                this._current_trigger = 0;

                if (this._healthy === false) {

                    this._current_healthy_attempt += 1;

                    if (this._current_healthy_attempt >= this._config.healthy_after) {
                        this._healthy = true;
                        this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck named "${this._name}" is ${chalk.green("healthy")}`, "dev");
                        this.emit("healthy");
                    }

                }

                resolve();

            }).catch( (error) => {

                if (error.response) {
                    this._logger.error(`${chalk.gray("[Http-connector]")} Service "${this._name}" return code: ${error.response.status}`);
                } else if (error.request) {
                    this._logger.error(`${chalk.gray("[Http-connector]")} Error request to service "${this._name}". Request return: ${error.message}`);
                } else {
                    this._logger.error(`${chalk.gray("[Http-connector]")} Healthcheck service "${this._name}" error: ${error.message}`);
                    this._logger.log(error.stack, "debug");
                }
                
                this._current_healthy_attempt = 0;

                if (this._healthy === true) {

                    this._current_unhealthy_attempt += 1;

                    if (this._current_unhealthy_attempt >= this._config.unhealthy_after) {
                        this._healthy = false;
                        this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" is ${chalk.red("unhealthy")}`, "dev");
                        this.emit("unhealthy");
                    }

                } else {
                    this._current_trigger += 1;
                }

                if (this._current_trigger >= this._config.policy_trigger) {
                    this._current_trigger = 0;
                    this._logger.log(`${chalk.gray("[Http-connector]")} Healthcheck "${this._name}" unhealthy triggered`, "dev");
                    this.emit("unhealthy:trigger");
                }

                resolve();
            });

        });
    }

}