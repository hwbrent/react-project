import React, { useState, useEffect } from 'react';
import {
    MainBody,
    MovementSelect,
    Table,
    LineChart,
    Sidebar
} from './components.js';
import {
    rectifyLogsDate,
    sortArrayByObjectKey,
    titleCase,
    areEqual,
    findNearestTo
} from './functions.js';

function LogsTable() {
    const [ logs, setLogs ] = useState([]);
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8090/get/alllogs");
                const data = await response.json();
                const rectified = await rectifyLogsDate(data);
                await setLogs(rectified);
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchData();
    }, [])

    const handleTableClick = ({target}) => { // doesn't quite work how I wanted :(
        console.log(target.innerHTML);
        setLogs(prev => {
            const copy = prev.slice(0);
            const sorted = copy.sort( sortArrayByObjectKey(target.innerHTML) );
            return sorted;
        })
    }

    let colNames;
    let rowData;
    if (!areEqual(logs, [])) {
        colNames = Object.keys(logs[0]).map(name => titleCase(name.replace(/_/g, " ")));
        rowData = logs;
    }

    return (
        <>
        {/*<p>{JSON.stringify(logs, null, "\t")}</p>*/}
        <p>Hello</p>
        <Table colNames={colNames} rowData={rowData} onClick={handleTableClick} />
        </>
    );
}

function StrengthStandardsDatalist(props) {
    const [ urls, setUrls ] = useState([]);
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8090/get/strengthstandards/" + encodeURIComponent("urls"));
                const data = await response.json();
                setUrls(data);
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchData();
    }, [])

    const options = urls.map((url, key) => {
        const value = url.slice(45, url.length-3).replace(/-/g, " ");
        return <option key={key} value={titleCase(value)} />;
    });
    
    const datalist = (
        <form onSubmit={props.onSubmit}>
            <input type="text" list="urls" placeholder="Select a movement"/>
            <datalist id="urls">
                {options}
            </datalist>
            <input type="submit" value="Select" />
        </form>
    );

    return datalist;
}

