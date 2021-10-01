const express = require('express');
const app = express();
app.use(express.static('src'));
app.use(express.json()); // Parse URL-encoded enquiries
const cors = require('cors');
app.use(cors());
require("dotenv").config();

const pool = require('./DBConfig.js');

function timeAdjust(dateString, h) { // for some reason the date pulled from the API is adjusted (I think because of British Summer Time) so this corrects that
    const addHoursOperation = new Date(dateString).getTime() + (h*60*60*1000);
    const newDate = new Date(addHoursOperation);
    return newDate.toISOString().slice(0,10);
}

function rectifyLogsDate(logs) {
    let out = [];
    for (let log of logs) {
        let copy = Object.assign({}, log);
        copy.date = timeAdjust(log.date, 3);
        out.push(copy);
    }
    return out;
}

function removeObjectKeyValuePairs(obj, keys) {
    const out = {};
    for (let [key, value] of Object.entries(obj)) {
        if (keys.includes(key) === false) out[key] = value;
    }
    return out;
}

app.get('/', function (req, resp) {
    resp.send("Welcome to the gym buddy API. Please make yourself feel at home <3")
});

///////////////////////
////// MOVEMENTS //////
///////////////////////
app.get('/get/allmovements', async function (req, resp) {
    /*
    Sends an array of objects (if successful).
    Example object:
    {
        "movement_name": "Arnold Press",
        "default_sets": 3,
        "default_reps": 8,
        "youtube_link": "https://youtu.be/6Z15_WdXmVw"
    }
    */
    try {
        const movements = await pool.query(
            "SELECT * " + 
            "FROM movements " +
            "ORDER BY movement_name"
        );
        resp.json(movements.rows); // sends an array of objects
    } catch (error) {
        console.error(error.message);
        resp.send(error.message);
    }
});

app.get('/get/movement/:movement_name', async function (req, resp) {
    const queryResponse = await pool.query(
        "SELECT * " +
        "FROM movements " +
        "WHERE movement_name = $1",
        [req.params.movement_name]
    );
    console.log(queryResponse.rows);
    if (queryResponse.rows.length !== 0) {
        resp.json(queryResponse.rows);
    } else {
        resp.send("Failed to find movement", req.params.movement_name);
    }
});

app.post('/post/addmovement', async function (req, resp) {
    const body = req.body;
    try {
        const queryPromise = await pool.query(
            "INSERT " +
            "INTO movements " +
            "VALUES ($1, $2, $3, $4)",
            [
                body.movement_name, // $1
                body.default_sets, // $2
                body.default_reps, // $3
                body.youtube_link // $4
            ]
        );
        resp.send("Movement added successfully!");
    } catch (error) {
        console.error(error.message);
        resp.send(error.message)
    }
});

app.put('/put/editmovement', async function (req, resp) {
    const { prevMovementDetails, newMovementDetails } = req.body;
    try {
        const queryPromise = await pool.query(
            "UPDATE movements " +
            "SET movement_name = $1, default_sets = $2, default_reps = $3, youtube_link = $4 " +
            "WHERE movement_name = $5",
            [
                newMovementDetails.movement_name, // $1
                newMovementDetails.default_sets, // $2
                newMovementDetails.default_reps, // $3
                newMovementDetails.youtube_link, // $4
                prevMovementDetails.movement_name // $5.  name is enough bc it's the PK of the table
            ]
        );
        resp.send("Movement edited successfully!")
    } catch (error) {
        console.log(error.message);
        resp.send(error.message);
    }
});

