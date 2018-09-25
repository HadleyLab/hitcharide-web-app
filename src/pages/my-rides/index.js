import React from 'react';
import createReactClass from 'create-react-class';
import { Tabs } from 'antd-mobile';
import { Calendar } from 'components';
import s from './my-rides.css';

const tabs = [
    { title: 'List', sub: '0' },
    { title: 'Calendar', sub: '1' },
];

export const MyRidesPage = createReactClass({
    render() {
        return (
            <Tabs
                tabs={tabs}
                initialPage={0}
                renderTab={(tab) => <span>{tab.title}</span>}
            >
                <div className={s.tab}>
                    List of my rides
                </div>
                <div className={s.tab}>
                    <Calendar />
                </div>
            </Tabs>
        );
    },
});
