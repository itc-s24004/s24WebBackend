import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import * as pug from "pug";



const server = http.createServer(async (req, res) => {
    const content = pug.renderFile("index.pug")
    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
    res.write(content);
    res.end();
});


server.listen(3210, () => {
    console.log("server started\nhttp://localhost:3210");
});