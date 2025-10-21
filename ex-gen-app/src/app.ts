import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from "express-session"

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import helloRouter from './routes/hello.js'

const app = express()


app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(session({
    secret: 'ryeoqiwdhafjsvojdaep[kfdalsn',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    }
}))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/hello", helloRouter);


app.use(async (req: Request, res: Response, next: NextFunction) => {
    throw createError(404);
});


app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {

    res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error';
    res.locals.error = req.app.get('env') === 'development' ? err : {};


    res.status(hasProperty(err, 'status') && Number(err.status) || 500);
    res.render('error');
});


function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
    return (
        x instanceof Object && name.every(prop => prop in x)
    );
}

export default app