app.delete('/delete/movement/:movement_name', async function (req, resp) {
    /* The tables `routine_days_and_movements` and `logs` reference movement_name.
    So remove a single movement, you have to remove every entry in the DB that is a FK to the movements table
    E.g. if you wanted to remove Bench Press, you'd have to:
     - remove it from routine_days_and_movements
     - delete all the logs that include Bench Press
     - delete the Bench Press movement itself
     - replace all the deleted logs with logs that are the same, but put the movement_name as `NULL` and in the notes add that it was Bench Press */
    const movement_name = req.params.movement_name;
    try {
        const deleteRoutine_days_and_movementsEntries = await pool.query(
            "DELETE " +
            "FROM routine_days_and_movements " +
            "WHERE movement_name = $1",
            [movement_name]
        );
        const deleteLogs = await pool.query(
            "DELETE " +
            "FROM logs " +
            "WHERE movement_name = $1",
            [movement_name]
        );
        const deleteMovement  = await pool.query(
            "DELETE " +
            "FROM movements " +
            "WHERE movement_name = $1",
            [movement_name]
        );
        resp.send(`Movement '${movement_name}' and related data removed`);
    } catch (error) {
        console.error(error.message);
        resp.send(error.message);
    }
});

//////////////////////
////// ROUTINES //////
//////////////////////
app.get('/get/routinenames', async function (req, resp) {
    // Sends an array of the names of the routines in the `routines` table
    // can use the response from this endpoint, then set up a for loop and call the endpoint below to get the object for each routine
    try {
        const response = await pool.query(
            "SELECT * " +
            "FROM routines"
        );
        // console.log("Response:", response.rows);
        const namesArray = response.rows.map(obj => obj.routine_name);
        resp.json(namesArray);
    } catch (error) {
        console.error(error.message);
        resp.send(error.message);
    }
});

app.get('/get/routine/:routine_name', async function (req, resp) {
    // Not sure if more referential integrity would improve the efficiency of this...?
    async function get_routine_name(routine_name_param) {
        console.log("Getting routine name...");
        const response = await pool.query(
            "SELECT routine_name " +
            "FROM routines " +
            "WHERE routine_name = $1",
            [routine_name_param]
        ); // returns one row since routine_name is a PK
        const data = await response.rows;
        if (data.length === 0) throw new Error(`Error: '${routine_name_param}' is not in the 'routines' table.`);
        else return data[0].routine_name;
    }

    async function get_routine_days(routine_name) {
        console.log("Getting routine days...");
        const response = await pool.query(
            "SELECT day_name " +
            "FROM routine_days " +
            "WHERE parent_routine_name = $1",
            [routine_name]
        );
        const arr = await response.rows;
        // `arr` will look something like:
        // [ { day_name: 'Push' }, { day_name: 'Pull' }, { day_name: 'Legs' } ]
        const routine_days = arr.map(entry => entry.day_name);
        return routine_days;
    }

    async function get_routine_days_and_movements(routine_days) {
        console.log("Getting routine days and movements...");
        let routine_days_and_movements_obj = {};
        for (let day_name of routine_days) {
            const response = await pool.query(
                "SELECT movement_name " +
                "FROM routine_days_and_movements " +
                "WHERE parent_day_name = $1",
                [day_name]
            );
            const arr = await response.rows;
            const movement_array = arr.map(entry => entry.movement_name);
            routine_days_and_movements_obj[day_name] = movement_array;
        }
        return routine_days_and_movements_obj;
    }

    try {
        const routine_name = await get_routine_name(req.params.routine_name);
        const routine_days = await get_routine_days(routine_name);
        const routine_days_and_movements = await get_routine_days_and_movements(routine_days);
        const routine_object = {
            name: routine_name,
            contents: routine_days_and_movements
        };
        console.log("Success!");
        
        resp.json(routine_object);
    } catch (error) { // typeof error.message === string
        console.error(error.message);
        resp.send(error.message);
    }
});

