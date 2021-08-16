import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { NavBar } from './components/components.js';
import HomePage from './components/HomePage.js';
import RoutinesPage from './components/RoutinesPage.js';
import ProgressPage from './components/ProgressPage.js';
import SettingsPage from './components/SettingsPage.js';

function App() {
  return (
    <>
    <Router>
      <NavBar />
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/routines" exact component={RoutinesPage} />
        <Route path="/progress" exact component={ProgressPage} />
        <Route path="/settings" exact component={SettingsPage} />
      </Switch>
    </Router>
    </>
  );
}

export default App;