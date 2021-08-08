import React, { useState, useEffect, useRef } from 'react';
import { MainBody } from './components.js';

export function RoutinesPage(props) {
    useEffect(() => {
        document.title = "Routines";
    });
    return (
        <>
        <h1>Routines Page!!</h1>
        <MainBody
            leftCol1={<AddMovement />} />
        </>
    );
}

const preexistingRoutines = {
    PPL: {
        daysPerCycle:3,
        iterationsPerWeek:2
    },
    broSplit: {
        daysPerCycle:6,
        iterationsPerWeek:1
    }
};

export function AddMovement(props) {
    /*
    Info needed to create a movement:
    - Name of movement
    - description of movement
    - default sets and reps
    */

    // So, this component seems to work, but it needs to do something with the data, i.e. send it to a server or something
    const [ movementName , setMovementName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ sets, setSets ] = useState(0);
    const [ reps, SetReps ] = useState(0);
    const handleMovementNameChange = ({target}) => {
        setMovementName(target.value)
    }
    const handleDescriptionChange = ({target}) => {
        setDescription(target.value)
    }
    const handleSetsChange = ({target}) => {
        setSets(target.value)
    }
    const handleRepsChange = ({target}) => {
        SetReps(target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const movementObject = {
            name: movementName,
            description: description,
            sets: sets,
            reps: reps
        }
        alert("Submitted");
        // Get submitted form values from `movementName`, `description`, etc.
    }

    const form = (
        <>
        <form onSubmit={handleSubmit}>
            <label>
                Enter Movement Name:
                <input value={movementName} onChange={handleMovementNameChange} type="text" required/>
            </label>
            <label>
                Enter a description of the movement's proper form:
                <input value={description} onChange={handleDescriptionChange} type="text" />
            </label>
            <label>
                Enter the (usual) number of sets that this movement is performed for:
                <input value={sets} onChange={handleSetsChange} type="number" required/>
            </label>
            <label>
                Enter the (usual) number of reps that this movement is performed for:
                <input value={reps} onChange={handleRepsChange} type="number" required/>
            </label>
            <button type="submit">Submit</button>
        </form>
        </>
    );

    return form;
}

export function WeightConverter(props) {
    const [ inputChoice , setInputChoice ] = useState('kg_to_lbs');
    const handleInputChoiceChange = ({target}) => {
        setInputChoice(target.value);
    }
    const main = (
        <>
        <label>
            Select a conversion:
            <select name="conversion" value={inputChoice} onChange={handleInputChoiceChange}>
                <option value="kg_to_lbs" selected="selected">kg to lbs</option>
                <option value="kg_to_stone+lbs">kg to stone {"&"} lbs</option>
                <option value="lbs_to_kg">lbs to kg</option>
                <option value="lbs_to_stone+lbs">lbs to stone {"&"} lbs</option>
                <option value="stone+lbs_to_kg">stone {"&"} lbs to kg</option>
                <option value="stone+lbs_to_lbs">stone {"&"} lbs to lbs</option>
            </select>
        </label>
        </>
    );
    
    const [ outputtedWeightConversion, setOutputtedWeightConversion ] = useState(0);
    let module;
    let handleInputtedWeightChange;

    switch (inputChoice) {
        // this switch statement is where the actual input/output conversion thingy will be decided
        case "kg_to_lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleInputtedWeightChange} />
                <p>{outputtedWeightConversion} lbs</p>
                </>
            );
            handleInputtedWeightChange = ({target}) => {setOutputtedWeightConversion(target.value * 2.205)};
            break;
        case "kg_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleInputtedWeightChange} />
                <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs}lbs</p>
                </>
            );
            handleInputtedWeightChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone":Math.floor((target.value * 2.20462)/14),
                        "lbs":(target.value * 2.20462) - (Math.floor((target.value * 2.20462)/14))*14
                    }
                )
            }
            break;
        case "lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" onChange={handleInputtedWeightChange} />
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleInputtedWeightChange = ({target}) => {setOutputtedWeightConversion(target.value/2.205)}
            break;
        case "lbs_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleInputtedWeightChange} />
            <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs} lbs</p>
                </>
            );
            handleInputtedWeightChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone": Math.floor(target.value/14),
                        "lbs": target.value - (Math.floor(target.value/14)*14)
                    }
                )
            }
            break;
        case "stone+lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleInputtedWeightChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleInputtedWeightChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            const totalLbs = (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value);
            handleInputtedWeightChange = ({target}) => {
                setOutputtedWeightConversion(
                    totalLbs / 2.205
                )
            }
            break;
        case "stone+lbs_to_lbs":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleInputtedWeightChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleInputtedWeightChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleInputtedWeightChange = ({target}) => {
                setOutputtedWeightConversion(
                    (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value)
                )
            }
            break;
    }
    
    return (
        <>
        <div>{main}</div>
        <div>{module}</div>
        </>
    );
}

export default RoutinesPage;