import http from "node:http";
import fs from "node:fs/promises";
import pug from "pug";
import { URL } from "node:url";
import qs from "node:querystring"
import path from "node:path";

const pugIndex = pug.compileFile(path.join(import.meta.dirname, "index.pug"));
const pugLogin = pug.compileFile(path.join(import.meta.dirname, "login.pug"));

const MAX_MESSAGE = 10;

const DATA_FILENAME = "mydata.txt";

const messageData: Array<{ id: string, msg: string }> = await readFromFile(
    DATA_FILENAME
);

const server = http.createServer(getFromClient);


server.listen(3210, () => {
    console.log("Server start!");
});



async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url ?? "", "http://locahost:3210");
    switch (url?.pathname) {
        case "/": {
            await responseIndex(req, res);
            break;
        }
        case "/login": {
            await responseLogin(req, res);
            break;
        }
        default:
            res.writeHead(404, { "content-type": "text/plain" });
            res.end("no found page...");
            break;
    }
}


async function parseBody(req: http.IncomingMessage) {
    return new Promise<{ id: string; msg: string }>((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const parsed = qs.parse(body);
                resolve({ id: String(parsed.id), msg: String(parsed.msg) });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    });
}


async function responseLogin(
    _req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const content = pugLogin();
    res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
    res.write(content);
    res.end();
}

async function responseIndex(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    // POST ではないアクセス時
    if (req.method !== "POST") {
        const content = pugIndex({
            title: "Index",
            content: "※なにかメッセージを書いてください。",
            data: messageData,
        });
        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
        res.write(content);
        res.end();
        return;
    }
    const postData = await parseBody(req);
    await addToData(postData.id, postData.msg, DATA_FILENAME);

    res.writeHead(302, "Found", {
        Location: "/",
    });
    res.end();
}


async function readFromFile(filename: string) {
    const filepath = path.join(import.meta.dirname, filename);
    let fd: fs.FileHandle | null = null;
    let result: Array<{ id: string; msg: string }> = [];
    try {
        fd = await fs.open(filepath, "a+");
        result = (await fs.readFile(fd, { encoding: "utf-8" }))
            .split("\n")
            .filter((v) => v.length > 0)
            .map<{
                id: string;
                msg: string;
            }>((s) => s.length && JSON.parse(s));
    } catch (e) {
        console.error(e);
        return [];
    } finally {
        await fd?.close();
    }
    return result;
}

async function addToData(id: string, msg: string, filename: string) {
    messageData.unshift({ id, msg });
    if (messageData.length > MAX_MESSAGE) {
        messageData.pop();
    }
    await saveToFile(filename);
}


async function saveToFile(filename: string) {
    const filepath = path.join(import.meta.dirname, filename);
    const data = messageData.map((m) => JSON.stringify(m)).join("\n");
    try {
        await fs.writeFile(filepath, data);
    } catch (e) {
        console.error(e);
    }
}