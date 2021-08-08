import React, { useEffect } from 'react';
import { MainBody } from './components.js';

export function ProgressPage(props) {
    useEffect(() => {
        document.title = "Progress";
    });
    return (
        <>
        <h1>Progress Page!!</h1>
        <MainBody />
        </>
    );
}


export default ProgressPage;