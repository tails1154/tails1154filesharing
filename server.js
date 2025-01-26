var http = require('http');
var url = require('url');
const { v4: uuidv4 } = require('uuid');

var transfering = false;
var secondready = false;
var fileuploading = false;
var uuid1 = uuidv4();
var uuid2 = uuidv4();
var filename = "";
var filedata = "";
var uploading = false;


http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const q = parsedUrl.query;
    const path = parsedUrl.pathname;


    console.log("Got request for: " + req.url);
    if (path === "/")
    {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("Server OK");
        res.end();
    }
    else if (path === "/version")
    {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("1.0.0");
        res.end();
    }
    else if (path === "/init")
    {
        if (!transfering)
        {
            transfering = true;
            secondready = true;
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            uuid1 = uuidv4();
            uuid2 = uuidv4();
            res.write(uuid1);
            res.end();
        }
        else
        {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/init2")
    {
        if (transfering && secondready)
        {
            secondready = false;
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            uuid2 = uuidv4();
            res.write(uuid2);
            res.end();
        }
        else {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/setfilename")
    {
        if (transfering && q.filename && q.uuid)
        {
            if (q.uuid === uuid1)
            {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                filename = q.filename;
                res.write(q.filename);
                res.end();
            }
            else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end();
            }
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/send")
    {
        if (transfering && q.uuid)
        {
            if (q.uuid == uuid1)
            {
                uploading = true;
                var request = req;
                if (req.method == 'POST') {
                    var body = '';

                    req.on('data', function (data) {
                        body += data;

                        // Too much POST data, kill the connection!
                        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                        if (body.length > 1e6)
                            req.connection.destroy();
                    });

                    req.on('end', function () {
                        filedata = body;
                        res.end();
                        uploading = false;
                    });
                }
                else {
                    res.writeHead(405, { 'Content-Type': 'text/plain' });
                    res.write("Wrong Method");
                    res.end();
                }
            }
            else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end();
            }
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/getfilename") {
        if (q.uuid && q.uuid === uuid2) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(filename);
            res.end();
        }
        else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/" + filename) {
        if (q.uuid && q.uuid === uuid2) {
            res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
            res.write(filedata);
            res.end();
            transfering = false;
            transfering = false;
            secondready = false;
            fileuploading = false;
            uuid1 = uuidv4();
            uuid2 = uuidv4();
            filename = "";
            filedata = "";
            uploading = false;
        }
        else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/uploadingfile") {
        if (q.uuid && q.uuid === uuid2) {
            if (uploading) {
                res.writeHead(900, { 'Content-Type': 'text/plain' });
                res.end();
            }
            else {
                res.writeHead(901, { 'Content-Type': 'text/plain' });
                res.end();
            }
        }
    }
    else if (path === "/ready") {
        if (transfering && secondready == false)
        {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end();
        }
        else {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
            res.end();
        }
    }
    else if (path === "/done") {
        if (transfering)
        {
            res.writeHead(503);
            res.end();
        }
        else {
            res.writeHead(200);
            res.end();
        }
    }
    else
    {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write("404 Not Found");
        console.warn("404 Not Found for: " + req.url);
        res.end();
    }
}).listen(9091);
console.log("Ready on port 9091");
