import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import s from './calendar.css';

class ArrowButton extends React.Component {
    constructor(props) {
        super(props);
        this.highlightArrow = this.highlightArrow.bind(this);
        this.state = {
            active: false,
        };
    }

    highlightArrow() {
        this.setState({ active: true });
        this.props.onClick();

        setTimeout(() => this.setState({ active: false }), 100);
    }

    render() {
        const { active } = this.state;
        const { className } = this.props;

        return (
            <div
                className={classNames(className, {
                    [s._active]: active,
                })}
                onClick={this.highlightArrow}
            />
        );
    }
}

ArrowButton.propTypes = {
    className: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.onDayClick = this.onDayClick.bind(this);
        this.onNextMonthClick = this.onNextMonthClick.bind(this);
        this.onPrevMonthClick = this.onPrevMonthClick.bind(this);
        this.state = {
            activeDate: moment(),
            currentMonth: moment(),
            calendarMonthData: this.generateMonth(moment()),
        };
    }

    generateMonth(date) {
        const monthStart = moment(date).startOf('month');
        const monthEnd = moment(date).endOf('month');
        const rangeStart = moment(monthStart).startOf('week');
        const rangeEnd = moment(monthEnd).endOf('week');

        let data = [];
        let day = rangeStart;

        do {
            const weekNumber = day.week();
            let week = {
                week: weekNumber,
                days: [],
            };

            do {
                week.days.push(moment(day));

                day = day.add(1, 'days');
            } while (weekNumber === day.week());

            data.push(week);
        } while (!day.isAfter(rangeEnd, 'day'));

        return data;
    }

    onDayClick(activeDate) {
        this.setState({ activeDate });
    }

    onNextMonthClick() {
        const { currentMonth } = this.state;
        const newMonth = currentMonth.add(1, 'month');

        this.setState({
            currentMonth: newMonth,
            calendarMonthData: this.generateMonth(newMonth),
        });
    }

    onPrevMonthClick() {
        const { currentMonth } = this.state;
        const newMonth = currentMonth.subtract(1, 'month');

        this.setState({
            currentMonth: newMonth,
            calendarMonthData: this.generateMonth(newMonth),
        });
    }

    render() {
        const { activeDate, currentMonth, calendarMonthData } = this.state;
        const weekdays = moment.weekdaysShort();

        return (
            <div className={s.calendar}>
                <div className={s.month}>
                    <ArrowButton
                        className={classNames(s.arrow, s._prev)}
                        onClick={this.onPrevMonthClick}
                    />
                    {currentMonth.format('MMMM YYYY')}
                    <ArrowButton
                        className={classNames(s.arrow, s._next)}
                        onClick={this.onNextMonthClick}
                    />
                </div>
                <div className={s.weekdays}>
                    {_.map(weekdays, (weekday, index) => (
                        <div className={s.weekday} key={`weekday-${index}`}>
                            {weekday}
                        </div>
                    ))}
                </div>
                {_.map(calendarMonthData, (week, weekIndex) => (
                    <div className={s.week} key={`week-${weekIndex}`}>
                        {_.map(week.days, (day, dayIndex) => {
                            const isCurrentMonth = day.isSame(currentMonth, 'month');

                            return (
                                <div
                                    key={`week-${weekIndex}-${dayIndex}`}
                                    className={classNames(s.weekday, {
                                        [s._otherMonth]: !isCurrentMonth,
                                        [s._today]: day.isSame(moment(), 'day'),
                                        [s._active]: day.isSame(activeDate, 'day'),
                                    })}
                                    onClick={() => {
                                        if (!isCurrentMonth) {
                                            return;
                                        }

                                        this.onDayClick(day);
                                    }}
                                >
                                    {moment(day).format('D')}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }
}

Calendar.propTypes = {};

Calendar.defaultProps = {};