app.post('/post/addroutine', async function (req, resp) {
    /*
    req.body should look something like:
        {
            "routine_name": string,
            "formData": {
                day1: array of movements,
                ...
                dayn: array of movements
            }
        }
    */
    async function routines(routine_name) {
        const response = await pool.query(
            "INSERT INTO routines (routine_name) VALUES ($1)",
            [routine_name]
        );
        console.log(`Inserted ${routine_name} into routines`);
    }

    async function routine_days(formData, routine_name) {
        const day_names = Object.entries(formData).map(entry => entry[0]);
        for (let day_name of day_names) {
            const response = await pool.query(
                "INSERT INTO routine_days VALUES (DEFAULT, $1, $2)",
                [day_name, routine_name]
            );
            console.log(`Inserted ${day_name} into routine_days`);
        }
    }

    async function routine_days_and_movements(formData) {
        for (let [parent_day_name, movements_array] of Object.entries(formData)) {
            for (let movement_name of movements_array) {
                const response = pool.query(
                    "INSERT INTO routine_days_and_movements (parent_day_name, movement_name) VALUES ($1, $2)",
                    [parent_day_name, movement_name]
                )
                console.log(`Inserted (${parent_day_name}, ${movement_name}) into routine_days_and_movements`);
            }
        }
    }

    try {
        await routines(req.body.routine_name);
        await routine_days(req.body.formData, req.body.routine_name);
        await routine_days_and_movements(req.body.formData);
        resp.send("Routine successfully inserted into DB");
    } catch (error) {
        resp.send(error.message);
    }
});

app.put('/put/editroutine', async function (req, resp) {
    //
    resp.send(`Bam`);
});

app.delete('/delete/routine', async function (req, resp) {
    /*
    Receives an object like:
    {
        name: "Bruh",
        contents: {
            day1: [],
            ...
            dayn: []
        }
    }
    */
    const obj = req.body;
    // resp.send(`Received: ${JSON.stringify(obj)}`);
    // First delete from routine_days_and_movements
    async function routine_days_and_movements(arg) {
        for (const [parent_day_name, movements] of Object.entries(arg)) {
            for (const movement_name of movements) {
                const request = await pool.query(
                    "DELETE " +
                    "FROM routine_days_and_movements "
                    + "WHERE parent_day_name = $1 AND movement_name = $2",
                    [parent_day_name, movement_name]
                );
                console.log(`routine_days_and_movements() : removed row ${parent_day_name}, ${movement_name}`);
            }
        }
    }
    // Then delete days from routine_days
    async function routine_days(arg) {
        for (const day_name of Object.keys(arg)) {
            const request = await pool.query(
                "DELETE " +
                "FROM routine_days " +
                "WHERE day_name = $1",
                [day_name]
            );
        }
    }
    async function routines(routine_name) {
        const request = await pool.query(
            "DELETE " +
            "FROM routines " +
            "WHERE routine_name = $1",
            [routine_name]
        );
    }
    try {
        routine_days_and_movements(obj.contents);
        routine_days(obj.contents);
        routines(obj.name);
        console.log(`Successfully deleted routine '${obj.name}'`);
        resp.send(`Successfully deleted routine '${obj.name}'`);
    } catch (error) {
        console.error(error.message);
        resp.send(error.message, "please try again");
    }
});

//////////////////
////// LOGS //////
//////////////////
app.get('/get/alllogs', async function (req, resp) {
    /*
    Array of objects. Example object:
    {
        "log_id":1,
        "movement_name":"Barbell Squat",
        "date":"2021-08-30T23:00:00.000Z",
        "weight":"22.5",
        "sets_completed":3,
        "reps_completed":6,
        "notes":null
    }
    */
    try {
        const response = await pool.query("SELECT * FROM logs");
        resp.json(response.rows);
    } catch (error) {
        console.error(error.message);
        resp.json(error.message);
    }
});

