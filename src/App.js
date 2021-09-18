import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { NavBar } from './components/components.js';
import HomePage from './components/HomePage';
import RoutinesPage from './components/RoutinesPage';
import LogProgressPage from './components/LogProgressPage';
import ViewProgressPage from './components/ViewProgressPage';
import SettingsPage from './components/SettingsPage';

function App() {
  return (
    <>
    <Router>
      <NavBar />
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/logprogress" exact component={LogProgressPage} />
        <Route path="/viewprogress" exact component={ViewProgressPage} />
        <Route path="/routines" exact component={RoutinesPage} />
        <Route path="/settings" exact component={SettingsPage} />
      </Switch>
    </Router>
    </>
  );
}

export default App;