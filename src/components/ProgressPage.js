import React, { useState, useEffect } from 'react';
import { MainBody, routine } from './components.js';

import Form from "@rjsf/core";

/*
function submitAllTogether() {}
function submitIndividually() {}
*/

// ProgressPage component version using react-jsonschema-form: https://github.com/rjsf-team/react-jsonschema-form
export function ProgressPage() {
    useEffect(() => {
        document.title = "Progress";
    });

    const [ chosenRoutineDay, setChosenRoutineDay ] = useState("push");
    const onRoutineDaySelectChange = ({target}) => {
        setChosenRoutineDay(target.value);
    }
    const routineDaySelect = (
        <>
        <form>
            <label>
                <i>Choose a day to log progress for:</i>
                <br />
                <select value={chosenRoutineDay} onChange={onRoutineDaySelectChange}>
                    <option value="push">Push</option>
                    <option value="pull">Pull</option>
                    <option value="legs">Legs</option>
                </select>
            </label>
            <hr />
        </form>
        </>
    );

    const movements = routine[chosenRoutineDay]; // object

    const onFormSubmit = ({formData},event) => {
        event.preventDefault();
        alert(JSON.stringify(formData));
    }

    const map = Object.entries(movements).map(entry => {
        const movementName = entry[0];
        const formattedMovementName = movementName.replace(/_/g, " ");
        const defaultSets = entry[1].sets;
        const defaultReps = entry[1].reps;
        const schemaTemplate = { // this is where the mapped array will come in
            [movementName]: {
                title: formattedMovementName,
                description: `Log your progress in ${formattedMovementName}.`,
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        format: "date"
                    },
                    weight: {
                        type: "number",
                        minimum: 1
                    },
                    sets: {
                        type: "number",
                        default: defaultSets,
                        minimum: 1
                    },
                    reps: {
                        type: "number",
                        default: defaultReps,
                        minimum: 0
                    }
                }
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
     schema={ {"title": "Log your progress here:", "type": "object", "properties": subSchema} }
     onSubmit={null} />

    return (
        <>
        <h1>Progress Page!!</h1>
        <MainBody 
            leftCol1={chosenRoutineDay}
            rightCol1={routineDaySelect}
            rightCol2={ RJSFForm } />
        </>
    );
}


export default ProgressPage;