import { EventEmitter } from "events";
import { ILogger } from "logger-flx";
import * as path from "path";
import * as fs from "fs";
import * as Docker from "dockerode";
import { 
    IDockerConnector, 
    IDockerConnectorConfig, 
    IDockerConnectorContainerInfo 
} from "./interfaces";
import * as chalk from "chalk";

export * from "./interfaces";

export class DockerConnector extends EventEmitter implements IDockerConnector {

    private readonly _docker: Docker
    private readonly _regexp: RegExp
    private readonly _regexp_tags: RegExp
    private readonly _regexp_headers: RegExp
    private _id_interval: ReturnType<typeof setTimeout>
    private _container_hash_list: {
        [key: string]: string
    }
    private _running_flag: boolean

    constructor (
        private readonly _config: IDockerConnectorConfig,
        private readonly _logger: ILogger
    ) {

        super();

        this._running_flag = false;
        this._container_hash_list = {};
        this._regexp = new RegExp(`^${this._config.label_prefix}\.`,"gi");
        this._regexp_tags = new RegExp(`^${this._config.label_prefix}\.tags`,"gi");
        this._regexp_headers = new RegExp(`^${this._config.label_prefix}\.header\.`,"gi");

        if (typeof this._config.ca === "string") {

            const ca_full_path = path.resolve(process.cwd(), this._config.ca);
        
            if (!fs.existsSync(ca_full_path)) {
                this._logger.error(`${chalk.gray("[Docker-connector]")} CA file ${ca_full_path} not found`);
                process.exit(1);
            }
        
            this._config.ca = fs.readFileSync(ca_full_path).toString();

        } else {
            delete this._config.ca;
        }
        
        if (typeof this._config.cert === "string") {
        
            const cert_full_path = path.resolve(process.cwd(), this._config.cert);
        
            if (!fs.existsSync(cert_full_path)) {
                this._logger.error(`${chalk.gray("[Docker-connector]")} CERT file ${cert_full_path} not found`);
            }
        
            this._config.cert = fs.readFileSync(cert_full_path).toString();
        
        } else {
            delete this._config.cert;
        }
        
        if (typeof this._config.key === "string") {
        
            const key_full_path = path.resolve(process.cwd(), this._config.key);
        
            if (!fs.existsSync(key_full_path)) {
                this._logger.error(`${chalk.gray("[Docker-connector]")} KEY file ${key_full_path} not found`);
            }
        
            this._config.key = fs.readFileSync(key_full_path).toString();
            
        } else {
            delete this._config.key;
        }

        if (this._config.socket !== undefined) {
            this._docker = new Docker({ 
                socketPath: this._config.socket,
                version: this._config.version
            });
        } else {
            this._docker = new Docker(this._config);
        }

    }

    run (): Promise<void> {
        return new Promise( (resolve) => {

            if (this._running_flag === true) {
                return resolve();
            }

            this._running_flag = true;

            this._logger.log(`${chalk.gray("[Docker-connector]")} started`, "dev");

           this._cycle();

           resolve();

        });
    }

    stop (): Promise<void> {
        return new Promise( (resolve) => {

            if (this._running_flag === false) {
                return resolve();
            }

            this._running_flag = false;

            clearTimeout(this._id_interval);

            this._logger.log(`${chalk.gray("[Docker-connector]")} stopped`, "dev");

            resolve();

        });
    }

    _cycle (): void {
        this._checkHashes().then( () => {

            if (this._running_flag === false) {
                return;
            }

            this._id_interval = setTimeout( () => {

                if (this._running_flag === false) {
                    return;
                }

                this._cycle();
            }, this._config.interval * 1000);
       });
    }

    _listContainers (): Promise<Docker.ContainerInfo[]> {
        return new Promise( (resolve, reject) => {

            this._docker.ping().then( (result): Promise<Docker.ContainerInfo[]> => {

                if (result.toString() !== "OK") {
                    reject(new Error("[Docker-connector] Docker is unavailable"));
                } else {

                    return this._docker.listContainers({
                        all: false,
                        filters: {
                            label: [`${this._config.label_prefix}.enable=true`]
                        }
                    });

                }

            }).then( (containers_list) => {
                resolve(containers_list);
            }).catch( (error) => {
                reject(error);
            });

        });
    }

