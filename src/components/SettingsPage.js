import React, { useState, useEffect } from 'react';
import { MainBody } from './components.js';
import Form from "@rjsf/core";
import { Link } from "react-router-dom";

function AddMovement() { // all working now :)
    // maybe implement a feature whereby you can ask the user to confirm
    // what they've entered? Maybe a small widget showing the youtube video
    // corresponding to the link they entered to check they entered the
    // right link?
    const schema = { // schema for the form for adding the movement
        title: "Add Movement",
        description: "Complete this form in order to add a movement to the database.",
        type: "object",
        properties: {
            movement_name: {
                type: "string",
                title: "Movement Name"
            },
            default_sets: {
                type: "number",
                title: "Default Sets"
            },
            default_reps: {
                type: "number",
                title: "Default Reps"
            },
            youtube_link: {
                type: "string",
                title: "YouTube Link",
                description: "Link to a YouTube video on how to execute this movement properly"
            }
        },
        required: [
            "movement_name",
            "default_sets",
            "default_reps",
            "youtube_link"
        ]
    }
    const uiSchema = {
        "ui:help": (<a href="https://www.youtube.com/" target="_blank"><i>YouTube link</i></a>)
    }
    const onFormSubmit = async ({formData}, event) => {
        // POSTs the data to the server then alerts the response
        event.preventDefault();
        console.log(formData);
        const response = await fetch("http://localhost:8090/post/addmovement", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.text();
        alert(data);
    }
    const form = <Form schema={schema} uiSchema={uiSchema} onSubmit={onFormSubmit}/>
    return form;
}

function EditMovement() { // all working now :)
    const [ choiceValue, setChoiceValue ] = useState(""); // the movement chosen from the datalist to be edited. Used when rendering the form to edit the movement that's chosen
    const [ movementObjects, setMovementObjects ] = useState(); // the data.rows from the movements table in the DB. Used in the datalist to choose the movement to edit

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("http://localhost:8090/get/allmovements");
            const data = await response.json();
            setMovementObjects(data);
            try {
                console.log(movementObjects)
            } catch (error) {
                console.log("useEffect error:" + error.message);
            }
        }
        fetchData();
    },[choiceValue])

    let mappedOptions;
    // I'm doing a trycatch because when <EditMovement /> first renders, `movementObjects` has no value, so it'd cause an error and stop the app from working if I didn't do a trycatch
    // in the console you see a lot of messages saying "Cannot read property 'movement_name' of undefined"
    try {
        mappedOptions = movementObjects.map((obj, index) => {
            return <option key={index} value={obj.movement_name} />
        })
    } catch (error) {
        console.log(error.message)
    }

    const choiceDatalist = ( // the little dropdown thingy for the user to choose which movement to edit. The <option>'s come from the map above, which maps `movementObjects`
        <label> 
            Choose a movement to edit: <br />
            <i>(Either click on the box for a dropdown or begin typing to show movements that match your input)</i> <br />
            <input type="text" list="movements" value={choiceValue} onChange={ ({target}) => setChoiceValue(target.value) } />
            <datalist id="movements">
                {mappedOptions}
            </datalist>
            <button type="submit">Submit</button>
        </label>
    );

    let form = null;
    // trycatch here because when <EditMovement /> first renders, `movementObjects` is empty, so `actualObject` would return an error
    // either sets form to form corresponding to movement ot be edited, or leaves it as null if there's an error
    try {
        const actualObject = movementObjects.find(obj => obj.movement_name === choiceValue);
        const schema = {
            title: `Edit details for ${actualObject.movement_name}`,
            description: "Edit the field values below to your desired values, then click `Submit` to push the change.",
            type: "object",
            properties: {
                movement_name: {
                    type: "string",
                    title: "Movement Name",
                    default: actualObject.movement_name
                },
                default_sets: {
                    type: "number",
                    title: "Default Sets",
                    default: actualObject.default_sets,
                    minimum: 1
                },
                default_reps: {
                    type: "number",
                    title: "Default Reps",
                    default: actualObject.default_reps,
                    minimum: 1
                },
                youtube_link: {
                    type: "string",
                    title: "YouTube Link",
                    default: actualObject.youtube_link
                }
            }
        }
        const handleFormSubmit = async ({formData}, event) => {
            event.preventDefault();
            const reqBody = {
                prevMovementDetails: actualObject, // to use to find the row in the DB to update
                newMovementDetails: formData
            }
            const request = await fetch("http://localhost:8090/put/editmovement", {
                method: "PUT",
                body: JSON.stringify(reqBody),
                headers: {'Content-Type': 'application/json'}
            })
            const response = await request.text()
            alert(response);
        }
        form = <Form schema={schema} onSubmit={handleFormSubmit} />
    } catch (error) {
        console.log(error.message);
    }
    
    
    return (
        <>
        {choiceDatalist}
        <hr />
        {form}
        </>
    );
}

