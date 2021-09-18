const Pool  = require("pg").Pool;

const pool = new Pool({
    user: "henrybrent",
    password: "gLP|3M$9y-N!;V-",
    host: "localhost",
    port: 2468,
    database: "test"
});

module.exports = pool;
