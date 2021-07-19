import './App.css';
import React from 'react';
import { NavBar, MainBody, WeightConverter, ChartJSLineGraph } from "./components/components.js";

function App() {
  return (
    <>
    <NavBar
      pageNames={["Home","Me","Brudda"]}
      activePage="Home"/>
    <MainBody
      leftCol1={<WeightConverter />}
      leftCol2="World"
      rightCol1={null}
      rightCol2="Sup!"/>
    </>
  )
}

export default App;