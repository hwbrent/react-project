import React, { useState, useEffect } from 'react';
import { MainBody } from './components.js';



export function RoutinesPage(props) {
    useEffect(() => {
        document.title = "Routines";
    });

    return (
        <>
        <h1>Routines Page!!</h1>
        <MainBody />
        </>
    );
}

export default RoutinesPage;