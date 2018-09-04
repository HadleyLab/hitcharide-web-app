import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { NavBar, Button } from 'antd-mobile';
import { logout } from 'components/utils';

export const ProfilePage = createReactClass({
    logout() {
        logout();
        this.props.tokenCursor.set(null);
    },

    render() {
        return (
            <div>
                <Button onClick={this.logout}>Logout</Button>
            </div>
        );
    },
});
