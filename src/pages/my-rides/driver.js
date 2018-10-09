import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { RideItem } from 'components';
import schema from 'libs/state';
import { Button, Icon } from 'antd-mobile';
import { DriverIcon } from 'components/icons';
import moment from 'moment';
import s from './my-rides.css';

const paginationParams = {
    limit: 10,
    offset: 0,
};

const model = {
    tree: {
        rides: {},
        calendarRides: {},
        params: paginationParams,
    },
};

export const MyRidesList = schema(model)(createReactClass({
    displayName: 'SearchPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getMyRidesListService: PropTypes.func.isRequired,
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
    },

    getDefaultProps() {
        return {
            monthRange: {},
        };
    },

    componentDidMount() {
        const { history } = this.props;
        const rides = this.props.tree.rides.get();

        if (!_.isEmpty(this.props.monthRange)) {
            this.loadRidesForCalendar();
        }

        if (history.action === 'POP' && !_.isEmpty(rides)) {
            return;
        }

        this.props.tree.params.set(paginationParams);
        this.loadRides(paginationParams);
    },

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.dateParams, this.props.dateParams)) {
            const { limit, offset } = this.props.tree.params.get();
            this.loadRides(_.merge({ limit, offset }, this.props.dateParams));
        }

        if (!_.isEqual(prevProps.monthRange, this.props.monthRange) && !_.isEmpty(this.props.monthRange)) {
            this.loadRidesForCalendar();
        }
    },

    async loadRidesForCalendar() {
        const { monthRange } = this.props;
        const { getMyRidesListService } = this.props.services;

        const cursor = this.props.tree.calendarRides;
        const result = await getMyRidesListService(cursor, _.merge({ limit: 100, offset: 0 }, monthRange));

        if (result.status === 'Succeed') {
            this.prepareCalendarData(result.data.results);
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

    prepareCalendarData(rides) {
        let data = {};

        _.forEach(rides, (ride) => {
            const { availableNumberOfSeats, numberOfSeats, dateTime } = ride;
            const date = moment(dateTime).format('YYYY-MM-DD');

            if (availableNumberOfSeats === numberOfSeats) {
                const path = [date, 'withoutBookings'];

                this.setValue(data, path);
            } else {
                const path = [date, 'withBookings'];

                this.setValue(data, path);
            }
        });

        this.props.setCalendarData(data);
    },

    async loadRides(params, dehydrateParams) {
        const { getMyRidesListService } = this.props.services;

        const cursor = this.props.tree.rides;
        await getMyRidesListService(cursor, params, dehydrateParams);
    },

    async loadMore() {
        const cursor = this.props.tree.rides;
        const { limit, offset: prevOffset } = this.props.tree.params.get();
        const offset = prevOffset + limit;

        await this.props.tree.params.offset.set(offset);

        this.loadRides(
            _.merge({ limit, offset }, this.props.dateParams),
            {
                toMerge: true,
                previousResults: cursor.data.get('results'),
            }
        );
    },

    getRideBadgeColor(ride) {
        const { availableNumberOfSeats, numberOfSeats, status } = ride;

        if (status === 'canceled') {
            return 'rgba(26, 27, 32, 0.3)';
        }

        if (availableNumberOfSeats === numberOfSeats) {
            return '#F5222D';
        }

        return '#97B725';
    },

    renderRides() {
        const cursor = this.props.tree.rides;
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
                {_.map(rides, (ride, index) => (
                    <RideItem
                        key={`ride-${index}`}
                        data={ride}
                        history={this.props.history}
                        authorType="driver"
                        icon={(
                            <DriverIcon
                                color={this.getRideBadgeColor(ride)}
                            />
                        )}
                    />
                ))}
            </div>
        );
    },

    renderFooter() {
        const rides = this.props.tree.rides.get();
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
                {this.renderRides()}
                {this.renderFooter()}
            </div>
        );
    },
}));
