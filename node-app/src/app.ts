import http from "node:http";
import fs from "node:fs/promises";
import path from "path";
import url from "node:url";
import pug from "pug";


const style_css = await fs.readFile("./style.css", "utf8");

const index_template = pug.compileFile("./index.pug");

const other_template = pug.compileFile("./other.pug");



const server = http.createServer(getFromClient);


const PORT = 3210;
const SERVER_ROOT_URL = `http://localhost:${PORT}`;

server.listen(PORT, () => {
    console.log("Server start!")
    console.log(SERVER_ROOT_URL);
});









async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parse = new url.URL(req.url || "", SERVER_ROOT_URL);

    switch (url_parse.pathname) {
        case "/":{
            const content = index_template({
                title: "Index",
                content: "これはテンプレートを使ったサンプルページです。"
            });
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.write(content);
            break
        }

        case "/other":{
            const content = other_template({
                title: "Other",
                content: "これはテンプレートを使ったサンプルページです。"
            });
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.write(content);
            break
        }

        case "/style.css":
            res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
            res.write(style_css);
            break

        default:
            res.writeHead(404, "Not Found");
    }


    res.end();
}