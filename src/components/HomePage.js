import React, { useEffect } from 'react';
import { MainBody } from './components.js';

export function HomePage() {

    useEffect(() => {
        document.title = "Home";
    })

    const toBring = ["FitBit", "AirPods", "Water bottle", "Face mask", "Towel", "Nike bag", "Shampoo", "Spare clothes"];
    const listToBring = (
        <>
        Don't forget:
        <ul>
            {toBring.map((item, key) => {return <li key={key}>{item}</li>})}
        </ul>
        </>
    );

    return (
        <>
        <h1>Home Page!!</h1>
        <MainBody
            leftCol1={listToBring} />
        </>
    );
}

export default HomePage;