import { EventEmitter } from "events";

export interface IDockerConnectorConfig {
    label_prefix: string
    host: string
    port: number
    ca?: string
    cert?: string
    key?: string
    version: string
    interval: number
    socket?: string
    tags?: string[]
}

export interface IDockerConnector extends EventEmitter {
    run: () => Promise<void>
    stop: () => Promise<void>
    restart: (id: string) => Promise<void>
}

export interface IDockerConnectorContainerInfoConfig {
    enable?: boolean
    path?: string
    protocol?: string
    method?: string
    port?: number | string
    host?: string
    timeout?: number | string
    interval?: number | string
    healthy_after?: number | string
    unhealthy_after?: number | string
    initialization_timeout?: number | string
    policy?: string
    policy_trigger?: number | string
    headers?: {
        [key: string]: string
    },
    [key: string]: string | number | boolean | {[key: string]: string}
}

export interface IDockerConnectorContainerInfo {
    id: string
    name: string
    image: string
    created: number
    tags: string[]
    config: IDockerConnectorContainerInfoConfig
}