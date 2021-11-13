const http = require('http');

const host = '192.168.43.217';
const port = 8000;

const fs = require('fs');
let indexData = fs.readFileSync("./index.html", "utf-8");
let scriptData = fs.readFileSync("./script.js", "utf-8");

function requestListener(req, res) {
    switch (req.url) {
        case '/':
            res.writeHead(200);
            res.end(indexData);
            break;
        case '/script.js':
            res.writeHead(200);
            res.end(scriptData);
            break;
        default:
            res.writeHead(404);
            res.end('<h1>404\nPage not found</h1>');
            break;
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
})