app.post('/post/logprogress', async function (req, resp) {
    /*
    req.body --> array of logs
    log should look like:
        {
            movement_name: 'Assisted Pull Up',
            date: '2021-09-21',
            weight: 54,
            sets_completed: 3,
            reps_completed: 8,
            notes: null
        }
    */
    
    // get a list of the logs to compare against what is in req.body:
    let logs;
    try {
        const response = await pool.query("SELECT * FROM logs");
        const rows = await response.rows;
        logs = await rectifyLogsDate(rows);
        logs = logs.map(log => removeObjectKeyValuePairs(log, ["log_id"]))
        logs = JSON.stringify(logs);
    } catch (error) {
        console.error(error.message);
    }

    const format = log => `(${log.slice(1, log.length - 1)})`;

    let duplicates = [];
    for (let reqLog of req.body) {
        const copy = { // did this bc for whatever reason the DB returns the `weight` value as a string instead of a floating point number
            ...reqLog,
            weight: reqLog.weight.toString()
        };
        // check that the log isn't already in the DB:
        if (logs.includes(JSON.stringify(copy))) {
            const logValues = Object.values(reqLog);
            duplicates.push(format(JSON.stringify(logValues)));
            continue;
        }
        try {
            const response = await pool.query(
                "INSERT INTO logs(movement_name, date, weight, sets_completed, reps_completed, notes) VALUES ($1,$2,$3,$4,$5,$6)",
                Object.values(reqLog)
            );
        } catch (error) {
            console.error(error.message);
            resp.send(error.message);
        }
    }
    const outString = (duplicates.length === 0)
        ? "Successfully added log(s) to the database!"
        : `Error: Duplicate logs. The following weren't added to the database:\n${JSON.stringify(duplicates, null, 2)}}`;
    resp.send(outString);
});

app.put('/put/editlog', async function (req, resp) {
    const { prevLogDetails, newLogDetails } = req.body;
    try {
        const queryPromise = await pool.query(
            "UPDATE logs " +
            "SET movement_name = $1, date = $2, weight = $3, sets_completed = $4, reps_completed = $5, notes = $6 " +
            "WHERE log_id = $7",
            [
                // SET:
                newLogDetails.movement_name, // $1
                newLogDetails.date, // $2
                newLogDetails.weight, // $3
                newLogDetails.sets_completed, // $4
                newLogDetails.reps_completed, // $5
                newLogDetails.notes, // $6
                // WHERE:
                prevLogDetails.log_id // $7
            ]
        );
        resp.send("Log edited successfully");
    } catch (error) {
        console.log("Error:", error.message);
        resp.send(error.message);
    }
});

app.delete('/delete/log/:log_id', async function (req, resp) {
    try {
        const response = await pool.query(
            "DELETE " +
            "FROM logs " +
            "WHERE log_id = $1",
            [req.params.log_id]
        );
        resp.send("Log successfully removed");
    } catch (error) {
        resp.send(error.message);
    }
});

////////////////////////////////
////// STRENGTH STANDARDS //////
////////////////////////////////

app.get("/get/strengthstandards/:movement_name", async function (req, resp) {
    console.log(req.params.movement_name);
    const urls = await require("../src/strength-standards/urls.json");
    if (req.params.movement_name === "urls") return resp.json(urls);

    // tries to find the url in urls.json corresponding to the movement_name parameter
    const found = urls.find(url => url.includes(req.params.movement_name));
    console.log(found);
    if (!found) {
        return resp.json(`Error: '${req.params.movement_name}' isn't in 'urls.json'.`);
    }

    const { execSync } = require('child_process'); // syncronous 

    let data;
    try {
        // the python script prints the JSON object, and the .toString picks that up and stores it in a variable
        const command = await execSync(`python3 /Users/henrybrent/Documents/misc/react-project/src/strength-standards/strengthLevelsScraper.py ${found}`);
        data = await JSON.parse(command.toString("utf-8"));
    } catch (error) {
        data = error.message;
    }
    console.log(data);

    return resp.json(data);
})

const port = process.env.REACT_APP_SERVER_PORT;

app.listen(port, () => {
    const url = process.env.REACT_APP_BASE_SERVER_URL;
    console.log(`\nListening on ${url}:${port}\n`);
});