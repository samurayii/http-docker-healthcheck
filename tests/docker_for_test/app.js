/* eslint-disable @typescript-eslint/no-var-requires */
const http = require("http");

const app_name = "app1";
const port = 6001;

const server = http.createServer((req, res) => {

    console.log(`received http request: ${req.url}`);

    if (req.url === "/webhook") {
        process.exit();
    }

    if (req.url === "/healthcheck") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end(`Hello this is ${app_name}`);
        return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Hello this is ${app_name}`);

});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

process.on("SIGTERM", () => {
    console.log("Termination signal received");
    process.exit();
});