function RemoveMovement() { // all working now (I think)
    // Doesn't quite work because of the way that the DB is set up. The movement_name
    // column in the movements table is referenced in multiple other tables, so removing
    // a movement can be a complex process if said movement is in lots of logs and
    // routines etc.
    const [ choiceValue, setChoiceValue ] = useState(""); // the movement chosen in the datalist
    const [ movementObjects, setMovementObjects ] = useState();

    useEffect(() => {
        // fetches DB movements data to use in the <datalist> in `choiceDatalist`
        async function fetchData() {
            console.log("useEffect causing rerender again");
            const response = await fetch("http://localhost:8090/get/allmovements");
            const data = await response.json();
            await setMovementObjects(data);
            try {
                console.log(movementObjects)
            } catch (error) {
                console.log("useEffect error:" + error.message);
            }
        }
        fetchData();
    },[choiceValue])

    // this try/catch is because sometimes if the above fetch request doesn't go through,
    // there won't be any data in movementObjects to map, so there needs to be a try/catch to
    // handle that. If it doesn't work, mappedOptions' value is null, so nothing renders
    let mappedOptions;
    try {
        mappedOptions = movementObjects.map((obj, index) => {
            return <option key={index} value={obj.movement_name} />
        })
    } catch (error) {
        console.log(error.message)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const confirmation = window.confirm("Are you sure you want to delete this movement?\n\nThe following will be deleted:\n• The movement and its data from the `movements` table \n• The logs which reference this movement \n• The entries in the DB linking the movement to any routine/s");
        if (!confirmation) return
        const request = await fetch('http://localhost:8090/delete/movement/' + encodeURIComponent(choiceValue), {
            method: "DELETE"
        });
        const response = await request.text();
        alert(response);
    }

    const choiceDatalist = (
        <form onSubmit={handleSubmit}>
            <label> 
                Choose a movement to remove: <br />
                <i>(Either click on the box for a dropdown or begin typing to show movements that match your input)</i> <br />
                <input type="text" list="movements" value={choiceValue} onChange={ ({target}) => setChoiceValue(target.value) } />
                <datalist id="movements">
                    {mappedOptions}
                </datalist>
                <button type="submit">Remove</button>
            </label>
        </form>
    );
    
    return (
        <>
        {choiceDatalist}
        <hr />
        {null}
        </>
    );
}

