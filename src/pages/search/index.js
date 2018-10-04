import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Search, Title, RideItem, RideRequestItem,
    DateTimePicker,
} from 'components';
import schema from 'libs/state';
import { Button, Icon } from 'antd-mobile';
import { MarkerIcon, ClockIcon, AddIcon } from 'components/icons';
import moment from 'moment';
import s from './search.css';

const paginationParams = {
    limit: 20,
    offset: 0,
};

const model = {
    tree: {
        cities: {},
        rides: {},
        rideRequests: {},
        searchForm: {
            cityFrom: null,
            cityTo: null,
            dateTime: null,
        },
        params: paginationParams,
    },
};

export const SearchPage = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        userType: PropTypes.string.isRequired,
        onCreateRide: PropTypes.func.isRequired,
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            getRidesListService: PropTypes.func.isRequired,
            getRideRequestsListService: PropTypes.func.isRequired,
        }).isRequired,
    },

    componentDidMount() {
        const isDriver = this.props.userType === 'driver';
        const { history } = this.props;
        const rides = this.props.tree.rides.get();
        const rideRequests = this.props.tree.rideRequests.get();

        if (history.action === 'POP') {
            if (isDriver && !_.isEmpty(rideRequests)) {
                return;
            }

            if (!isDriver && !_.isEmpty(rides)) {
                return;
            }
        }

        this.props.tree.params.set(paginationParams);
        this.resetFilters();
        this.loadRides(paginationParams);
    },

    componentDidUpdate(prevProps) {
        if (prevProps.userType !== this.props.userType) {
            this.props.tree.rides.set({});
            this.props.tree.rideRequests.set({});
            this.props.tree.params.set(paginationParams);
            this.loadRides(paginationParams);
        }
    },

    hydrateParams(data) {
        let params = {};

        _.forEach(data, (param, key) => {
            if (!param) {
                return;
            }

            if (key === 'cityFrom' || key === 'cityTo') {
                params[key] = param.pk;
            }

            if (key === 'dateTime') {
                params.dateTimeFrom = moment(param)
                    .utc()
                    .format();
                params.dateTimeTo = moment(param)
                    .add(3, 'days')
                    .endOf('day')
                    .utc()
                    .format();
            }
        });

        return params;
    },

    async loadRides(params, dehydrateParams) {
        const isDriver = this.props.userType === 'driver';
        const { getRidesListService, getRideRequestsListService } = this.props.services;
        const formCursor = this.props.tree.searchForm;
        const searchParams = this.hydrateParams(formCursor.get());

        if (isDriver) {
            const cursor = this.props.tree.rideRequests;
            await getRideRequestsListService(cursor, _.merge(searchParams, params), dehydrateParams);

            return;
        }

        const cursor = this.props.tree.rides;
        await getRidesListService(cursor, _.merge(searchParams, params), dehydrateParams);
    },

    onSearchChange() {
        this.props.tree.params.offset.set(0);
        this.loadRides(paginationParams);
    },

    async loadMore() {
        const isDriver = this.props.userType === 'driver';
        const ridesCursor = this.props.tree.rides;
        const rideRequestsCursor = this.props.tree.rideRequests;
        const cursor = isDriver ? rideRequestsCursor : ridesCursor;
        const { limit, offset: prevOffset } = this.props.tree.params.get();
        const offset = prevOffset + limit;

        await this.props.tree.params.offset.set(offset);

        this.loadRides(
            { limit, offset },
            {
                toMerge: true,
                previousResults: cursor.data.get('results'),
            }
        );
    },

    resetFilters() {
        this.props.tree.searchForm.set({});
        this.onSearchChange();
    },

    renderRides() {
        const isDriver = this.props.userType === 'driver';
        const cursor = isDriver ? this.props.tree.rideRequests : this.props.tree.rides;
        const ridesData = cursor.get() || {};
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
                    if (isDriver) {
                        return (
                            <RideRequestItem
                                key={`ride-${index}`}
                                data={ride}
                                history={this.props.history}
                            />
                        );
                    }

                    return (
                        <RideItem
                            key={`ride-request-${index}`}
                            data={ride}
                            history={this.props.history}
                        />
                    );
                })}
            </div>
        );
    },

    renderFooter() {
        const isDriver = this.props.userType === 'driver';
        const rides = this.props.tree.rides.get();
        const rideRequests = this.props.tree.rideRequests.get();
        let ridesData = {};

        if (isDriver && rideRequests) {
            ridesData = rideRequests;
        }

        if (!isDriver && rides) {
            ridesData = rides;
        }

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
        const { getCitiesService } = this.props.services;
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.searchForm;

        return (
            <div className={s.container}>
                <Title>
                    Search for a ride
                </Title>
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
                <DateTimePicker
                    className={s.datePicker}
                    value={formCursor.dateTime.get()}
                    onChange={(date) => {
                        formCursor.dateTime.set(moment(date).toDate());
                        this.onSearchChange();
                    }}
                >
                    <div className={s.field}>
                        <div className={s.icon}>
                            <ClockIcon />
                        </div>
                        <div className={s.text}>When </div>
                    </div>
                </DateTimePicker>
                <div
                    className={s.button}
                    onClick={this.props.onCreateRide}
                >
                    <div className={s.icon}>
                        <AddIcon color="rgba(26, 27, 32, 0.5)" />
                    </div>
                    Create a ride
                </div>
                {this.renderRides()}
                {this.renderFooter()}
            </div>
        );
    },
}));
