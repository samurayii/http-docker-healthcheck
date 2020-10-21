import { EventEmitter } from "events";

export interface IHttpControllerHealthcheckInfo {
    healthy: boolean
    image: string
    id: string
    name: string
    created: number
    tags: string[]
    service: IHttpHealthcheckInfo 
}


export interface IHttpHealthcheckInfo {
    status: {
        healthy_attempt: number
        unhealthy_attempt: number
        triggered_count: number
    }
    info: {
        path: string
        protocol: string
        method: string
        port: number
        host: string
        timeout: number
        interval: number
        healthy_after: number
        unhealthy_after: number
        initialization_timeout: number
        policy: string
        policy_trigger: number
        headers: {
            [key: string]: string
        } 
    }
}

export interface IHttpHealthcheck extends EventEmitter {
    run: () => void
    stop: () => void
    readonly healthy: boolean
    readonly running: boolean
    readonly info: IHttpHealthcheckInfo
    readonly uid: string
}

export interface IHttpController {
    stop: () => void
    run: () => void
    getServiceInfo: (healthcheck_id: string) => IHttpControllerHealthcheckInfo
    getInfo: () => IHttpControllerHealthcheckInfo[]
}