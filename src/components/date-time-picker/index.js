import React from 'react';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { List, DatePicker } from 'antd-mobile';
import moment from 'moment';
import s from './date-time-picker.css';

export const DateTimePicker = createReactClass({
    propTypes: {
        value: PropTypes.instanceOf(Date),
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
    },

    getDefaultProps() {
        return {
            value: null,
            className: null,
        };
    },

    render() {
        const {
            value, onChange, children, className,
        } = this.props;

        return (
            <List
                className={classNames(s.datePicker, className, {
                    [s._empty]: !value,
                })}
                style={{ backgroundColor: 'white' }}
            >
                <DatePicker
                    value={value}
                    onChange={onChange}
                    use12Hours
                    title="When"
                    minDate={moment().toDate()}
                    format={(date) => {
                        const today = moment();
                        const tomorrow = moment().add(1, 'days');
                        const isToday = moment(date).isSame(today, 'day');
                        const isTomorrow = moment(date).isSame(tomorrow, 'day');

                        if (isToday) {
                            return `Today ${moment(date).format('h:mm A')}`;
                        }

                        if (isTomorrow) {
                            return `Tomorrow ${moment(date).format('h:mm A')}`;
                        }

                        return moment(date).format('MMM D h:mm A');
                    }}
                >
                    <List.Item>
                        {children}
                    </List.Item>
                </DatePicker>
            </List>
        );
    },
});
