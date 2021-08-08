import React, { useEffect } from 'react';
import { MainBody } from './components.js'

export function SettingsPage(props) {
    useEffect(() => {
        document.title = "Settings";
    });
    return (
        <>
        <h1>Settings Page!!</h1>
        <MainBody />
        </>
    );
} // where user can edit their details, e.g. height, weight, custom

export default SettingsPage;