import http from "node:http";
import fs from "node:fs/promises";
import path from "path";

const server = http.createServer(getFromClient);


server.listen(3000, () => {
    console.log("Server start!")
});


async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const data = await fs.readFile("./home.html", "utf8");

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write(data);
    res.end();
}