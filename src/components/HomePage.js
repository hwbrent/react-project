import React, { useState, useEffect } from 'react';
import { MainBody, routine } from './components.js';
// import { csv } from 'd3';


const NextWorkout = () => {
    /*
    Module that shows the user what their next workout is
    Something like:

    -----------------------------------------------
    | Today is MONDAY 10/05/21                    |
    |                                             |
    | Your next workout is on WEDNESDAY 12/05/21  |
    | Push day                                    |
    -----------------------------------------------
    */
    const date = new Date();
    // day of the week (number 0-6, Sunday-Saturday) --> date.getDay()
    // date string --> date.toDateString(); // to be used at top of widget
    const determiner = (date.getDay() % routine.scheduling.length);
    const todaysWorkout = routine.scheduling[determiner];

    let nextWorkout;

    console.log(determiner)
    console.log(todaysWorkout)

    if (todaysWorkout === "rest") {
        nextWorkout = "Today is a rest day. Enjoy the day off!"
    } else {
        const listOfExercises = Object.keys( routine[todaysWorkout] ).map(movement => {
            return (
            <li>
                {movement.replace(/_/g," ")}
            </li>
            );
        })
        nextWorkout = (
            <>
            Your next workout is <b><i>{todaysWorkout.toUpperCase()}</i></b>: <br />
            <ul>
                {listOfExercises}
            </ul>
            </>
        );
    }

    const divStyle = {};
    
    const styledDiv = (
        <div style={null}>
            Today is <b>{date.toDateString()}</b>  <br />
            {nextWorkout} <br />
        </div>
    );

    return styledDiv;
}

const RecentProgressVisualisation = () => {} // Maybe a small calendar/timeline widget to show which days I went to gym and which I didn't

export function HomePage() {

    useEffect(() => {
        document.title = "Home";
    })

    const toBring = ["FitBit", "AirPods", "Water bottle", "Face mask", "Towel", "Nike bag", "Shampoo", "Spare clothes"];
    const listToBring = (
        <>
        Don't forget:
        <ul>
            {toBring.map(item => {return <li>{item}</li>})}
        </ul>
        </>
    );

    return (
        <>
        <h1>Home Page!!</h1>
        <MainBody
            leftCol1={listToBring}
            rightCol1={<NextWorkout />} />
        </>
    );
}

export default HomePage;