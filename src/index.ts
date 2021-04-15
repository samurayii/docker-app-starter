#!/usr/bin/env node
import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Starter } from "./lib/starter";

//console.log(config);

const logger = new Logger(config.logger);
const starter = new Starter(config.app, logger);

starter.run();

process.on("SIGTERM", () => {

    logger.log("[Starter] Termination signal received");

    starter.on("app:close", (app_name) => {
        logger.log(`[Starter] Application ${app_name} closed`);
        if (starter.count <= 0) {
            process.exit();
        }
    });

    starter.stop();
    
});