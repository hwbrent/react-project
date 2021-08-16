import React, { useState } from "react";
import { Link } from 'react-router-dom';

export const pageNames = [
    "Home",
    "Routines",
    "Progress",
    "Settings"
];

/*
export const routine = {
    name:"PPL",
    structure:[
        "push",
        "pull",
        "legs",
        "rest"
    ]
}
*/

export const routine = {
    name:"PPL",
    push: {
        Bench: {
            sets: 3,
            reps: 8
        },
        Arnold_Press: {
            sets: 3,
            reps: 8
        },
        Overhead_Tricep_Extension: {
            sets: 3,
            reps: 8
        },
        Dumbbell_Incline_Press: {
            sets: 3,
            reps: 8
        }
    },
    pull: {
        Lat_Pulldown: {
            sets: 3,
            reps: 8
        },
        Cable_Row: {
            sets: 3,
            reps: 8
        },
        Shrug: {
            sets: 3,
            reps: 8
        },
        Bicep_Curl: {
            sets: 3,
            reps: 8
        },
        Lat_Raises: {
            sets: 3,
            reps: 8
        },
        Cable_Fly: {
            sets: 3,
            reps: 8
        }
    },
    legs: {
        Squat: {
            sets: 3,
            reps: 6
        },
        Deadlift: {
            sets: 3,
            reps: 6
        },
        Quad_Extension: {
            sets: 3,
            reps: 8
        },
        Seated_Leg_Curl: {
            sets: 3,
            reps: 8
        }
    },
    scheduling: {
        1: "push",
        2: "pull",
        3: "legs",
        4: "rest"
    }
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
        if (pageName.includes(" ")) {
            pageName.replace(" ","");
        }
        const path = (pageName == "Home") ? `/` : `/${pageName.toLowerCase()}`;

        let li;
        if (pageName === props.activePage) {
            li = (
            <Link to={path}>
                <li className="nav-item active">
                    <a className="nav-link">{pageName}</a>
                </li>
            </Link>
            );
        } else {
            li = (
            <Link to={path}>
                <li className="nav-item">
                    <a className="nav-link">{pageName}</a>
                </li>
            </Link>
            );
        }
        return li;
    });
    return ( // can't get the image thingy to work :(
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link to="/">
                <a className="navbar-brand">
                    <div className="logo-image">
                        <img src=".../public/navbar-logo.png" className="img-fluid" />
                    </div>
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