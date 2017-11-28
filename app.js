const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const db = require('./db');
const Promise = require('bluebird');
const redis = require('redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const app = express();
const redisClient = redis.createClient(config.redis);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});


// using ejs as view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// using body parser for parsing POST requests body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', async (req, res) => {
    try {
        let { name } = req.body;

        let result = await redisClient.setAsync(Date.now(), name);

        res.json({
            success: true
        });
    }
    catch (err) {
        res.json({
            success: false,
            err
        });
    }
});

app.listen(config.port, () => {
    // save data in every minute
    setInterval(saveCache, 60000);
    console.log(`server listening on ${config.port}`);
});

// save cached user data to database and flush redis
async function saveCache() {
    let keys = await redisClient.keysAsync('*');
    let keyValuePairs = keys.map(key => new Promise(async (resolve) => {
        let value = await redisClient.getAsync(key);

        resolve({
            name: value,
            createdAt: Number(key)
        });
    }));

    let instances = await Promise.all(keyValuePairs);

    await db.Name.bulkCreate(instances);
    await redisClient.flushdbAsync();

    console.log(`Entries are saved and redis is cleared ${instances.length}`);
}
