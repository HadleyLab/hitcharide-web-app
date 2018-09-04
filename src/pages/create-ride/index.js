import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Link } from 'react-router-dom';
import { Search, Title } from 'components';
import schema from 'libs/state';
import { Flex, NavBar, Tabs, WingBlank } from 'antd-mobile';
import { getCitiesService } from 'services';
import s from './create-ride.css';

const tabs = [
    { title: 'Create', sub: '1' },
    { title: 'Suggest', sub: '2' },
];

const model = {
    cities: {},
    form: {
        from: null,
        to: null,
    },
};

export const CreateRidePage = schema(model)(createReactClass({
    getInitialState() {
        return {};
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;

        return (
            <div style={{ height: '100%'}}>
                <NavBar
                    mode="dark"
                    leftContent={(<Link to="/" style={{ whiteSpace: 'nowrap', fontSize: '14px', color: '#fff' }}>Cancel</Link>)}
                >
                    Create a ride
                </NavBar>
                <div className={s.section}>
                    <Title>Direction</Title>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('from')}
                        valueCursor={formCursor.from}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.from.set(v)}
                    >
                        <div className={s.text}>From </div>
                    </Search>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('to')}
                        valueCursor={formCursor.to}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.to.set(v)}
                    >
                        <div className={s.text}>To </div>
                    </Search>
                </div>
                <div className={s.section}>
                    <Title>Stop overs</Title>
                </div>
                <div className={s.section}>
                    <Title>Departure</Title>
                </div>
                {/*
                <Tabs
                    tabs={tabs}
                    initialPage={1}
                    renderTab={tab => <span>{tab.title}</span>}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                    <WingBlank>
                        Create new ride with car and stops
                        </WingBlank>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                    <WingBlank>
                        If I didn't find an interesting one ride in search I want to suggest a ride
                        </WingBlank>
                    </div>
                </Tabs>
                */}
            </div>
        );
    },
}));
