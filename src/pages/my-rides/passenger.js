import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { RideRequestItem, RideItem } from 'components';
import schema from 'libs/state';
import { Button, Icon } from 'antd-mobile';
import s from './my-rides.css';

const paginationParams = {
    limit: 20,
    offset: 0,
};

const model = {
    tree: {
        bookings: {},
        params: paginationParams,
    },
};

export const MyBookingsList = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getMyBookingsListService: PropTypes.func.isRequired,
        }),
    },

    componentDidMount() {
        const { history } = this.props;
        const bookings = this.props.tree.bookings.get();

        if (history.action === 'POP' && !_.isEmpty(bookings)) {
            return;
        }

        this.props.tree.params.set(paginationParams);
        this.loadBookings(paginationParams);
    },

    async loadBookings(params, dehydrateParams) {
        const { getMyBookingsListService } = this.context.services;

        const cursor = this.props.tree.bookings;
        await getMyBookingsListService(cursor, params, dehydrateParams);
    },

    async loadMore() {
        const cursor = this.props.tree.bookings;
        const { limit, offset: prevOffset } = this.props.tree.params.get();
        const offset = prevOffset + limit;

        await this.props.tree.params.offset.set(offset);

        this.loadBookings(
            { limit, offset },
            {
                toMerge: true,
                previousResults: cursor.data.get('results'),
            }
        );
    },

    renderBookings() {
        const cursor = this.props.tree.bookings;
        const bookingsData = cursor.get() || {};
        const { data, status } = bookingsData;

        if (_.isEmpty(bookingsData) || !data || status !== 'Succeed') {
            return null;
        }

        const { results: bookings, next } = data;

        if (bookings.length === 0) {
            return (
                <div className={s.noResults}>
                    No bookings found
                </div>
            );
        }

        return (
            <div
                className={classNames(s.rides, {
                    [s._withLast]: !next,
                })}
            >
                {_.map(bookings, (ride, index) => (
                    <RideItem
                        key={`ride-booking-${index}`}
                        data={ride.ride}
                        history={this.props.history}
                    />
                ))}
            </div>
        );
    },

    renderFooter() {
        const bookings = this.props.tree.bookings.get();
        const bookingsData = bookings || {};

        if (_.isEmpty(bookingsData)) {
            return null;
        }

        const { data, status } = bookingsData;

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
        return (
            <div className={s.container}>
                {this.renderBookings()}
                {this.renderFooter()}
            </div>
        );
    },
}));
