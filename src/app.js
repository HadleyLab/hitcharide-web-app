import ReactDOM from 'react-dom';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { RobotsTxt } from 'components';


ReactDOM.render(
    <Router>
        <Route
            render={(location) => (
                <div id="router">
                    Hitcharide
                </div>
            )}
        />
    </Router>,
    document.getElementById('root')
);
