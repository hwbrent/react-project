import React, { useState, useRef, useEffect } from "react"

function renderHomePage() {}
function render() {}

export function MainBody(props) {
    let leftCol1 = props.leftCol1
    let leftCol2 = props.leftCol2
    let rightCol1 = props.rightCol1
    let rightCol2 = props.rightCol2

    const container = (
        <div className="container">
            <div className="row">
                <div className="col-md-3 text-left">
                    <div id="leftCol1">{leftCol1}</div>
                    <div id="leftCol2">{leftCol2}</div>
                </div>
                <div className="col-md-9 text-left">
                    <div id="rightCol1">{rightCol1}</div>
                    <div id="rightCol2">{rightCol2}</div>
                </div>

            </div>
        </div>
    );
    return container;
}

export function NavBar(props) {
    /*
    Props:
    - array of page names (but it's a one page dynamically loaded website so it'll all happen on one page)
    - the name of the page to set as the active page
    */
    const pageNames = props.pageNames; // this will be an array
    const activePage = props.activePage;
    const pageNamesList = pageNames.map((pageName) => {
        let li;
        if (pageName === activePage) {
            li = (<li className="nav-item active"><a className="nav-link">{pageName}</a></li>)
        } else {
            li = (<li className="nav-item"><a className="nav-link">{pageName}</a></li>)
        }
        return li;
    });
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="javascript:void(0)">Logo</a>
            <ul className="navbar-nav">
                {pageNamesList}
            </ul>
        </nav>
    );
}

/* export function WeightConverter(props) {
    const selectRef = useRef("kg_to_lbs");
    const main = (
        <>
        <label for="conversion">Choose a conversion:</label>
         <br />
        <select name="conversion" ref={selectRef}>
            <option value="kg_to_lbs" selected="selected">kg to lbs</option>
            <option value="kg_to_stone+lbs">kg to stone {"&"} lbs</option>
            <option value="lbs_to_kg">lbs to kg</option>
            <option value="lbs_to_stone+lbs">lbs to stone {"&"} lbs</option>
            <option value="stone+lbs_to_kg">stone {"&"} lbs to kg</option>
            <option value="stone+lbs_to_lbs">stone {"&"} lbs to lbs</option>
        </select>
        </>
    );
    
    const [outputtedWeightConversion,setOutputtedWeightConversion] = useState(0);
    let module;
    let handleChange;

    switch (selectRef.current.value) {
        // this switch statement is where the actual input/output conversion thingy will be decided
        case "kg_to_lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion} lbs</p>
                </>
            );
            handleChange = ({target}) => {setOutputtedWeightConversion(target.value * 2.205)};
            break;
        case "kg_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs}lbs</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone":Math.floor((target.value * 2.20462)/14),
                        "lbs":(target.value * 2.20462) - (Math.floor((target.value * 2.20462)/14))*14
                    }
                )
            }
            break;
        case "lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleChange = ({target}) => {setOutputtedWeightConversion(target.value/2.205)}
            break;
        case "lbs_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
            <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs} lbs</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone": Math.floor(target.value/14),
                        "lbs": target.value - (Math.floor(target.value/14)*14)
                    }
                )
            }
            break;
        case "stone+lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            const totalLbs = (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value);
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    totalLbs / 2.205
                )
            }
            break;
        case "stone+lbs_to_lbs":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value)
                )
            }
            break;
    }
    
    return (
        <>
        <div>{main}</div>
        <div>{module}</div>
        </>
    );
} */

export function WeightConverter(props) {
    const [value, setValue] = useState('kg_to_lbs')
    const main = (
        <>
        <label for="conversion">Choose a conversion:</label>
         <br />
        <select name="conversion" value={value} onChange={(e)=> setValue(e.target.value)}>
            <option value="kg_to_lbs" selected="selected">kg to lbs</option>
            <option value="kg_to_stone+lbs">kg to stone {"&"} lbs</option>
            <option value="lbs_to_kg">lbs to kg</option>
            <option value="lbs_to_stone+lbs">lbs to stone {"&"} lbs</option>
            <option value="stone+lbs_to_kg">stone {"&"} lbs to kg</option>
            <option value="stone+lbs_to_lbs">stone {"&"} lbs to lbs</option>
        </select>
        </>
    );
    
    const [outputtedWeightConversion,setOutputtedWeightConversion] = useState(0);
    let module;
    let handleChange;

    switch (value) {
        // this switch statement is where the actual input/output conversion thingy will be decided
        case "kg_to_lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion} lbs</p>
                </>
            );
            handleChange = ({target}) => {setOutputtedWeightConversion(target.value * 2.205)};
            break;
        case "kg_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs}lbs</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone":Math.floor((target.value * 2.20462)/14),
                        "lbs":(target.value * 2.20462) - (Math.floor((target.value * 2.20462)/14))*14
                    }
                )
            }
            break;
        case "lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleChange = ({target}) => {setOutputtedWeightConversion(target.value/2.205)}
            break;
        case "lbs_to_stone+lbs":
            module = (
                <>
                <input type="number" min="0" onChange={handleChange} />
            <p>{outputtedWeightConversion.stone} stone {outputtedWeightConversion.lbs} lbs</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    {
                        "stone": Math.floor(target.value/14),
                        "lbs": target.value - (Math.floor(target.value/14)*14)
                    }
                )
            }
            break;
        case "stone+lbs_to_kg":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            const totalLbs = (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value);
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    totalLbs / 2.205
                )
            }
            break;
        case "stone+lbs_to_lbs":
            module = (
                <>
                <input type="number" min="0" name="stone" id="stone" onChange={handleChange} />
                <label for="stone">Stone</label>
                <input type="number" min="0" name="lbs" id="lbs" onChange={handleChange} />
                <label for="lbs">Lbs</label>
                <p>{outputtedWeightConversion} kg</p>
                </>
            );
            handleChange = ({target}) => {
                setOutputtedWeightConversion(
                    (document.getElementById("stone").value * 14) + (document.getElementById("lbs").value)
                )
            }
            break;
    }
    
    return (
        <>
        <div>{main}</div>
        <div>{module}</div>
        </>
    );
}

/*
Use useRef hook
const selectRef = useRef()
<select ref = {selectRef} />
switch (selectRef.current.value)
*/