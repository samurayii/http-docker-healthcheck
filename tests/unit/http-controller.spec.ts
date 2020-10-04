import { Logger } from "logger-flx";
import { DockerConnector } from "../../src/lib/docker-connector";
import { HttpController } from "../../src/lib/http-controller";

describe("Http-controller", function() {

    const logger = new Logger({
        mode: "debug",
        enable: true,
        type: true,
        timestamp: "time"
    });

    it("create", function() {

        const docker_connector_config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(docker_connector_config, logger);

        new HttpController(docker_connector, logger);
    });

    it("create, docker-connector run, stop", function(done) {

        this.timeout(5000);
        this.slow(10000);

        const docker_connector_config = {
            label_prefix: "healthcheck",
            host: "localhost",
            port: 2375,
            version: "v1.38",
            interval: 3
        };

        const docker_connector = new DockerConnector(docker_connector_config, logger);

        const http_controller = new HttpController(docker_connector, logger);

        http_controller.run();

        docker_connector.run().then( () => {

            setTimeout( () => {

                http_controller.stop();

                docker_connector.stop().then( () => {
                    done();
                });

            }, 3000);

        });

    });


});