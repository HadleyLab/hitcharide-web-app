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
import { Button, Icon, Modal } from 'antd-mobile';
import {
    MarkerIcon, ClockIcon, AddFilledIcon, ResetIcon,
} from 'components/icons';
import moment from 'moment';
import s from './search.css';

const paginationParams = {
    limit: 20,
    offset: 0,
};

const model = {
    tree: {
        rides: {},
        rideRequests: {},
        searchForm: {
            cityFrom: null,
            placeFrom: null,
            cityTo: null,
            placeTo: null,
            dateTime: null,
        },
        search: {},
        params: paginationParams,
    },
};

export const SearchPage = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        userType: PropTypes.string.isRequired,
        onCreateRide: PropTypes.func.isRequired,
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            getPlacesService: PropTypes.func.isRequired,
            getRidesListService: PropTypes.func.isRequired,
            getRideRequestsListService: PropTypes.func.isRequired,
        }).isRequired,
    },

    componentWillMount() {
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

            if (key === 'cityFrom' || key === 'cityTo' || key === 'placeFrom' || key === 'placeTo') {
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

    isFilterSet() {
        const form = this.props.tree.searchForm.get();

        return form.dateTime || form.cityFrom || form.placeFrom || form.cityTo || form.placeFrom;
    },

    resetFilters() {
        this.props.tree.searchForm.set({
            cityFrom: null,
            placeFrom: null,
            cityTo: null,
            placeTo: null,
            dateTime: null,
        });
        this.onSearchChange();
    },

    renderRides() {
        const token = this.props.tokenCursor.get();
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
                            preventRedirect={!token}
                            onClick={() => {
                                if (!token) {
                                    Modal.alert('Ride details', 'Log in to see more details', [
                                        { text: 'Cancel', onPress: () => null },
                                        {
                                            text: 'Log in',
                                            onPress: () => this.props.history.push('/account/login'),
                                        },
                                    ]);
                                }
                            }}
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
        const { services } = this.props;
        const searchCursor = this.props.tree.search;
        const formCursor = this.props.tree.searchForm;

        return (
            <div className={s.container}>
                <Title>
                    Search for a ride
                </Title>
                <Search
                    className={s.field}
                    tree={searchCursor}
                    services={services}
                    currentValue={{ city: formCursor.cityFrom.get(), place: formCursor.placeFrom.get() }}
                    onChange={({ city, place }) => {
                        formCursor.cityFrom.set(city);
                        formCursor.placeFrom.set(place);
                        this.onSearchChange();
                    }}
                    name="from"
                    color="#6FA6F8"
                >
                    <div className={s.icon}>
                        <MarkerIcon color="#6FA6F8" />
                    </div>
                    <div className={s.text}>From </div>
                </Search>
                <Search
                    className={s.field}
                    tree={searchCursor}
                    services={services}
                    currentValue={{ city: formCursor.cityTo.get(), place: formCursor.placeTo.get() }}
                    onChange={({ city, place }) => {
                        formCursor.cityTo.set(city);
                        formCursor.placeTo.set(place);
                        this.onSearchChange();
                    }}
                    name="to"
                    color="#97B725"
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
                        formCursor.dateTime.set(date);
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
                <div className={s.controls}>
                    <div
                        className={s.button}
                        onClick={this.props.onCreateRide}
                    >
                        <div className={s.icon}>
                            <AddFilledIcon />
                        </div>
                        Create a ride
                    </div>
                    {this.isFilterSet() ? (
                        <div
                            className={classNames(s.button, s._reset)}
                            onClick={this.resetFilters}
                        >
                            Reset filters
                            <div className={s.icon}>
                                <ResetIcon />
                            </div>
                        </div>
                    ) : null}
                </div>
                {this.renderRides()}
                {this.renderFooter()}
            </div>
        );
    },
}));
