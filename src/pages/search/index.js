import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { WingBlank, WhiteSpace, Flex, List, DatePicker, Picker, Button, NavBar, Accordion, Tabs } from 'antd-mobile';
import { Search } from 'components';
import { getCitiesService, getRidesIHaveCreatedService } from 'services';
import schema from 'libs/state';
import moment from 'moment';
import s from './search.css';

const model = {
    tree: {
        cities: {},
        rides: getRidesIHaveCreatedService,
        searchForm: {
            from: null,
            to: null,
            date: null,
        },
    },
};

export const SearchPage = schema(model)(createReactClass({
    displayName: 'SearchPage',

    async componentDidMount() {
        await getRidesIHaveCreatedService(this.props.tree.rides);
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;
        const ridesData = this.props.tree.rides.get();
        const rides = !_.isEmpty(ridesData) && ridesData.status === 'Succeed' ? ridesData.data.results : [];

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
                <div>
                    {_.map(rides, (ride, index) => {
                        const {
                            cityFrom, cityTo, dateTime: date, numberOfSeats, price,
                        } = ride;

                        return (
                            <div
                                key={`ride-${index}`}
                                // onClick={() => {}}
                            >
                                <div className={s.ride}>
                                    <div className={s.date}>
                                        {moment(date).format('H:mm A')}<br />
                                        <span className={s.grey}>{moment(date).format('MMM D')}</span>
                                    </div>
                                    <div className={s.direction}>
                                        {`${cityFrom.name}, ${cityFrom.state.name}`}
                                        <span className={s.grey}>{`${cityTo.name}, ${cityTo.state.name}`}</span>
                                    </div>
                                    <div className={s.info}>
                                        {parseFloat(price).toString()} $
                                        <span className={s.grey}>
                                            {numberOfSeats}
                                            {numberOfSeats === 1 ? ' seat' : ' seats'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    },
}));
