module.exports = (express) => {
    
        const router = express.Router();

    
        router.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html');
        });
        router.get('/test', (req, res) => {
            res.sendFile(__dirname + '/test.html');
        });
        router.get('/test2', (req, res) => {
            res.sendFile(__dirname + '/test2.html');
        });

        return router;
    }
    