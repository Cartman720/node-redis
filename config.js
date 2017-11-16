const config = {
    development: {
        port: 8080,
        redis: 6379,
        db: 'postgres://postgres:localhost@localhost:5432/task_db'
    },

    production: {
        port: 8080,
        redis: 6379,        
        db: '' // your db url
    }
};

let env = process.env.NODE_ENV || 'development';

module.exports = config[env];
