import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { WingBlank, WhiteSpace, Flex, List, DatePicker, Picker, Button, NavBar, Accordion, Tabs } from 'antd-mobile';
import { Search } from 'components';
import { getCitiesService } from 'services';
import schema from 'libs/state';
import s from './search.css';

import locationIcon from 'components/icons/location.svg';

const tabs = [
    { title: 'List', sub: '1' },
    { title: 'Calendar', sub: '2' },
];

const model = {
    tree: {
        cities: {},
        searchForm: {
            from: null,
            to: null,
            date: null,
        },
    },
};

export const SearchPage = schema(model)(createReactClass({
    getInitialState() {
        return {
            date: new Date(),
        };
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;

        return (
            <div>
                <Search
                    cursor={citiesCursor}
                    selectedValue={formCursor.get('from')}
                    valueCursor={formCursor.from}
                    service={getCitiesService}
                    displayItem={({ name, state }) => `${name}, ${state.name}`}
                    onItemSelect={(v) => formCursor.from.set(v)}
                >
                    {/*
                    <div className={s.icon} style={{ backgroundImage: `url(${locationIcon})` }} />
                    */}
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
                    {/*
                    <div className={s.icon} style={{ backgroundImage: `url(${locationIcon})` }} />
                    */}
                    <div className={s.text}>To </div>
                </Search>
                {/*
                <List className={s.form}>
                    <DatePicker
                        className="dateTime"
                        value={this.state.date}
                        onChange={(date) => this.setState({ date })}
                    >
                        <List.Item arrow="horizontal">Date & Time</List.Item>
                    </DatePicker>
                </List>
                */}
                <WhiteSpace />
                <WingBlank>
                    <Flex justify="end">
                        <Button type="primary" size="small" inline>Search for a ride</Button>
                    </Flex>
                </WingBlank>
                <WhiteSpace />

                <WhiteSpace />

                <Tabs
                    tabs={tabs}
                    initialPage={0}
                    renderTab={tab => <span>{tab.title}</span>}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                        <List>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                            <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                              From Krasnoyarsk To Novosibirsk <br />
                              on Sunday 2.09.2018 at 4:00 p.m<br />
                              4 seats available
                            </List.Item>
                        </List>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                        Calendar View of rides list
                    </div>
                </Tabs>


            </div>
        );
    },
}));
