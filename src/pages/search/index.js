import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Search, Title } from 'components';
import schema from 'libs/state';
import moment from 'moment';
import { Button, Icon } from 'antd-mobile';
import { checkIfValueEmpty } from 'components/utils';
import { DriverIcon, TravelerIcon, MarkerIcon } from 'components/icons';
import s from './search.css';

const paginationParams = {
    limit: 20,
    offset: 0,
};

const model = {
    tree: {
        cities: {},
        rides: {},
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
        history: PropTypes.shape().isRequired,
        userType: PropTypes.string.isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            getRidesListService: PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return paginationParams;
    },

    componentDidMount() {
        const rides = this.props.tree.rides.get();

        if (!rides || _.isEmpty(rides)) {
            this.loadRides(paginationParams);
        }
    },

    componentDidUpdate(prevProps) {
        if (prevProps.userType !== this.props.userType) {
            this.props.tree.rides.set({});
            this.loadRides(paginationParams);
        }
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

    async loadRides(params, dehydrateParams) {
        const isDriver = this.props.userType === 'driver';
        const { getRidesListService } = this.context.services;
        const cursor = this.props.tree.rides;
        const formCursor = this.props.tree.searchForm;
        const searchParams = this.hydrateParams(formCursor.get());

        if (isDriver) {
            return;
        }

        await getRidesListService(cursor, _.merge(searchParams, params), dehydrateParams);
    },

    onSearchChange() {
        this.setState({ offset: 0 });
        this.loadRides(paginationParams);
    },

    loadMore() {
        const cursor = this.props.tree.rides;
        const { limit, offset: prevOffset } = this.state;
        const offset = prevOffset + limit;

        this.setState(
            { offset },
            () => this.loadRides(
                { limit, offset },
                {
                    toMerge: true,
                    previousResults: cursor.data.get('results'),
                }
            )
        );
    },

    renderRides() {
        const isDriver = this.props.userType === 'driver';
        const ridesData = this.props.tree.rides.get() || {};
        const { data, status } = ridesData;

        if (_.isEmpty(ridesData) || !data || status !== 'Succeed') {
            return null;
        }

        const { results: rides, next } = data;

        if (rides.length === 0) {
            return (
                <div className={s.noResults}>
                    No rides found
                </div>
            );
        }

        return (
            <div
                className={classNames(s.rides, {
                    [s._withLast]: !next,
                })}
            >
                {_.map(rides, (ride, index) => {
                    const {
                        cityFrom, cityTo, dateTime: date, availableNumberOfSeats, price, pk,
                    } = ride;

                    return (
                        <div
                            key={`ride-${index}`}
                            className={s.ride}
                            onClick={() => this.props.history.push(`/app/ride/${pk}`)}
                        >
                            <div className={s.userTypeIcon}>
                                {isDriver
                                    ? <TravelerIcon color="#40A9FF" />
                                    : <DriverIcon color="#40A9FF" />
                                }
                            </div>
                            <div className={s.date}>
                                <div style={{ whiteSpace: 'nowrap' }}>{moment(date).format('h:mm A')}</div>
                                <div className={s.gray}>{moment(date).format('MMM D')}</div>
                            </div>
                            <div className={s.direction}>
                                {`${cityFrom.name}, ${cityFrom.state.name}`}
                                <span className={s.gray}>{`${cityTo.name}, ${cityTo.state.name}`}</span>
                            </div>
                            <div className={s.info}>
                                <span style={{ whiteSpace: 'nowrap' }}>$ {parseFloat(price).toString()}</span>
                                <span className={s.gray}>
                                    {availableNumberOfSeats}
                                    {availableNumberOfSeats === 1 ? ' seat' : ' seats'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    },

    renderFooter() {
        const ridesData = this.props.tree.rides.get() || {};

        if (_.isEmpty(ridesData)) {
            return null;
        }

        const { data, status } = ridesData;

        if (!data || status !== 'Succeed') {
            return (
                <div className={s.footer}>
                    <Icon type="loading" size="md" />
                </div>
            );
        }

        const { next } = data;

        if (next) {
            return (
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.loadMore}
                    >
                        Load more
                    </Button>
                </div>
            );
        }

        return null;
    },

    render() {
        const { getCitiesService } = this.context.services;
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;

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
                    <div className={s.icon}>
                        <MarkerIcon color="#6FA6F8" />
                    </div>
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
                    <div className={s.icon}>
                        <MarkerIcon color="#97B725" />
                    </div>
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
                {this.renderRides()}
                {this.renderFooter()}
            </div>
        );
    },
}));
