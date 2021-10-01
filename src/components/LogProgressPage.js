import React, { useState, useEffect } from 'react';
import { MainBody, MovementSelect } from './components.js';
import Form from "@rjsf/core";

function findIndices(iterable, target) {
    let indices = [];
    for (let i = 0; i < iterable.length; i++) {
        if (iterable[i] === target) indices.push(i);
    };
    return indices;
}

function split_upto(subscriptable, delimiter, last) {
    // subscriptable - subscriptable to be split up
    // delimiter -- char to be split on
    // n -- the nth occurence of the delimiter which is to be the last one to split on
    let toJoin = [];
    const indices = findIndices(subscriptable, delimiter);
    // console.log("indices:", indices);
    // indices.forEach(entry => console.log(subscriptable[entry]));
    const firstSegment = subscriptable.slice(0, indices[0]).replace("(", "");
    // console.log("firstSegment:", firstSegment);
    toJoin.push(firstSegment);
    for (let i = 0; i < last-1; i++) {
        let currentItemIndex = indices[i];
        let nextItemIndex = indices[i+1];
        // console.log(i, i+1, currentItemIndex, nextItemIndex);
        let el = subscriptable.slice(currentItemIndex+1, nextItemIndex).trim();
        // console.log(el);
        toJoin.push(el);
    }
    const lastSegment = subscriptable.slice(indices[last-1]+1, subscriptable.length).trim().replace(")", "");
    // console.log("lastSegment:", lastSegment);
    toJoin.push(lastSegment);
    return toJoin;
}

const submitAllTogether = (movements, onFormSubmit) => {
    const map = Object.entries(movements).map(entry => {
        const movementName = entry[0];
        const formattedMovementName = movementName.replace(/_/g, " ");
        const schemaTemplate = { // this is where the mapped array will come in
            [movementName]: {
                title: formattedMovementName,
                description: `Log your progress in ${formattedMovementName}.`,
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        format: "date",
                        default: new Date().toISOString().slice(0,10)
                    },
                    weight: {
                        type: "number",
                        minimum: 1
                    },
                    sets: {
                        type: "number",
                        default: entry[1].sets,
                        minimum: 1
                    },
                    reps: {
                        type: "number",
                        default: entry[1].reps,
                        minimum: 0
                    },
                    notes: {
                        type: "string",
                        default: " "
                    }
                },
                required: [
                    "date",
                    "weight",
                    "sets",
                    "reps"
                ]
            }
        }
        return schemaTemplate;
    })

    const subSchema = {};

    for (const entry of map) {
        const array = Object.entries(entry);
        const objectArray = array[0];
        subSchema[objectArray[0]] = objectArray[1];
    }

    const RJSFForm = <Form
        schema={{
            "title": "Log your progress here:",
            "type": "object",
            "properties": subSchema
        }}
        onSubmit={onFormSubmit}
    />

    return RJSFForm;
}

const submitIndividually = (movements, onFormSubmit) => {
    const map = Object.entries(movements).map(entry => {
        const movementName = entry[0];
        const formattedMovementName = movementName.replace(/_/g, " ");
        const schemaTemplate = { // this is where the mapped array will come in
            title: formattedMovementName,
            description: `Log your progress in ${formattedMovementName}`,
            type: "object",
            properties: {
                date: {
                    type: "string",
                    format: "date",
                    default: new Date().toISOString().slice(0,10)
                },
                weight: {
                    type: "number",
                    minimum: 1
                },
                sets: {
                    type: "number",
                    default: entry[1].sets,
                    minimum: 1
                },
                reps: {
                    type: "number",
                    default: entry[1].reps,
                    minimum: 0
                },
                notes: {
                    type: "string",
                    default: " "
                }
            },
            required: [
                "date",
                "weight",
                "sets",
                "reps"
            ]
            
        }
        return <Form schema={schemaTemplate} />
    })

    const formDiv = (
        <>
        <form onSubmit={onFormSubmit}>
            {map}
        </form>
        </>
    );

    return map;
}

