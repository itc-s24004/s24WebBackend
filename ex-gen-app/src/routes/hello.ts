import { Router } from 'express'

const router = Router()

router.get('/', async (_req, res, _next) => {
    const data = {
        title: 'Hello!',
        content: '※何か書いて送信してください。'
    }
    res.render('hello', data)
})

router.post('/post', async (req, res, _next) => {
    const msg = req.body.message as string | undefined
    const data = {
        title: 'Hello!',
        content: `あなたは、「${msg}」と送信しました。`
    }
    res.render('hello', data)
})

export default router