function StrengthStandardsTable() {
    const [ strengthstandards, setStrengthStandards ] = useState({});
    const [ userBodyweight, setUserBodyweight ] = useState();
    const [ userSex, setUserSex ] = useState("male");
    
    const convertBack = string => string.split(" ").map(word => word[0].toLowerCase() + word.slice(1)).join("-");

    const handleDatalistSubmit = async (event) => {
        event.preventDefault();
        const choice = event.target[0].value;
        const param = encodeURIComponent((convertBack(choice)));
        try {
            const response = await fetch("http://localhost:8090/get/strengthstandards/" + param, {
                method: "GET",
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            // console.log("/get/strengthstandards + param data:", data);
            await setStrengthStandards(data)
        } catch (error) {
            console.error(error.message);
        }
    }

    /*
    User has already chosen the lift

    Now they need to enter their sex and their weight, and they'll be shown a mini table showing the numbers

    Also offer a box where they can enter their 1RM and 
    */

    const userInfoInputs = (
        <>
        <label> {/* for userSex */}
            Please enter the sex you were assigned at birth: <br />
            <label>
                Male:
                <input type="radio" name="userSex" value="male" onClick={({target}) => setUserSex(target.value)} />
            </label> <br />
            <label>
                Female:
                <input type="radio" name="userSex" value="female" onClick={({target}) => setUserSex(target.value)} />
            </label>
        </label>

        <label> {/* for userBodyweight */} 
            If you wish, you can also enter your bodyweight <b><i>(in kg)</i></b> to show the data most related to you: <br />
            <input type="number" min="0" step="0.1" placeholder="in kg" onChange={({target}) => setUserBodyweight(target.value)} />
        </label>
        </>
    );

    let tableHeader;
    let standardsMeanings;
    let colNames;
    let rowData;
    
    if (!areEqual(strengthstandards, {})) { // i.e. if strengthstandards isn't empty
        standardsMeanings = (
            <div id="standardsMeanings">
                {Object.entries(strengthstandards.metadata.meanings).map(([standard, meaning], key) => {
                    return <p key={key}><i><b>{standard}</b> - {meaning}</i></p>;
                })}
            </div>
        );
        colNames = [
            "Bodyweight",
            ...Object.keys(strengthstandards.data.male["110"])
        ];
        rowData = Object.entries(strengthstandards.data[userSex]).map( entry => {return {"Bodyweight": parseInt(entry[0]), ...entry[1]}});
        // table = <Table colNames={colNames} rowData={rowData} />;
        tableHeader = <h2>{titleCase(strengthstandards.movement_name.replace(/-/g, " "))}</h2>;
    }

    if (userBodyweight !== undefined && !areEqual(strengthstandards, {}))  {
        const bodyweights = Object.keys(strengthstandards.data[userSex]).map(weight => parseFloat(weight));
        const index = findNearestTo(userBodyweight, bodyweights);
        const nearestBodyweight = (index[1].length === 1)
            ? bodyweights[index[1]]
            : parseFloat(userBodyweight) + parseFloat(index[0]); // if I didn't do this, it'd get stuck and not show any data when you input a weight such as 107.5, which is equidistant betwixt 105 and 110
        const relevantEntries = strengthstandards.data[userSex][`${nearestBodyweight}`];
        if (userBodyweight !== "") rowData = [{"Bodyweight":nearestBodyweight, ...relevantEntries}];
    }

    return (
        <>
        <StrengthStandardsDatalist onSubmit={handleDatalistSubmit} />
        {userInfoInputs}
        <hr />
        {tableHeader}
        <Table colNames={colNames} rowData={rowData} />
        {standardsMeanings}
        <p><i>Source of the strength level data: <a href="https://strengthlevel.com/strength-standards" target="_blank">www.strengthlevel.com</a>.</i></p>
        </>
    )
}

function VisualiseProgress() {
    const [ logs, setLogs ] = useState([]);
    const [ chosenMovement, setChosenMovement ] = useState();
    // const [ chosenMovementData, setChosenMovementData ] = useState();
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8090/get/alllogs");
                const data = await response.json();
                console.log(data);
                await setLogs(rectifyLogsDate(data));
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchData();
    }, []);

    let xAxisLabels; // will be dates in my case
    let dataLabel;
    let data;
    let backgroundColor;
    let borderColor;
    let LineChartOptions;
    let MovementSelectOptions;
    if (!areEqual(logs, [])) {
        console.log("logs valid");
        const movementsLogged = Array.from(new Set( // Done this because Sets don't allow duplicates
            logs.map(obj => obj.movement_name)
        )).sort();
        MovementSelectOptions = movementsLogged.map((movement_name, key) => <option key={key} value={movement_name}>{movement_name}</option>)

        if (chosenMovement !== undefined) {
            console.log("chosenMovement !== undefined")
            const chosenMovementData = logs.filter(obj => obj.movement_name === chosenMovement);
            console.log("chosenMovementData:",chosenMovementData);
            xAxisLabels = chosenMovementData.map(obj => obj.date);
            dataLabel = `Data for ${chosenMovement}`;
            data = chosenMovementData.map(obj => obj.weight);
            LineChartOptions = {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }
    }

    return (
        <>
        <MovementSelect
            label="Select a movement to see progress for:"
            options={MovementSelectOptions} 
            onChange={({target}) => {
                setChosenMovement(target.value);
                console.log(target.value);
            }}
        />
        <LineChart
            xAxisLabels={xAxisLabels}
            dataLabel={dataLabel}
            data={data}
            backgroundColor='rgb(255, 99, 132)'
            borderColor='rgba(255, 99, 132, 0.2)'
            options={LineChartOptions} />
        </>
    );
}

export function ViewProgressPage(props) {
    console.log("rendered <Viewprogresspage />")
    useEffect(() => {
        document.title = "View Progress";
    })

    const bullets = {
        "Table of logs": <LogsTable />,
        "Table of strength standards": <StrengthStandardsTable />,
        "Progress line graphs": <VisualiseProgress />
    }

    const [ tabChoice, setTabChoice ] = useState("Select an option from the sidebar to view your progress.");

    const handleLIClick = (event) => {
        const targetData = event.target.innerHTML;
        setTabChoice(bullets[targetData]);
    }

    return (
        <>
        <h1>View Progress!!</h1>
        <MainBody
            leftCol1={<Sidebar
                bullets={Object.keys(bullets)}
                onClick={handleLIClick} />}
            rightCol1={tabChoice}
        />
        </>
    );
}

export default ViewProgressPage;