function ManualSubmit() {
    const [ userInput, setUserInput ] = useState("");
    const handleSubmit = async (event) => {
        event.preventDefault();
        const clean = string => string.trim().replace(/(\(|\))/, ""); // replaces "(" or ")"
        const filtered = userInput.split("\n").map(entry => {
            // the .split("\n") splits each row in the <textarea>
            let log = entry;
            if (entry.endsWith(",") || entry.endsWith(";")) {
                log = entry.slice(0, entry.length - 1);
            }
            let data = log.split(","); // splits each individual log
            if (data.length > 5) data = split_upto(log, ",", 5); // there are notes (which could have commas in) so comma delimiter isn't ideal

            data = data.map(entry => clean(entry));

            let obj = { // the .slice() is to get rid of the extra apostrophes around the strings
                movement_name: data[0].slice(1, data[0].length - 1),
                date: data[1].slice(1, data[1].length - 1),
                weight: parseFloat(data[2]),
                sets_completed: parseInt(data[3]),
                reps_completed: parseInt(data[4]),
                notes: (data.length === 6) ? data[5].slice(1, data[5].length - 1) : null
            };
            return obj;
        });
        console.log(filtered);
        try {
            const response = await fetch("http://localhost:8090/post/logprogress", {
                method: "POST",
                body: JSON.stringify(filtered),
                headers: {'Content-Type': 'application/json'}
            });
            const message = await response.text();
            alert(message);    
        } catch (error) {
            alert(error.message);
        }
        await setUserInput("");
    }
    const form = (
        <form onSubmit={handleSubmit}>
            <label>
                You can manually enter multiple formatted logs into this box:
                <br />
                <textarea
                    value={userInput}
                    onChange={({target}) => setUserInput(target.value)}
                    id="ManualLogTextArea" // for css: resizing & mono font
                />
            </label>
            <br />
            <input type="submit" value="Submit" />
        </form>
    );
    return (
        <>
        {form}
        </>
    );
}

function FormatLogWidget() {
    const [ movement_name, set_movement_name] = useState("");
    const [ date, setDate ] = useState( new Date().toISOString().slice(0,10) );
    const [ weight, setWeight ] = useState(1);
    const [ sets_completed, set_sets_completed ] = useState(1);
    const [ reps_completed, set_reps_completed ] = useState(1);
    const [ notes, setNotes ] = useState("");

    const form = (
        <form>
            <MovementSelect label="Movement name:" handleChange={({target}) => set_movement_name(target.value)} />
            <br />
            <label>
                Date:
                <input type="date" value={date} onChange={({target}) => setDate(target.value)} />    
            </label> <br />
            <label>
                Weight:
                <input type="number" min="0.1" value={weight} onChange={({target}) => setWeight(target.value)} step="0.1"/>
            </label> <br />
            <label>
                Sets:
                <input type="number" min="1" value={sets_completed} onChange={({target}) => set_sets_completed(target.value)} />
            </label> <br />
            <label>
                Reps:
                <input type="number" min="1" value={reps_completed} onChange={({target}) => set_reps_completed(target.value)} />
            </label> <br />
            <label>
                Notes:
                <input type="text" value={notes} onChange={({target}) =>  setNotes(target.value)} />
            </label> <br />

        </form>
    );
    
    const formatted = `('${movement_name}', '${date}', ${weight}, ${sets_completed}, ${reps_completed}, ${(notes === "") ? JSON.stringify(null) : `'${notes}'`})`

    return (
        <>
        <h3>Formatting tool:</h3>
        {form}
        <hr />
        <p><i>Output:</i></p>
        <p id="FormatLogWidget_output">{formatted}</p>
        </>
    );

}

// ProgressPage component version using react-jsonschema-form: https://github.com/rjsf-team/react-jsonschema-form
export function LogProgressPage() {
    useEffect(() => {
        document.title = "Progress";
    });

    return (
        <>
        <h1>Progress Page!!</h1>
        <MainBody
            leftCol1={<FormatLogWidget />}
            rightCol1={<ManualSubmit />}
             />
        </>
    );
}

export default LogProgressPage;
