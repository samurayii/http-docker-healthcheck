import { Logger } from "logger-flx";
import { DockerConnector } from "../../src/lib/docker-connector";

describe("Docker-connector", function() {

    const logger = new Logger({
        mode: "debug",
        enable: false,
        type: true,
        timestamp: "time"
    });

    it("create", function() {

        const config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        new DockerConnector(config, logger);
    });

    it("run, stop", function(done) {

        this.timeout(30000);

        const config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(config, logger);

        docker_connector.run().then( () => {
            docker_connector.stop().then( () => {
                done();
            });
        });
    });

    it("list", async function() {

        this.timeout(30000);

        const config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(config, logger);

        await docker_connector._listContainers();
    });

    it("check", async function() {

        this.timeout(30000);

        const config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(config, logger);

        await docker_connector._checkHashes();
    });

    it("restart", async function() {

        this.timeout(30000);

        const config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(config, logger);

        await docker_connector.restart("test-app");
    });

});