#!/usr/bin/env node
import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Starter } from "./lib/starter";

const logger = new Logger(config.logger);
const starter = new Starter(config.app, logger);

starter.run();

process.on("SIGTERM", () => {
    console.log("💀 Termination signal received 💀");
    process.exit();
});