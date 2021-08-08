import React, { useState, useEffect } from 'react';
import { MainBody } from './components.js';

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

    Your next workout is on WEDNESDAY 12/05/21
    Bench Press
    3 sets x 12 reps
    */
    const date = new Date();
    const dateString = date.toDateString();
}

export function HomePage(props) {
    useEffect(() => {
        document.title = "Home";
    });

    useEffect(() => { // perhaps use this useEffect for a signin/signup page
        // render signin/signup page instead of 
    },[])
    return (
        <>
        <h1>Home Page!!</h1>
        <MainBody />
        </>
    );
}

export default HomePage;