    _checkHashes (): Promise<void> {

        return new Promise( (resolve) => {

            this._listContainers().then( (containers_list) => {

                const result_id_list = [];

                for (const container_info of containers_list) {
                    
                    let skip_flag = false;

                    delete container_info.State;
                    delete container_info.Status;

                    const id = container_info.Id;
                    const result_container_info: IDockerConnectorContainerInfo = {
                        id: id,
                        name: container_info.Names[0].replace(/^\//,""),
                        image: container_info.Image,
                        created: container_info.Created,
                        tags: [],
                        config: {
                            headers: {}
                        }
                    };

                    this._logger.log(`${chalk.gray("[Docker-connector]")} Checking service "${result_container_info.name}" ...`, "dev");

                    result_id_list.push(id);
    
                    for (const key_name in container_info.Labels) {

                        if (this._regexp.test(key_name) === true) {

                            if (this._regexp_tags.test(key_name) === false) {

                                if (this._regexp_headers.test(key_name) === false) {

                                    const config_key_name = key_name.replace(this._regexp, "");

                                    if (
                                        config_key_name === "port" ||
                                        config_key_name === "timeout" ||
                                        config_key_name === "interval" ||
                                        config_key_name === "healthy_after" ||
                                        config_key_name === "unhealthy_after" ||
                                        config_key_name === "initialization_timeout" ||
                                        config_key_name === "policy_trigger"
                                    ) {
                                        try {
                                            const value = parseInt(container_info.Labels[key_name]);
                                            if (typeof value !== "number" || isNaN(value)) {
                                                throw new Error("Key must be number");
                                            }
                                            result_container_info.config[config_key_name] = value;
                                        } catch (error) {
                                            this._logger.error(`${chalk.gray("[Docker-connector]")} Error parsing key ${config_key_name} for container ${result_container_info.name}`);
                                            this._logger.log(error.stack);
                                            skip_flag = true;
                                            break;
                                        }
                                    } else {
                                        result_container_info.config[config_key_name] = container_info.Labels[key_name];
                                    }

                                } else {

                                    const config_key_name = key_name.replace(this._regexp_headers, "");

                                    result_container_info.config.headers[config_key_name] = container_info.Labels[key_name];

                                }

                            } else {
                                const tags = container_info.Labels[key_name].split(",");
                                result_container_info.tags = result_container_info.tags.concat(tags);
                            }

                        }

                    }
    
                    if (this._config.tags !== undefined) {

                        for (const tag of this._config.tags) {
                            if (!result_container_info.tags.includes(tag)) {
                                skip_flag = true;
                                break;
                            }
                        }

                    }

                    if (skip_flag === true) {
                        this._logger.log(`${chalk.gray("[Docker-connector]")} Skip service "${result_container_info.name}"`, "dev");
                        continue;
                    }

                    result_container_info.config.enable = true;

                    if (this._container_hash_list[id] === undefined) {
                        this._container_hash_list[id] = id;
                        this.emit("add", id, result_container_info);
                    }

                }
             
                for (const id in this._container_hash_list) {
                    
                    if (!result_id_list.includes(id)) {
                        delete this._container_hash_list[id];
                        this.emit("delete", id);
                    }

                }

                resolve();

            }).catch( (error) => {
                this._logger.error(`${chalk.gray("[Docker-connector]")} ${error.message}`);
                this._logger.log(error.stack);
                resolve();
            });

        });

    }

    restart (id: string): Promise<void> {
        return new Promise( (resolve, reject) => {

            this._docker.ping().then( (result) => {

                if (result.toString() !== "OK") {
                    reject(new Error("[Docker-connector] Docker is unavailable"));
                } else {
                    const container = this._docker.getContainer(id);
                    return container.restart();
                }

            }).then( () => {
                resolve();
            }).catch( (error) => {
                reject(error);
            });

        });
    }

}