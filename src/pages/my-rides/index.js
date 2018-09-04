import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Button, Tabs } from 'antd-mobile';

const tabs = [
    { title: 'Suggested', sub: '1' },
    { title: 'Booked', sub: '2' },
    { title: 'History', sub: '3' },
];

export const MyRidesPage = createReactClass({
    render() {
        return (
            <div>
                <Tabs
                    tabs={tabs}
                    initialPage={0}
                    renderTab={tab => <span>{tab.title}</span>}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                        Content of first tab
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                        Content of second tab
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                        Content of third tab
                    </div>
                </Tabs>
            </div>
        );
    },
});
