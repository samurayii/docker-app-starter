import { EventEmitter } from "events";
import { App } from "./lib/app";

export interface IStarterAppConfig {
    name: string
    cwd: string
    command: string
    critical: boolean
    restart: boolean
    restart_interval: number
    env: {
        scope: string
        include_regexp: string
        keys: {
            [key: string]: string
        }
    }
}

export interface IStarter {
    stop: () => void
    run: () => void
    readonly count: number
    getApp: (app_name: string) => App
}

export interface IStarterApp extends EventEmitter {
    stop: () => void
    run: () => void
    readonly env: {[key: string]: string}
    readonly close: boolean
}