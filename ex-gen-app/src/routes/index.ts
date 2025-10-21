import {Router} from 'express'

const router = Router();


router.get('/', async (req, res, next) => {
    const name = req.query.name;
    const mail = req.query.mail;
    const data = {
        title: "Hello",
        content: "これは、サンプルのコンテンツです<br>this is sample content."
    };
    res.render('index', data)
})

export default router;