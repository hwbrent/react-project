import React, { useState, useEffect } from 'react';
import { MainBody, routine } from './components.js';
import Form from "@rjsf/core";

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

// ProgressPage component version using react-jsonschema-form: https://github.com/rjsf-team/react-jsonschema-form
export function LogProgressPage() {
    useEffect(() => {
        document.title = "Progress";
    });

    const [ chosenRoutineDay, setChosenRoutineDay ] = useState("push");
    const routineDaySelect = (
        <>
        <label>
            <i>Choose a day to log progress for:</i>
            <br />
            <select value={chosenRoutineDay} onChange={ ({target}) => {setChosenRoutineDay(target.value)} }>
                <option value="push">Push</option>
                <option value="pull">Pull</option>
                <option value="legs">Legs</option>
            </select>
        </label>
        <hr />
        </>
    );

    const movements = routine[chosenRoutineDay]; // object

    const [ selectedFormRender, setSelectedFormRender ] = useState("together");

    const selectHowToRenderForms = (
        <form value={selectedFormRender} onChange={ ({target}) => {setSelectedFormRender(target.value)} }>
            <i>Choose how you'd like to submit the forms:</i>
            <br />
            <label>
                <i>Individually</i>
                <input type="radio" value="individually" name="renderType" />
            </label>
            <br />
            <label>
                <i>All together</i>
                <input type="radio" value="together" name="renderType" />
            </label>
            <hr />
        </form>
    );

    const onFormSubmit = async ({formData}, event) => {
        event.preventDefault();
        console.log(formData);
        const response = await fetch("http://localhost:8090/post/logprogress", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.text();
        alert(data);
    }

    const RJSFForm = (selectedFormRender === "individually") ? submitIndividually : submitAllTogether;

    return (
        <>
        <h1>Progress Page!!</h1>
        <MainBody 
            leftCol1={routineDaySelect}
            rightCol1={selectHowToRenderForms}
            rightCol2={ RJSFForm(movements, onFormSubmit) } />
        </>
    );
}

export default LogProgressPage;
