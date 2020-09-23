import { EventEmitter } from "events";
import { ILogger } from "logger-flx";
import { IStarter, IStarterAppConfig } from "./interfaces";
import { App } from "./lib/app";

export * from "./interfaces";

export class Starter extends EventEmitter implements IStarter {

    private readonly _app_list: {
        [key: string]: App
    }

    constructor (
        private readonly _config: IStarterAppConfig[],
        private readonly _logger: ILogger
    ) {

        super();

        this._app_list = {};

        for (const app_config of this._config) {

            if (this._app_list[app_config.name] !== undefined) {
                this._logger.error(`[Starter] App named ${app_config.name} already exist`);
                process.exit(1);
            }

            const app = new App(app_config, this._logger);

            app.on("close", () => {
                this.stop();
            });

            app.on("error", () => {
                this.stop();
            });

            this._app_list[app_config.name] = app;

        }

    }

    run (): void {

        this._logger.log("[Starter] Starting ...", "dev");

        for (const app_name in this._app_list) {

            const app = this._app_list[app_name];

            if (app.close === true) {
                app.run();
            }
        }
    }

    stop (): void {

        this._logger.log("[Starter] Stopping ...", "dev");

        for (const app_name in this._app_list) {

            const app = this._app_list[app_name];

            if (app.close === false) {

                app.once("close", () => {
                    this.emit("app:close", app_name);
                });

                app.stop();
            }
        }
    }

    get count (): number {

        let result = 0;

        for (const app_name in this._app_list) {

            const app = this._app_list[app_name];

            if (app.close === false) {
                result += 1;
            }
        }

        return result;
    }

    getApp (app_name: string): App {
        if (this._app_list[app_name] !== undefined) {
            return this._app_list[app_name];
        }
    }
}