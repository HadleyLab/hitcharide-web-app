import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { NavBar } from 'antd-mobile';

export const ProfilePage = createReactClass({
    render() {
        return (
            <div>
                <NavBar
                    mode="dark"
                    // leftContent="Hitcharide"
                    // rightContent={(<div style={{ whiteSpace: 'nowrap', fontSize: '14px' }}>+ Create a ride</div>)}
                    // rightContent={(<Button size="small">+ Create a ride</Button>)}
                >
                    Profile
                </NavBar>
            </div>
        );
    },
});
