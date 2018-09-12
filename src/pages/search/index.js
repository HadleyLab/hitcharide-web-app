import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
// import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Search, Title } from 'components';
import { getCitiesService, getRidesListService } from 'services';
import schema from 'libs/state';
import moment from 'moment';
import { checkIfValueEmpty } from 'components/utils';
import markerIcon from 'components/icons/marker.svg';
import s from './search.css';

const model = {
    tree: {
        cities: {},
        rides: getRidesListService,
        searchForm: {
            cityFrom: null,
            cityTo: null,
            date: null,
        },
    },
};

export const SearchPage = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    async componentDidMount() {
        await getRidesListService(this.props.tree.rides);
    },

    hydrateParams(data) {
        const params = _.chain(data)
            .omitBy((value) => checkIfValueEmpty(value))
            .mapValues((value, key) => {
                if (key === 'cityFrom' || key === 'cityTo') {
                    return value.pk;
                }

                return value;
            })
            .value();

        return params;
    },

    async onSearchChange() {
        const formCursor = this.props.tree.searchForm;
        const params = this.hydrateParams(formCursor.get());

        await getRidesListService(this.props.tree.rides, params);
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;
        const ridesData = this.props.tree.rides.get();
        const rides = !_.isEmpty(ridesData) && ridesData.status === 'Succeed' ? ridesData.data.results : [];

        return (
            <div className={s.container}>
                <Title>Search for a ride</Title>
                <Search
                    cursor={citiesCursor}
                    selectedValue={formCursor.get('cityFrom')}
                    valueCursor={formCursor.cityFrom}
                    service={getCitiesService}
                    displayItem={({ name, state }) => `${name}, ${state.name}`}
                    onItemSelect={(v) => {
                        formCursor.cityFrom.set(v);
                        this.onSearchChange();
                    }}
                    className={s.field}
                >
                    <div className={s.icon} style={{ backgroundImage: `url(${markerIcon})` }} />
                    <div className={s.text}>From </div>
                </Search>
                <Search
                    cursor={citiesCursor}
                    selectedValue={formCursor.get('cityTo')}
                    valueCursor={formCursor.cityTo}
                    service={getCitiesService}
                    displayItem={({ name, state }) => `${name}, ${state.name}`}
                    onItemSelect={(v) => {
                        formCursor.cityTo.set(v);
                        this.onSearchChange();
                    }}
                    className={s.field}
                >
                    <div className={s.icon} style={{ backgroundImage: `url(${markerIcon})` }} />
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
                <div className={s.rides}>
                    {_.map(rides, (ride, index) => {
                        const {
                            cityFrom, cityTo, dateTime: date, numberOfSeats, price,
                        } = ride;

                        return (
                            <div className={s.ride} key={`ride-${index}`}>
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
                        );
                    })}
                </div>
            </div>
        );
    },
}));
