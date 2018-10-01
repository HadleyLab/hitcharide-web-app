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
        monthRange: {},
        calendarData: {},
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

    onMonthGenerate(rangeStart, rangeEnd) {
        this.props.tree.monthRange.set({
            dateTimeFrom: moment(rangeStart).utc().format(),
            dateTimeTo: moment(rangeEnd).utc().format(),
        });
    },

    setCalendarData(data) {
        this.props.tree.calendarData.set(data);
    },

    renderRides() {
        const isDriver = this.props.userType === 'driver';
        const { dateTimeFrom, dateTimeTo, monthRange } = this.props.tree.get();

        if (isDriver) {
            return (
                <MyRidesList
                    {...this.props}
                    tree={this.props.tree.select('createRide')}
                    dateParams={{ dateTimeFrom, dateTimeTo }}
                    monthRange={monthRange}
                    setCalendarData={this.setCalendarData}
                />
            );
        }

        return (
            <MyBookingsList
                {...this.props}
                tree={this.props.tree.select('suggestRide')}
                dateParams={{ dateTimeFrom, dateTimeTo }}
                monthRange={monthRange}
                setCalendarData={this.setCalendarData}
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
                    onMonthGenerate={this.onMonthGenerate}
                    data={this.props.tree.calendarData.get()}
                />
                {this.renderRides()}
            </div>
        );
    },
}));
