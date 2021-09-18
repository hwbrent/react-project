import React from "react";
import { Link } from 'react-router-dom';

export const pageNames = [
    "Home",
    "Log Progress",
    "View Progress",
    "Routines",
    "Settings"
];

export const routine = {
    name:"PPL",
    push: {
        Bench: {sets: 3, reps: 8},
        Arnold_Press: {sets: 3, reps: 8},
        Overhead_Tricep_Extension: {sets: 3, reps: 8},
        Dumbbell_Incline_Press: {sets: 3, reps: 8 }
    },
    pull: {
        Lat_Pulldown: {sets: 3, reps: 8},
        Cable_Row: {sets: 3, reps: 8},
        Shrug: {sets: 3, reps: 8},
        Bicep_Curl: {sets: 3, reps: 8},
        Lat_Raises: {sets: 3, reps: 8},
        Cable_Fly: {sets: 3, reps: 8}
    },
    legs: {
        Squat: {sets: 3, reps: 6},
        Deadlift: {sets: 3, reps: 6},
        Quad_Extension: {sets: 3, reps: 8},
        Seated_Leg_Curl: {sets: 3, reps: 8 }
    },
    scheduling: [
        "push",
        "pull",
        "legs",
        "rest"
    ]
}

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
    const pageNamesList = pageNames.map((pageName) => {
        const path = (pageName === "Home")
            ? `/`
            : `/${pageName.replace(/ /g,"").toLowerCase()}`;

        const className = (pageName === props.activePage)
            ? "nav-item active"
            : "nav-item";
        const li = (
            <Link to={path}>
                <li className={className}>
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