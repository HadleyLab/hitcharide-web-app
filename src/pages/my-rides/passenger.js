import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { RideRequestItem, RideItem, Title } from 'components';
import schema from 'libs/state';
import { Button, Icon } from 'antd-mobile';
import { TravelerIcon } from 'components/icons';
import moment from 'moment';
import s from './my-rides.css';

const paginationParams = {
    limit: 10,
    offset: 0,
};

const model = {
    tree: {
        bookings: {},
        rideRequests: {},
        calendarBookings: {},
        calendarRideRequests: {},
        bookingsParams: paginationParams,
        rideRequestsParams: paginationParams,
    },
};

export const MyBookingsList = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getMyBookingsListService: PropTypes.func.isRequired,
            getMyRideRequestsListService: PropTypes.func.isRequired,
        }).isRequired,
        dateParams: PropTypes.shape({
            dateTimeFrom: PropTypes.string,
            dateTimeTo: PropTypes.string,
        }).isRequired,
        monthRange: PropTypes.shape({
            dateTimeFrom: PropTypes.string,
            dateTimeTo: PropTypes.string,
        }),
        setCalendarData: PropTypes.func.isRequired,
        userPk: PropTypes.string.isRequired,
    },

    getDefaultProps() {
        return {
            monthRange: {},
        };
    },

    componentDidMount() {
        const { history } = this.props;
        const { bookings, rideRequests } = this.props.tree.get();

        if (!_.isEmpty(this.props.monthRange)) {
            this.loadRidesForCalendar();
        }

        if (history.action === 'POP' && !_.isEmpty(bookings) && !_.isEmpty(rideRequests)) {
            return;
        }

        this.resetParams();
        this.loadBookings(paginationParams);
        this.loadRideRequests(paginationParams);
    },

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.dateParams, this.props.dateParams)) {
            const { dateParams } = this.props;
            const bookingsParams = this.props.tree.bookingsParams.get();
            const rideRequestsParams = this.props.tree.rideRequestsParams.get();

            this.loadBookings(_.merge({}, _.pick(bookingsParams, ['limit', 'offset']), dateParams));
            this.loadRideRequests(_.merge({}, _.pick(rideRequestsParams, ['limit', 'offset']), dateParams));
        }

        if (!_.isEqual(prevProps.monthRange, this.props.monthRange) && !_.isEmpty(this.props.monthRange)) {
            this.loadRidesForCalendar();
        }
    },

    async loadRidesForCalendar() {
        const { monthRange } = this.props;
        const { getMyBookingsListService, getMyRideRequestsListService } = this.props.services;

        const bookingsCursor = this.props.tree.calendarBookings;
        const rideRequestsCursor = this.props.tree.calendarRideRequests;

        const bookingsResult = await getMyBookingsListService(bookingsCursor,
            _.merge({ limit: 100, offset: 0 }, monthRange));
        const rideRequestsResult = await getMyRideRequestsListService(rideRequestsCursor,
            _.merge({ limit: 100, offset: 0 }, monthRange));

        if (bookingsResult.status === 'Succeed' && rideRequestsResult.status === 'Succeed') {
            this.prepareCalendarData(bookingsResult.data.results, rideRequestsResult.data.results);
        }
    },

    setValue(data, path) {
        const value = _.get(data, path);

        if (value) {
            _.set(data, path, value + 1);
        } else {
            _.set(data, path, 1);
        }
    },

    prepareCalendarData(bookings, rideRequests) {
        let data = {};

        _.forEach(bookings, ({ ride }) => {
            const { dateTime } = ride;
            const date = moment(dateTime).format('YYYY-MM-DD');
            const path = [date, 'withBookings'];

            this.setValue(data, path);
        });

        _.forEach(rideRequests, (ride) => {
            const { dateTime } = ride;
            const date = moment(dateTime).format('YYYY-MM-DD');
            const path = [date, 'withoutBookings'];

            this.setValue(data, path);
        });

        this.props.setCalendarData(data);
    },

    resetParams() {
        this.props.tree.bookingsParams.set(paginationParams);
        this.props.tree.rideRequestsParams.set(paginationParams);
    },

    async loadBookings(params, dehydrateParams) {
        const { getMyBookingsListService } = this.props.services;

        const cursor = this.props.tree.bookings;
        await getMyBookingsListService(cursor, params, dehydrateParams);
    },

    async loadRideRequests(params, dehydrateParams) {
        const { getMyRideRequestsListService } = this.props.services;

        const cursor = this.props.tree.rideRequests;
        await getMyRideRequestsListService(cursor, params, dehydrateParams);
    },

    async loadMore(type) {
        let cursor = null;
        let paramsCursor = null;
        let loadData = null;

        if (type === 'bookings') {
            cursor = this.props.tree.bookings;
            paramsCursor = this.props.tree.bookingsParams;
            loadData = this.loadBookings;
        } else {
            cursor = this.props.tree.rideRequests;
            paramsCursor = this.props.tree.rideRequestsParams;
            loadData = this.loadRideRequests;
        }

        const { limit, offset: prevOffset } = paramsCursor.get();
        const offset = prevOffset + limit;

        await paramsCursor.offset.set(offset);

        loadData(
            _.merge({ limit, offset }, this.props.dateParams),
            {
                toMerge: true,
                previousResults: cursor.data.get('results'),
            }
        );
    },

    renderRides(type) {
        let cursor = null;

        if (type === 'bookings') {
            cursor = this.props.tree.bookings;
        } else {
            cursor = this.props.tree.rideRequests;
        }

        const ridesData = cursor.get() || {};
        const { data, status } = ridesData;

        if (_.isEmpty(ridesData) || !data || status !== 'Succeed') {
            return null;
        }

        const { results: rides, next } = data;

        if (rides.length === 0) {
            return (
                <div className={s.noResults}>
                    {`No ${type === 'bookings' ? 'bookings' : 'ride requests'} found`}
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
                    if (type === 'bookings') {
                        return (
                            <RideItem
                                key={`ride-booking-${index}`}
                                data={ride.ride}
                                history={this.props.history}
                                authorType="passenger"
                                userPk={this.props.userPk}
                                icon={<TravelerIcon color="#97B725" />}
                            />
                        );
                    }

                    return (
                        <RideRequestItem
                            key={`ride-request-${index}`}
                            data={ride}
                            history={this.props.history}
                            icon={<TravelerIcon color="#F5222D" />}
                        />
                    );
                })}
            </div>
        );
    },

    renderFooter(type) {
        let cursor = null;

        if (type === 'bookings') {
            cursor = this.props.tree.bookings;
        } else {
            cursor = this.props.tree.rideRequests;
        }

        const rides = cursor.get();
        const ridesData = rides || {};

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
                        onClick={() => this.loadMore(type)}
                    >
                        Load more
                    </Button>
                </div>
            );
        }

        return null;
    },

    render() {
        return (
            <div className={s.container}>
                {this.renderRides('bookings')}
                {this.renderFooter('bookings')}
                <Title>
                    Your ride requests
                </Title>
                {this.renderRides('rideRequests')}
                {this.renderFooter('rideRequests')}
            </div>
        );
    },
}));
