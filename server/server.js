const express = require('express');
const app = express();
app.use(express.static('src'));
// app.use(express.urlencoded());
app.use(express.json()); // Parse URL-encoded enquiries
const cors = require('cors');
app.use(cors());

const pool = require('./DBConfig.js');

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
})

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
})

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
})

app.put('/put/editroutine', async function (req, resp) {
    const {old_routine, edited_routine} = req.body;

    async function routine_days_and_movements() {

    }

    /*
    routine_days_and_movements:
    - delete all the rows with movements that WERE in the routine but now AREN'T
    - add new rows with movements that WEREN'T in the routine before but not ARE
    */

    resp.send(`Bam`);
})

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
})

//////////////////
////// LOGS //////
//////////////////
app.get('/get/alllogs', async function (req, resp) {
     
    try {
        const response = await pool.query("SELECT * FROM logs");
        
        resp.json(response.rows);
    } catch (error) {
        console.error(error.message);
        
        resp.json(error.message);
    }
})

app.post('/post/logprogress', async function (req, resp) { // NOT FINISHED
    const body = req.body;
    for (let entry of Object.entries(body)) {
        const queryString = (entry[1].notes === " ")
            ? "INSERT INTO logs($1,$3,$5,$7,$9) VALUES($2,$4,$6,$8,$10)"
            : "INSERT INTO logs($1,$3,$5,$7,$9,$11) VALUES($2,$4,$6,$8,$10,$12)";
        const queryParams = (entry[1].notes === " ")
            ? [
                "movement_name", entry[0], // $1, $2
                "date", entry[1].date, // $3, $4
                "weight", entry[1].weight, // $5, $6
                "sets_completed", entry[1].sets, // $7, $8
                "reps_completed", entry[1].reps // $9, $10
            ]
            : [
                "movement_name", entry[0], // $1, $2
                "date", entry[1].date, // $3, $4
                "weight", entry[1].weight, // $5, $6
                "sets_completed", entry[1].sets, // $7, $8
                "reps_completed", entry[1].reps, // $9, $10
                "notes", entry[1].notes // $11, $12
            ];
        try {
            const queryPromise = await pool.query(queryString,queryParams);
            resp.send("Successfully logged progress.")
        } catch (error) {
            console.error(error.message);
            resp.send(error.message)   ;
        }
    }
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
})

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
})

app.listen(8090, () => {
    console.log('Listening on http://localhost:8090'); 
});