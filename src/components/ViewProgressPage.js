import React, { useEffect } from 'react';
import { MainBody } from './components.js';
import { Line } from 'react-chartjs-2';

const Chart_js = (props) => {
    return <Line />;
}

export function ViewProgressPage() {
    useEffect(() => {
        document.title = "View Progress";
    })

    return (
        <>
        <h1>View Progress!!</h1>
        <MainBody 
            rightCol1={<Chart_js />}/>
        </>
    );
}

export default ViewProgressPage;