import http from "node:http";
import fs from "node:fs/promises";
import path from "path";
import url from "node:url";
import pug from "pug";
import qs from "node:querystring";
import * as console from "node:console";


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






const data = {
    msg: 'no message...'
}



async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || "", SERVER_ROOT_URL);

    switch (url_parts.pathname) {
        case '/':
            await response_index(req, res)
            break

        case '/other':
            await response_other(req, res)
            break

        case "/style.css":
            res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
            res.write(style_css);
            break

        default:
            res.writeHead(404, "Not Found");
    }


    res.end();
}



async function response_index(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.method === "POST") {
        const post_data = await parse_body(req);
        data.msg = post_data.msg as string;

        setCookie('msg', data.msg, res)
        res.writeHead(302, 'Found', {
            'Location': '/',
        });
        res.end();
    } else {
        write_index(req, res);
    }
    // const msg = "これはIndexページです";
    // const content = index_template({
    //     title: "Index",
    //     content: msg,
    //     data
    // });
    // res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    // res.write(content);
    // res.end();
}

async function response_other(req: http.IncomingMessage, res: http.ServerResponse) {
    let msg = "これはOtherページです";

    if (req.method === "POST") {
        const post_data = await (new Promise<qs.ParsedUrlQuery>((res, rej) => {
            let body = "";
            req.on("data", (chunk) => body += chunk);
            req.on("end", () => {
                try {
                    res(qs.parse(body));
                } catch (err) {
                    console.log(err);
                    rej(err);
                }
            });
        }));
        msg += `あなたは「${post_data.msg}」と書きました。`
        const content = other_template({
            title: 'Other',
            content: msg,
        });
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        res.write(content);
        res.end();

    } else {
        const content = other_template({
            title: 'Other',
            content: 'ページがありません。',
        });
        res.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'});
        res.write(content);
        res.end();

    }
}



function parse_body(req: http.IncomingMessage): Promise<qs.ParsedUrlQuery> {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', (chunk) => {
            body += chunk
        })
        req.on('end', () => {
            try {
                resolve(qs.parse(body))
            } catch (e) {
                console.error(e)
                reject(e)
            }
        })
    })
}


function write_index(req: http.IncomingMessage, res: http.ServerResponse) {
    const cookie_data = getCookie(req)
    const content = index_template({
        title: 'Index',
        content: '※伝言を表示します。',
        data: data,
        cookie_data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
    res.write(content)
    res.end()
}

function setCookie(key: string, value: string, res: http.ServerResponse) {
    const encoded_cookie = qs.stringify({[key]: value})
    res.setHeader('Set-Cookie', [encoded_cookie])
}

function getCookie(req: http.IncomingMessage) {
    const cookie_data = req.headers.cookie != undefined ? req.headers.cookie : ''
    const data = cookie_data.split(';').map(val => qs.parse(val.trim()))
        .reduce((acc ,val) => ({...acc, ...val}))
    return data || {}
}