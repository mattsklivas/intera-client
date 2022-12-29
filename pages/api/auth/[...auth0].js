import auth0 from '../../../auth/auth0'

export default auth0.handleAuth({
    async callback(req, res) {
        try {
            await auth0.handleCallback(req, res)
        } catch (error) {
            res.redirect('/')
        }
    },
})
