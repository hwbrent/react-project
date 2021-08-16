import React, { useState, useEffect } from 'react';
import { MainBody, routine } from './components.js';
import { csv } from 'd3';

function SignUp(props) {
    const [ name, setName ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ weight, setWeight ] = useState(0);
    const [ sex, setSex ] = useState();
    const handleNameChange = ({target}) => {
        setName(target.value);
    }
    const handlePasswordChange = ({target}) => {
        setPassword(target.value);
    }
    const handleWeightChange = ({target}) => {
        setWeight(target.value);
    }
    const handleSexChange = ({target}) => {
        setSex(target.value);
    }
    const handleSubmit = (event) => { // need to deal with data here
        event.preventDefault();
        const formResponse = {
            name: name,
            password: password,
            weight: weight,
            sex: sex ///////////////////////////
        };
        alert("Form submitted");
    }
    const form = (
        <>
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input value={name} onChange={handleNameChange} type="text" placeholder="Enter name here" />
            </label>
            <br />
            <label>
                Password:
                <input value={password} onChange={handlePasswordChange} type="password" placeholder="Enter password here" />
            </label>
            <br />
            <label>
                Weight:
                <input value={weight} onChange={handleWeightChange} type="number" min="0" />
            </label>
            <br />
            <label>
                Sex:
                <br />
                <label>
                    Male
                    <input value="Male" onClick={handleSexChange} type="radio" name="sex" />
                </label>
                <br />
                <label>
                    Female
                    <input value="Female" onClick={handleSexChange} type="radio" name="sex" />
                </label>
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
        </>
    );

    return form;
}

function NextWorkout() {
    /*
    Module that shows the user what their next workout is
    Something like:

    Today is MONDAY 10/05/21
    

    Your next workout is on WEDNESDAY 12/05/21
    Push day
    */
    const date = new Date();
    const dayOfTheWeek = date.getDay();
    const dateString = date.toDateString();
    const routineSchedule = routine.scheduling;
    return JSON.stringify(routineSchedule);
}

export function HomePage(props) {
    const [ CSVData, setCSVData ] = useState();

    useEffect(() => {
        document.title = "Home";
    })

    return (
        <>
        <h1>Home Page!!</h1>
        <p>{CSVData}</p>
        <MainBody
            rightCol1={<NextWorkout />} />
        </>
    );
}

export default HomePage;