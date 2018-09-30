import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { Calendar } from 'components';
import moment from 'moment';
import { MyRidesList } from './driver';
import { MyBookingsList } from './passenger';

const model = {
    tree: {
        dateTimeFrom: null,
        dateTimeTo: null,
    },
};

export const MyRidesPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        userType: PropTypes.string.isRequired,
    },

    componentDidUpdate(prevProps) {
        if (prevProps.userType !== this.props.userType) {
            this.calendar.resetDate();
        }
    },

    onDaySelect(date) {
        const dateTimeFrom = moment(date).startOf('day').utc().format();
        const dateTimeTo = moment(date).endOf('day').utc().format();

        this.props.tree.dateTimeFrom.set(dateTimeFrom);
        this.props.tree.dateTimeTo.set(dateTimeTo);
    },

    onDayUnselect() {
        this.props.tree.dateTimeFrom.set(null);
        this.props.tree.dateTimeTo.set(null);
    },

    renderRides() {
        const isDriver = this.props.userType === 'driver';
        const { dateTimeFrom, dateTimeTo } = this.props.tree.get();

        if (isDriver) {
            return (
                <MyRidesList
                    {...this.props}
                    tree={this.props.tree.select('createRide')}
                    dateParams={{ dateTimeFrom, dateTimeTo }}
                />
            );
        }

        return (
            <MyBookingsList
                {...this.props}
                tree={this.props.tree.select('suggestRide')}
                dateParams={{ dateTimeFrom, dateTimeTo }}
            />
        );
    },

    render() {
        return (
            <div>
                <Calendar
                    ref={(ref) => { this.calendar = ref; }}
                    onDaySelect={this.onDaySelect}
                    onDayUnselect={this.onDayUnselect}
                />
                {this.renderRides()}
            </div>
        );
    },
}));
