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
import s from './my-rides.css';

const paginationParams = {
    limit: 10,
    offset: 0,
};

const model = {
    tree: {
        bookings: {},
        rideRequests: {},
        params: paginationParams,
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
    },

    componentDidMount() {
        const { history } = this.props;
        const bookings = this.props.tree.bookings.get();

        if (history.action === 'POP' && !_.isEmpty(bookings)) {
            return;
        }

        this.props.tree.params.set(paginationParams);
        this.loadBookings(paginationParams);
        this.loadRideRequests(paginationParams);
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
        let loadData = null;

        if (type === 'bookings') {
            cursor = this.props.tree.bookings;
            loadData = this.loadBookings;
        } else {
            cursor = this.props.tree.rideRequests;
            loadData = this.loadRideRequests;
        }

        const { limit, offset: prevOffset } = this.props.tree.params.get();
        const offset = prevOffset + limit;

        await this.props.tree.params.offset.set(offset);

        loadData(
            { limit, offset },
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
                    if (type === 'bookings') {
                        return (
                            <RideItem
                                key={`ride-booking-${index}`}
                                data={ride.ride}
                                history={this.props.history}
                                icon={<TravelerIcon color="#97B725" />}
                            />
                        );
                    }

                    return (
                        <RideRequestItem
                            key={`ride-booking-${index}`}
                            data={ride}
                            history={this.props.history}
                            icon={<TravelerIcon color="#97B725" />}
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
        const rideRequests = this.props.tree.rideRequests.get();

        return (
            <div className={s.container}>
                {this.renderRides('bookings')}
                {this.renderFooter('bookings')}
                {!_.isEmpty(rideRequests)
                    && rideRequests.status === 'Succeed'
                    && !_.isEmpty(rideRequests.data.results) ? (
                        <Title>
                            Your ride requests
                        </Title>
                    ) : null}
                {this.renderRides('rideRequests')}
                {this.renderFooter('rideRequests')}
            </div>
        );
    },
}));
