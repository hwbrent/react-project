import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';

export const pageNames = ["Home", "Log Progress", "View Progress", "Routines", "Settings"];

// main frame used for most pages:
export function MainBody(props) {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-3 text-left">
                    <div id="leftCol1">{props.leftCol1}</div>
                    <div id="leftCol2">{props.leftCol2}</div>
                </div>
                <div className="col-md-9 text-left">
                    <div id="rightCol1">{props.rightCol1}</div>
                    <div id="rightCol2">{props.rightCol2}</div>
                </div>
            </div>
        </div>
    );
}

export function NavBar(props) {
    /*
    Props:
    - activePage (string) --> the name of the page that's the active page e.g. "Home"
    */
    const pageNamesList = pageNames.map((pageName, key) => {
        const path = (pageName === "Home")
            ? `/`
            : `/${pageName.replace(/ /g,"").toLowerCase()}`;

        const className = (pageName === props.activePage)
            ? "nav-item active"
            : "nav-item";
        const li = (
            <Link to={path}>
                <li className={className} key={key}>
                    <a className="nav-link">{pageName}</a>
                </li>
            </Link>
        );
        return li;
    });
    return ( // can't get the image thingy to work :(
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link to="/">
                <a className="navbar-brand">
                    <img src="https://images.app.goo.gl/XXCP7n1HV1xAWG5n7" className="img-fluid" alt="logo" />
                </a>
            </Link>
            <ul className="navbar-nav">
                {pageNamesList}
            </ul>
        </nav>
    );
}

NavBar.defaultProps = {
    activePage: "Home"
} 

export function MovementSelect(props) { // the handleChange prop is what lets you pass the selected movement to the parent component
    const [ movements, setMovements ] = useState([]);
    const [ chosen, setChosen ] = useState();

    useEffect(() => {
        async function fetchMovements() {
            try {
                const response = await fetch('http://localhost:8090/get/allmovements');
                const data = await response.json();
                await setMovements(data);    
            } catch (error) {
                console.error(error.message);
            }
            
        };
        fetchMovements();
    }, []);

    let options; // an array to go in the <select>
    if (props.options !== undefined) {
        options = props.options
    } else {
        options = movements.map((entry, key) => 
            <option key={key} value={entry.movement_name}>{entry.movement_name}</option>
        );
    }

    const select = (
        <label>
            {props.label} <br />
            <select onChange={props.onChange}> {/* You can get the value of this select by manipulating the event in the handleChange function */}
                {options}
            </select>
        </label>
    );
    return select;
}

export function Table(props) {
    /*
    Props:
    • arr --> array of objects
    Everything can be based off that
    The keys that all the objects in the array have will form the headers
    The values corresponding to the keys will form the row data
    
    Or you can submit:
    • colNames --> array of strings representing the strings to go in each column header
    • rowData --> array of objects. The `value`s of these objects will comprise the entries in the table body rows
    */
    if (!props.colNames || !props.rowData) return <p><i><code>Waiting for user input...</code></i></p>;

    const thead = (
        <thead>
            <tr>
                {props.colNames.map((name, key) => <th scope="col" key={key}>{name}</th>)}
            </tr>
        </thead>
    );

    const tbody = (
        <tbody>
            {props.rowData.map((obj, key1) => // for each object in rowData...
                <tr key={key1}>
                    {Object.values(obj).map((value, key2) => // for each value in the values of the object...
                        <td key={key2}>{value}</td>
                    )} 
                </tr>
            )}
        </tbody>
    );

    return (
        <table className="table">
            {thead}
            {tbody}
        </table>
    );
}

export function LineChart(props) {
    const data = {
        labels: props.xAxisLabels,
        datasets: [
            {
                label: props.dataLabel,
                data: props.data,
                fill: false,
                backgroundColor: props.backgroundColor,
                borderColor: props.borderColor
            }
        ]
    };
    return <Line data={data} options={props.options} />;
}

export function Sidebar(props) {
    if (props.bullets === undefined) return <code>No bullets prop passed to Sidebar</code>;
    
    const li = props.bullets.map((entry, key) => 
        <li
            key={key}
            onClick={props.onClick}
            id="SidebarLI"
        >
            {entry}
        </li>
    );
    return <ul>{li}</ul>;
}