function AddRoutine() { // all working now (I think)
    const [ routineName, setRoutineName ] = useState(""); // tracks user's chosen name for their routine
    const routineNameForm = (
        <label>
            Input a name for your routine:
            <input type="text" value={routineName} onChange={({target}) => setRoutineName(target.value)} />
        </label>
    );

    const [ currentInput, setCurrentInput ] = useState(""); // tracks what's currently in the <input> for the routine 'day' name
    const [ dayNames, setDayNames ] = useState([]); // tracks all chosen day names in an array
    const [ formData, setFormData ] = useState({}); // stores the chosen <options> within  each routine day's <select>
    /*
    `formData` needs to be updated when:
    - A 'day' is added to the routine
    - A 'day' is removed from the routine
    - There's a change to the chosen movements in a routine 'day'
    */

    async function updateFormData(func, dayName, selectedOptions) {
        // func --> string. Determines how this function uses setFormData()
        // dayName --> string. The name of the workout day in the dayNames array
        // selectedOptions --> array. The values of the workout movements selected in the dynamically rendered <select> where the user chooses the movements corresponding to each 'day' of their workout
        let obj;
        switch (func) {
            case "Initialise":
                // Doesn't use any of the parameters
                // Creates an object from whatever's in dayNames. Keys from dayNames, values are {}'s
                const mappedArray = dayNames.map(entry => [entry, {}]);
                obj = Object.fromEntries(mappedArray);
                break;

            case "Remove dayName":
                // doesn't use the selectedOptions parameter
                obj = {}
                for (let [key, value] of Object.entries(dayNames)) {
                    if (key !== dayName) continue;
                    else obj[key] = value;
                }
                break;
            
            case "Add dayName":
                obj = {
                    ...formData,
                    [dayName]: []
                }
                break;
            
            case "Update dayName":
                obj = Object.assign({}, formData);
                obj[dayName] = selectedOptions;
                break;
            
            default:
                return;
        }
        await setFormData(obj);
    }

    const handleDaySubmit = async () => {
        if (currentInput === "" || dayNames.includes(currentInput)) return;
        await setDayNames((prev) => [...prev, currentInput]); // adds currentInput to [dayNames]
        await updateFormData("Add dayName", currentInput);
        setCurrentInput("");
    }

    const dayNameForm = ( 
        // <input> for entering routine day names
        // I want to be able to submit this by pressing Enter, but that doesn't work...?
        <>
            <label>
                Input a day name:
                <input type="text" value={currentInput} onChange={({target}) => setCurrentInput(target.value)} />
            </label> <br />
            <button type="submit" onClick={handleDaySubmit}>Click to add day</button>
        </>
    );

    const dayNamesLIs = dayNames.map((dayName, key) => {
        // the <li>'s of the <ul> that shows the user's chosen routine 'days'
        // clicking on an <li> will remove the corresponding dayName from `dayNames`
        return (
            <li
                onClick={async () => {
                    await setDayNames(prev => prev.filter((day) => {return day !== dayName}));
                    await updateFormData("Remove dayName", dayName);
                }}
                key={key}
                style={{cursor: "pointer"}}
                onMouseEnter={({target}) => {target.style["text-decoration"] = "line-through"}}
                onMouseLeave={({target}) => {target.style["text-decoration"] = "none"}}
            >
                {dayName}
            </li>
        )
    });

    const [ movements, setMovements ] = useState([]); // no use other than for the <option>'s in the <select>'s
    useEffect(
        // Fetches the data for all the movements from the DB
        // Data to be used in the <select> for each routine 'day' for the user to select which movements to use in each 'day'
        () => {
            async function fetchData() {
                const response = await fetch("http://localhost:8090/get/allmovements");
                const data = await response.json();
                setMovements(data);
            }
            fetchData();
        },
        [routineName]
    )

    /*
    useEffect(
        () => {
            console.log("");
            console.log("dayNames:", dayNames);
            console.log("formData:", formData);
            console.log("");
        },
        [dayNames, formData]
    )
    */

    const dayFormInputs = dayNames.map((day, key) => {
        // Maps a <select> to each routine 'day' for the user to choose movements to allocate to each 'day'

        const options = movements.map((obj, key) => <option value={obj.movement_name} key={key}>{obj.movement_name}</option>);
        // Maps each movement to an <option> to be used in the overall <select>

        const handleChange = async ({target}) => {
            // Handles changes to the selected <option>'s
            const selectedOptions = Array.from(target.selectedOptions, option => option.value);
            // The above is what we want to update the relevant sub-object in formData with
            await updateFormData("Update dayName", day, selectedOptions);
        }

        const subform = (
            <>
            <label key={key}>
                <i>Choose movement/s for <b><u>{day}</u></b>:</i> <br />
                <select size="8" name={day} onChange={handleChange} multiple>
                    {options}
                </select>
            </label>
            <br />
            <br />
            </>
        );
        return subform;
    })

    const handleFinalSubmit = async (event) => {
        event.preventDefault()
        const confirmation = window.confirm("Are you sure you want to submit?");
        if (!confirmation) return;
        try {
            const body = {
                "routine_name": routineName,
                "formData": formData
            };
            const response = await fetch("http://localhost:8090/post/addroutine", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'}
            })
            const data = await response.text();
            alert(data);
        } catch (error) {
            console.log("Didn't work");
        }
    }

    const finalForm = (
        <form onSubmit={handleFinalSubmit}>
            {dayFormInputs} <br />
            <input type="submit" value="Submit" />
        </form>
    );

    return (
        <>
        {routineNameForm}
        <hr />
        <h2>{routineName}</h2>
        {dayNameForm}
        <br />
        <ul>
            {dayNamesLIs}
        </ul>
        <hr />
        {finalForm}
        </>
    );
}

