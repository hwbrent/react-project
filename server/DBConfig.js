const Pool = require("pg").Pool;

/*
const pool = new Pool({
    user: process.env.REACT_APP_POOL_USER,
    password: process.env.REACT_APP_POOL_PASSWORD,
    host: process.env.REACT_APP_POOL_HOST,
    port: process.env.REACT_APP_POOL_PORT,
    database: process.env.REACT_APP_POOL_DATABASE
});
*/

const pool = new Pool({
    user: "henrybrent",
    password: "gLP|3M$9y-N!;V-",
    host: "localhost",
    port: 2468, // NOT 8090 -- THATS THE PORT THAT THE SERVER'S LISTENING ON
    database: "test"
});

module.exports = pool;
