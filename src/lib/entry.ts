import { program } from "commander";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as finder from "find-package-json";
import * as Ajv from "ajv";
import jtomler from "jtomler";
import json_from_schema from "json-from-default-schema";
import * as config_schema from "./schemes/config.json";
import * as app_schema from "./schemes/app.json";
import { IAppConfig } from "./config.interface";
import { IStarterAppConfig } from "./starter";
 
const pkg = finder(__dirname).next().value;

program.version(`version: ${pkg.version}`, "-v, --version", "output the current version.");
program.name(pkg.name);
program.option("-c, --config <type>", "Path to config file.");

program.parse(process.argv);

const full_config_path = path.resolve(process.cwd(), program.config);

if (!fs.existsSync(full_config_path)) {
    console.error(chalk.red(`[ERROR] Config file ${full_config_path} not found`));
    process.exit(1);
}

const config: IAppConfig = <IAppConfig>json_from_schema(jtomler(full_config_path), config_schema);

let i = 0;

for (let item of config.app) {

    item = <IStarterAppConfig>json_from_schema(item, app_schema);

    const ajv_item = new Ajv();
    const validate_item = ajv_item.compile(app_schema);

    if (!validate_item(item)) {
        console.error(chalk.red(`[ERROR] Config app parsing error. Schema errors:\n${JSON.stringify(validate_item.errors, null, 2)}`));
        process.exit(1);
    }

    config.app[i] = item;

    ++i;

}

const ajv = new Ajv();
const validate = ajv.compile(config_schema);

if (!validate(config)) {
    console.error(chalk.red(`[ERROR] Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`));
    process.exit(1);
}

export default config;