function EditRoutine() {
    const [ routineNames, setRoutineNames ] = useState([]); // array w/ names of routines. Used in <ChooseRoutineSelect />
    const [ chosenRoutine, setChosenRoutine ] = useState(""); // string

    useEffect(() => { // to fetch the routine names to use in the <select> below
        async function fetchData() {
            // console.log("Fetching routine names...");
            const response = await fetch("http://localhost:8090/get/routinenames");
            try {
                const array = await response.json();
                await setRoutineNames(array);
                // await setChosenRoutine(routineNames[0]);
            } catch {
                const errormessage = await response.text();
                console.error(errormessage);
            }
        }
        fetchData();
    }, [])

    const ChooseRoutineSelect = () => { // for the user to choose the routine to edit
        return (
            <label>
                Choose a routine:
                <select value={chosenRoutine} onChange={
                    ({target}) => {
                        setChosenRoutine(target.value)
                        // console.log(target.tagName);
                    }
                }>
                    <option>(Select a routine here)</option>
                    {routineNames.map((name, key) => 
                        <option value={name} key={key}>{name}</option>
                    )}
                </select>
            </label>
        );
    }

    const [ routineObject, setRoutineObject ] = useState();
    const [ formData, setFormData ] = useState({});
    useEffect(() => {
        async function fetchData() { // to fetch the DB's details on the chosen routine
            const param = encodeURIComponent(chosenRoutine);
            const response = await fetch("http://localhost:8090/get/routine/" + param);
            const data = await response.text();
            try {
                await setRoutineObject(JSON.parse(data));
                await setFormData(JSON.parse(data));
            } catch (error) {
                console.error(error.message);
                console.error(data);
            }
        }
        fetchData();
    }, [chosenRoutine])

    async function updateFormData(params, userInput=null) {
        // Routine name --> edit
        // Routine day --> add, edit, delete
        // Day movement --> Add, delete
        switch (params.func) {
            case "Edit routine name":
                // userInput
                await setFormData(prev => {
                    prev.name = userInput;
                    return prev;
                });
                break;
            
            case "Add new day":
                // (No params)
                await setFormData(prev => {
                    let obj = Object.assign({}, prev);
                    const dayNumber = Object.keys(obj.contents).length + 1;
                    obj.contents[`day ${dayNumber}`] = [];
                    return obj;
                })
                break;

            case "Edit day name":
                // params.key
                // userInput
                await setFormData(prev => {
                    let obj = Object.assign({}, prev);
                    const editedContents = Object.entries(formData.contents).map((entry, index) => {
                        if (params.key === index) entry[0] = userInput;
                        return entry;
                    })
                    obj.contents = Object.fromEntries(editedContents)
                    return obj;
                })
                break;

            case "Delete day": // NOT SURE IF THIS WILL WORK. NEED TO CHECK
                // params.key
                await setFormData(prev => {
                    let obj = Object.assign({}, prev);
                    const filteredContents = Object.entries(obj.contents).filter(
                        (day, index) => {
                            if (index !== params.key) return day;
                        }
                    );
                    obj.contents = Object.fromEntries(filteredContents);
                    return obj;
                });
                break;
            
            // Movements options:
            case "Add new movement":
                // params.day_name
                // params.movement_name
                if (formData.contents[params.day_name].includes(params.movement_name)) {
                    alert(`Error: '${params.movement_name}' is already in the day '${params.day_name}'`);
                    return;
                }
                await setFormData(prev => {
                    let obj = Object.assign({}, prev);
                    let movementsArray = prev.contents[params.day_name];
                    movementsArray.push(params.movement_name);
                    obj.contents[params.day_name] = movementsArray;
                    return obj;
                })
                break;

            case "Remove movement":
                // params.day_name (i.e. the parent of the movement_name)
                // params.movement_name
                await setFormData(prev => {
                    let obj = Object.assign({}, prev);
                    obj.contents[params.day_name] = prev.contents[params.day_name].filter(
                        name => name !== params.movement_name
                    );
                    return obj;
                })
                break;

            default:
                return;
        }
    }

    const [ allMovements, setAllMovements ] = useState([]);
    useEffect(() => {
        async function fetchMovements() {
            try {
                const response = await fetch("http://localhost:8090/get/allmovements");
                const data = await response.json();
                await setAllMovements(data);
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchMovements();
    }, [])
    
    const RenderRoutine = () => { // component w/ form for editing routine
        // console.log("formData:\n", formData);
        if (formData === undefined) return <p>{null}</p>;

        const Input = (props) => {
            // props: placeholder, id, params
            const handleClick = async (event) => {
                event.preventDefault();
                const value = event.target.previousElementSibling.value;
                if (value === "") return;
                await updateFormData(props.params, value);
            }
            return (
                <>
                <input type="text" placeholder={props.placeholder} id={props.id} />
                <button type="submit" onClick={handleClick}>Change</button>
                </>
            );
        }

        const routineName_JSX = (
            <>
            <input 
                type="text"
                placeholder={formData.name}
                // onChange={({target}) => console.log(target.value)}
                id="routineName_JSX" 
            />
            <button type="submit" onClick={async (event) => {
                event.preventDefault();
                await updateFormData({func:"Edit routine name"}, event.target.previousElementSibling.value);
                console.log(formData);
            }}>Change</button>
            </>
        );

        const routineName_JSX_Input = <Input
            placeholder={formData.name}
            id="routineName_JSX"
            params={{func: "Edit routine name"}}
        />;

        if (formData.contents === undefined) return <p>{null}</p>;

        const dayDivs = Object.entries(formData.contents).map(
            ( [day, movementsArray], key ) => {
                const dayName_Input = <Input
                    placeholder={day}
                    id="EditRoutines_dayNameInputTag"
                    params={{func: "Edit day name", key: key}}
                />;
                const dayName = <input
                    placeholder={day}
                    id="EditRoutines_dayNameInputTag"
                    onChange={({target}) => updateFormData({func:"Edit day name", key:key}, target.value)} 
                />;
                
                const LIs = movementsArray.map((name, key) => // clickable LIs
                    <li
                        style={{cursor: "pointer"}}
                        onMouseEnter={({target}) => {target.style["text-decoration"] = "line-through"}}
                        onMouseLeave={({target}) => {target.style["text-decoration"] = "none"}}
                        onClick={() => updateFormData({
                            func:"Remove movement",
                            day_name: day,
                            movement_name: name})}
                        key={key}
                    >
                        {name}
                    </li>
                );
                const addMovement = (
                    <form onSubmit={async (event) => {
                        event.preventDefault();
                        const selectedMovement = event.target[0].value; // To find out how to do this, I literally just did console.log(event) then clicked on the 'target' dropdown 
                        if (selectedMovement === "(Select a movement)") return; 
                        await updateFormData({
                            func:"Add new movement",
                            day_name: day,
                            movement_name: selectedMovement
                        });
                    }}>
                        <label>
                            <select>
                                <option key="-1">(Select a movement)</option>
                                {allMovements.map((obj, key) => 
                                    <option key={key} value={obj.movement_name}>{obj.movement_name}</option>
                                )}
                            </select>
                            <button type="submit" value="Submit">Click to add movement</button>
                        </label>
                    </form>
                );
                
                const deleteDayButton = (
                    <button type="button" onClick={() => updateFormData({
                        func: "Delete day",
                        key: key
                    })}>Delete Day</button>
                )

                return (
                    <div key={key}>
                        <hr style={{width: "50%"}} />
                        {dayName_Input} <br />
                        <p><i>Click on a list item to remove the corresponding movement from '{day}'</i></p>
                        <ul>
                            {LIs}
                        </ul>
                        {addMovement}
                        <br />
                        {deleteDayButton}
                    </div>
                );
            }
        );
        return (
            <>
            {routineName_JSX}
            <br /> <br />
            {dayDivs}
            <hr />
            <button type="button" onClick={() => updateFormData({func:"Add new day"})}>
                Click to add new day
            </button>
            </>
        );
    };

    const handleOverallSubmit = async (event) => {
        event.preventDefault();
        console.log("Before:", routineObject);
        console.log("After:", formData);
        // check to make sure that they'd named
        if (formData.name === "") {
            alert("Please enter a valid routine name");
            return;
        }
        if (Object.keys(formData.contents).length === 0) {
            alert("No days - click the 'Click to add new day' button at the bottom to add a new day.");
            return;
        }
        for (let [name, movements] of Object.entries(formData.contents)) {
            if (name === "" || name.match(/day (\d+)/)) {
                alert(`Invalid day name '${name}'.`);
                return;
            }
            if (movements.length === 0) {
                alert(`No movements associated with day ${name}. Please add some`);
                return;
            }
        }
        const confirmation = window.confirm(`Are you sure you want to change the details of the routine ${chosenRoutine}?`);
        if (!confirmation) return;

        // basically just delete the `old` routine then add in the `new` one (i.e. the edited version of the old one)
        const delete_response = await fetch("http://localhost:8090/delete/routine", {
            method: "DELETE",
            body: JSON.stringify(routineObject),
            headers: {'Content-Type': 'application/json'}
        });
        try {
            const delete_data = await delete_response.text();
            console.log(delete_data);
        } catch (error) {
            console.error(error.message);
        }

        const add_response = await fetch("http://localhost:8090/post/addroutine", {
            method: "POST",
            body: JSON.stringify({
                routine_name: formData.name,
                formData: formData.contents
            }),
            headers: {'Content-Type': 'application/json'}
        });
        try {
            const add_data = await add_response.text();
            console.log(add_data);
        } catch (error) {
            console.error(error.message);
        }

        alert("Routine successfully edited!");
    }

    return (
        <>
        {<ChooseRoutineSelect />}
        <hr />
        {null}
        <br />
        {<RenderRoutine />}
        <form onSubmit={handleOverallSubmit}>
            <button type="submit">Submit changes</button>
        </form>
        </>
    );
}

function RemoveRoutine() { // done I think. Haven't tested it tho
    const [ routineNames, setRoutineNames ] = useState([]);
    const [ chosenRoutine, setChosenRoutine ] = useState();

    useEffect(() => { // to fetch the routine names to use in the <select> below
        async function fetchData() {
            console.log("Fetching routine names...")
            const response = await fetch("http://localhost:8090/get/routinenames");
            try {
                const array = await response.json();
                await setRoutineNames(array);
                setChosenRoutine(routineNames[0])
            } catch {
                const errormessage = await response.text();
                console.error(errormessage);
            }
        }
        fetchData();
    }, [])

    const ChooseRoutineSelect = () => { // for the user to choose
        return (
            <label>
                Choose a routine:
                <select value={chosenRoutine} onChange={({target}) => setChosenRoutine(target.value)}>
                    {routineNames.map((name, key) => <option value={name} key={key}>{name}</option>)}
                </select>
            </label>
        );
    }

    const [ routineObject, setRoutineObject ] = useState();
    useEffect(() => {
        async function for_routineObject() {
            // to fetch the DB's details on the chosen routine
            // will be rendered for the user to see in order to check this is the right routine to delete
            const param = encodeURIComponent(chosenRoutine);
            const response = await fetch("http://localhost:8090/get/routine/" + param);
            const data = await response.text();
            try {
                setRoutineObject(JSON.parse(data));
                console.log(JSON.parse(data))
            } catch (error) {
                console.log(error.message);
            }
        }
        for_routineObject();
    }, [chosenRoutine])

    const DeleteButton = () => {
        const handleClick = async () => {
            if (chosenRoutine === null || routineObject === null) {
                console.log(`chosenRoutine or routineObject equals null. Returning out of handleClick without making any deletions`);
                return;
            };
            const confirmation = window.confirm(
                "Are you sure you would like to delete this routine?\nDoing so will not remove any of the movement associated with the routine from the database, however it will delete all record of the routine, including its name, its 'days' and the association between movements and their parent 'days'."
            )
            if (!confirmation) return;
            const request = await fetch("http://localhost:8090/delete/routine", {
                method: "DELETE",
                body: JSON.stringify(routineObject),
                headers: {'Content-Type': 'application/json'}
            });
            const response = await request.text();
            alert(response);
        }
        return (
            <button type="button" onClick={handleClick}>
                Click to delete routine
            </button>
        );
    }

    return (
        <>
        {<ChooseRoutineSelect />} <br />
        {chosenRoutine} <br />
        {<DeleteButton />}
        </>
    );
}

// No <AddLog /> because that's what the LogProgress page is for

function EditLog() { // works. Want to implement collapsible scrollable table tho
    const [ logs, setLogs ] = useState([]); // array returned from server
    const chosenLogEmpty = {
        log_id: "",
        movement_name: "",
        date: new Date().toISOString().slice(0,10),
        weight: "",
        sets_completed: "",
        reps_completed: "",
        notes: ""
    }
    const [ chosenLog, setChosenLog ] = useState(chosenLogEmpty); // Defaulted like so so that the edit form doesn't break

    useEffect(
        () => {
            async function fetchLogData() {
                const response = await fetch("http://localhost:8090/get/alllogs");
                const data = await response.json();
                setLogs(data);
            }
            fetchLogData();
        },
        [chosenLog]
    );

    const addHours = (dateString, h) => { // for some reason the date pulled from the API is adjusted (I think because of British Summer Time) so this ensures that the wrong date isn't showed in the table
        const addHoursOperation = new Date(dateString).getTime() + (h*60*60*1000);
        const newDate = new Date(addHoursOperation);
        return newDate.toISOString().slice(0,10);
    }

    const tableRows = logs.map((log, key) => {
        // console.log(log.date);
        // console.log(new Date(log.date));
        // console.log(addHours(log.date, 2));
        // console.log(" ");
        return (
            <tr style={{cursor: "pointer"}} onClick={() => setChosenLog(log)} key={key}>
                <th scope="row">{log.log_id}</th>
                <td>{log.movement_name}</td>
                <td>{addHours(log.date,2)}</td>
                <td>{log.weight}</td>
                <td>{log.sets_completed}</td>
                <td>{log.reps_completed}</td>
                <td>{log.notes}</td>
            </tr>
        );
    });

    const table = (
        <>
        <p>Below you will find a list of logs you've made. Click on one to edit its details.</p>
        <table className="table table-hover">
            <thead>
                <tr>
                    <th scope="col">log_id</th>
                    <th scope="col">movement_name</th>
                    <th scope="col">date</th>
                    <th scope="col">weight</th>
                    <th scope="col">sets_completed</th>
                    <th scope="col">reps_completed</th>
                    <th scope="col">notes</th>
                </tr>
            </thead>
            <tbody>
                {tableRows}
            </tbody>
        </table>
        </>
    );

    const EditLogForm = () => {
        // console.log(`chosenLog.weight: ${typeof chosenLog.weight}`);
        const schema = {
            title: `Edit log`,
            description: "Edit the field values below to your desired values, then click `Submit` to push the change.",
            type: "object",
            properties: {
                movement_name: {
                    type: "string",
                    title: "Movement Name",
                    default: chosenLog.movement_name
                },
                date: {
                    type: "string",
                    format: "date",
                    title: "Date",
                    default: chosenLog.date.slice(0,10),
                },
                weight: {
                    type: "number",
                    title: "Weight lifted",
                    default: parseFloat(chosenLog.weight), // for some reason it thinks chosenLog.weight is a string...? The console.log at the top of EditLogForm comes back as `chosenLog.weight: string` weirdly
                    minimum: 1
                },
                sets_completed: {
                    type: "number",
                    title: "Sets completed",
                    default: chosenLog.sets_completed
                },
                reps_completed: {
                    type: "number",
                    title: "Reps completed",
                    default: chosenLog.reps_completed
                },
                notes: {
                    type: "string",
                    title: "Notes",
                    default: chosenLog.notes
                }
            }
        };
        const handleSubmit = async ({formData}, event) => {
            event.preventDefault();
            const body = {
                prevLogDetails: chosenLog,
                newLogDetails: formData
            };
            const response = await fetch("http://localhost:8090/put/editlog", {
                method: "PUT",
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'}
            })
            const data = await response.text();
            alert(data);
            setChosenLog(chosenLogEmpty); // to get the component to rerender in order to show the changes in the table
        };
        return <Form schema={schema} onSubmit={handleSubmit} />;
    };

    return (
        <>
        {table}
        <br />
        {<EditLogForm />}
        </>
    );
}

function RemoveLog() {
    const [ logs, setLogs ] = useState([]); // array returned from server
    const [ chosenLog, setChosenLog ] = useState();

    useEffect(
        () => {
            async function fetchLogData() {
                const response = await fetch("http://localhost:8090/get/alllogs");
                const data = await response.json();
                setLogs(data);
            }
            fetchLogData();
        },
        [chosenLog]
    );

    const addHours = (dateString, h) => { // for some reason the date pulled from the API is adjusted (I think because of British Summer Time) so this ensures that the wrong date isn't showed in the table
        const addHoursOperation = new Date(dateString).getTime() + (h*60*60*1000);
        const newDate = new Date(addHoursOperation);
        return newDate.toISOString().slice(0,10);
    }

    const handleClick = async () => {
        const confirmation = `Are you sure you want to delete this log:\n${JSON.stringify(chosenLog)}`;
        if (!confirmation) return
        const response = await fetch("http://localhost:8090/delete/log/" + encodeURIComponent(chosenLog.log_id), {
            method: "DELETE"
        })
        const data = await response.text();
        alert(data);
        setChosenLog(null); // to get the component to rerender in order to show the changes in the table
    }

    const tableRows = logs.map((log, key) => {
        // console.log(log.date);
        // console.log(new Date(log.date));
        // console.log(addHours(log.date, 2));
        // console.log(" ");
        return (
            <tr key={key} style={{cursor: "pointer"}} onClick={
                async () => {
                    await setChosenLog(log);
                    handleClick();
                }
            }>
                <th scope="row">{log.log_id}</th>
                <td>{log.movement_name}</td>
                <td>{addHours(log.date,2)}</td>
                <td>{log.weight}</td>
                <td>{log.sets_completed}</td>
                <td>{log.reps_completed}</td>
                <td>{log.notes}</td>
            </tr>
        );
    });

    const table = (
        <>
        <p>Below you will find a list of logs you've made. Click on one to delete it.</p>
        <table className="table table-hover">
            <thead>
                <tr>
                    <th scope="col">log_id</th>
                    <th scope="col">movement_name</th>
                    <th scope="col">date</th>
                    <th scope="col">weight</th>
                    <th scope="col">sets_completed</th>
                    <th scope="col">reps_completed</th>
                    <th scope="col">notes</th>
                </tr>
            </thead>
            <tbody>
                {tableRows}
            </tbody>
        </table>
        </>
    );

    return table;
}

const Sidebar = (props) => {
    const bullets = ["Movements", "Routines", "Logs"].map((entity, key) => {
        return (
            <>
                <li><b>{entity}</b></li>
                <ul>
                    {
                    (entity === "Logs")
                        ? <li><Link to="/logprogress"><i>Add {entity}</i></Link></li>
                        : <li><a onClick={props.onClick} href="#"><i>Add {entity}</i></a></li>
                    }
                    <li>
                        <a onClick={props.onClick} href="#">
                            <i>Edit {entity}</i>
                        </a>
                    </li>
                    <li>
                        <a onClick={props.onClick} href="#">
                            <i>Remove {entity}</i>
                        </a>
                    </li>
                </ul>
            </>
        )
    });
    return <ul>{bullets}</ul>;
}

export function SettingsPage() {
    useEffect(() => {document.title = "Settings"}, []);
    
    const [ settingsChoice, setSettingsChoice ] = useState("Choose an option from the sidebar to begin making changes");

    const handleSidebarOnClick = ({target}) => {
        switch (target.innerHTML) {
            case "Add Movements":
                setSettingsChoice(<AddMovement />);
                break;

            case "Edit Movements":
                setSettingsChoice(<EditMovement />);
                break;

            case "Remove Movements":
                setSettingsChoice(<RemoveMovement />);
                break;

            case "Add Routines":
                setSettingsChoice(<AddRoutine />);
                break;

            case "Edit Routines":
                setSettingsChoice(<EditRoutine />);
                break;

            case "Remove Routines":
                setSettingsChoice(<RemoveRoutine />);
                break;
            // "Add Logs" case unneccessary since there's the 'Log Progress' page
            case "Edit Logs":
                setSettingsChoice(<EditLog />);
                break;
            
            case "Remove Logs":
                setSettingsChoice(<RemoveLog />);
                break;
            
            default:
                break;
        }
    };

    return (
        <>
        <h1>Settings Page!!</h1>
        <MainBody
            leftCol1={<Sidebar onClick={handleSidebarOnClick} />}
            rightCol1={settingsChoice} />
        </>
    );
}

export default SettingsPage;
