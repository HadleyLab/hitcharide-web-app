import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import createReactClass from 'create-react-class';

export const HomePage = createReactClass({
    render() {
        return (
            <div>
                Home <br /><br />
                <Link to="/app">App</Link><br /><br />
                <Link to="/login">Sign In</Link><br /><br />
                <Link to="/registration">Sign Up</Link><br /><br />
            </div>
        );
    },
});
