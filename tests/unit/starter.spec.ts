import { Logger } from "logger-flx";
import { expect } from "chai";
import { IStarterAppConfig, Starter } from "../../src/lib/starter";

describe("Store", function() {

    const logger = new Logger({
        mode: "debug",
        enable: true,
        type: true,
        timestamp: "time"
    });

    it("create", function() {

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config];

        new Starter(starter_config, logger);
    });

    it("run and stop", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {
            starter.stop();
            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

    it("run (error)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app221.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {
            if (starter.count <= 0) {
                done();
            } else {
                done(new Error(`Starter not stopped (count = ${starter.count})`));
            }
        }, 2000);

    });

    it("run and stop (2 app)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const app2_config: IStarterAppConfig = {
            name: "app2",
            cwd: __dirname,
            command: "node ../test_app2.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config, app2_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {
            starter.stop();
            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

    it("run and stop (app error code)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app_error.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {
            if (starter.count <= 0) {
                done();
            } else {
                done(new Error(`Starter not stopped (count = ${starter.count})`));
            }
        }, 5000);
    });

    it("run and stop (critical = false, restart = true)", function(done) {

        this.timeout(15000);
        this.slow(25000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app_error.js",
            critical: false,
            restart: true,
            restart_interval: 3,
            env: {
                scope: "none",
                include_regexp: ".*",
                keys: {}
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {
            starter.stop();
            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 7000);
    });
  
    it("run and stop (ENV=app)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "app",
                include_regexp: ".*",
                keys: {
                    ENV1_KEY: "env-key1-val",
                    ENV2_KEY: "env-key2-val"
                }
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {

            starter.stop();

            const app = starter.getApp("app1");
            const env = app.env;
          
            expect(env.ENV1_KEY).equal("env-key1-val");
            expect(env.ENV2_KEY).equal("env-key2-val");

            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

    it("run and stop (ENV=os)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "os",
                include_regexp: ".*",
                keys: {
                    ENV1_KEY: "env-key1-val",
                    ENV2_KEY: "env-key2-val"
                }
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {

            starter.stop();

            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

    it("run and stop (ENV=all)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "all",
                include_regexp: ".*",
                keys: {
                    ENV1_KEY: "env-key1-val",
                    ENV2_KEY: "env-key2-val"
                }
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {

            starter.stop();

            const app = starter.getApp("app1");
            const env = app.env;

            expect(env.ENV1_KEY).equal("env-key1-val");
            expect(env.ENV2_KEY).equal("env-key2-val");

            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

    it("run and stop (ENV=all)", function(done) {

        this.timeout(10000);
        this.slow(20000);

        const app1_config: IStarterAppConfig = {
            name: "app1",
            cwd: __dirname,
            command: "node ../test_app1.js",
            critical: true,
            restart: false,
            restart_interval: 2,
            env: {
                scope: "all",
                include_regexp: ".*",
                keys: {
                    ENV1_KEY: "${TERM_PROGRAM}",
                    ENV2_KEY: "env-key2-val"
                }
            }
        };

        const starter_config = [app1_config];

        const starter = new Starter(starter_config, logger);

        starter.run();

        setTimeout( () => {

            starter.stop();

            const app = starter.getApp("app1");
            const env = app.env;

            expect(env.ENV1_KEY).equal("vscode");
            expect(env.ENV2_KEY).equal("env-key2-val");

            setTimeout( () => {
                if (starter.count <= 0) {
                    done();
                } else {
                    done(new Error(`Starter not stopped (count = ${starter.count})`));
                }
            }, 2000);
        }, 2000);
    });

});