import { ILogger } from "logger-flx";
import { IStarterApp, IStarterAppConfig } from "../interfaces";
import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import { spawn } from "child_process";

export class App extends EventEmitter implements IStarterApp  {

    private _app: ReturnType<typeof spawn>
    private readonly _full_cwd_path: string
    private _stopping_flag: boolean
    private _restarting_flag: boolean
    private _closed_flag: boolean
    private _id_interval: ReturnType<typeof setTimeout>
    private readonly _include_regexp: RegExp

    constructor (
        private readonly _config: IStarterAppConfig,
        private readonly _logger: ILogger
    ) {

        super();

        this._full_cwd_path = path.resolve(process.cwd(), this._config.cwd);
        this._stopping_flag = false;
        this._restarting_flag = false;
        this._closed_flag = true;
        this._include_regexp = new RegExp(`${this._config.env.include_regexp}`, "i");

        if (!fs.existsSync(this._full_cwd_path)) {
            fs.mkdirSync(this._full_cwd_path, {
                recursive: true
            });
            this._logger.log(`[Starter] Created cwd folder ${this._full_cwd_path} for app ${this._config.name}`, "dev");
        }

        for (const key_name in this._config.env.keys) {

            const value = this._config.env.keys[key_name];

            for (const env_name in process.env) {
   
                const env_arg = process.env[env_name];
                const reg = new RegExp("\\${"+env_name+"}", "gi");

                if (reg.test(value)) {
                    this._config.env.keys[key_name] = value.replace(reg, env_arg);
                }

            }

        }

        this._logger.info(`[Starter] App ${this._config.name} created`);
    }

    run (): void {

        if (this._closed_flag === false) {
            return;
        }

        this._closed_flag = false;
        this._restarting_flag = false;

        this._logger.log(`[Starter] App ${this._config.name} starting ...`, "dev");

        let env: { [key: string]: string }  = {};

        if (this._config.env.scope === "all") {
            env = {
                ...process.env,
                ...this._config.env.keys
            };
        }

        if (this._config.env.scope === "os") {
            env = process.env;
        }

        if (this._config.env.scope === "app") {
            env = this._config.env.keys;               
        }

        for (const env_name in env) {
            if (!this._include_regexp.test(env_name)) {
                delete env[env_name];
            }
        }
 
        const executer = this._config.command.split(" ").splice(0, 1);
        const args = this._config.command.split(" ").splice(1, this._config.command.split(" ").length - 1);

        this._logger.log(`[Starter] Spawn command "${this._config.command}"`, "dev");

        this._app = spawn(`${executer}`, args, {
            cwd: this._full_cwd_path,
            env: env
        });

        this._app.stdout.on("data", (data) => {
            this._logger.log(`[Starter:${this._config.name}] ${data.toString().trim()}`);
        });

        this._app.stderr.on("data", (data) => {
            this._logger.error(`[Starter:${this._config.name}] ${data.toString().trim()}`);
        });

        this._app.on("close", (code) => {

            this._closed_flag = true;

            this._logger.log(`[Starter] App ${this._config.name} closed, with code ${code}`, "dev");

            if (this._stopping_flag === true) {
                return;
            }

            if (this._config.critical === true) {
                this._logger.log(`[Starter] Closed critical app ${this._config.name}`, "dev");
                this.emit("close", this._config.name);
                return;
            }

            if (this._config.restart === false) {
                this.emit("close", this._config.name);
                return;
            }

            this._restarting_flag = true;

            this._logger.log(`[Starter] Restarting app ${this._config.name}`);

            this._id_interval = setTimeout( () => {
                this.run();
            }, 3000);

        });

        this._app.on("error", (error) => {
            this._logger.error(`[Starter] Starting app ${this._config.name} error.`);
            this._logger.log(error);
            this.emit("error", this._config.name);
        });

    }

    stop (): void {

        if (this._closed_flag === true) {
            return;
        }

        this._logger.log(`[Starter] App ${this._config.name} stopping ...`, "dev");

        this._closed_flag = true;
        this._stopping_flag = true;
        this._restarting_flag = false;

        clearTimeout(this._id_interval);

        this._app.kill();

    }

    get close (): boolean {
        if (this._restarting_flag === true) {
            return false;
        }

        return this._closed_flag;
    }

    get env (): { [key: string]: string } {
        return this._config.env.keys;
    }

}