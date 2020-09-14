import { ILoggerConfig } from "logger-flx";
import { IStarterAppConfig } from "./starter";

export interface IAppConfig {
    logger: ILoggerConfig
    app: IStarterAppConfig[]
}