import React from 'react';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { List, Picker } from 'antd-mobile';
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

    getInitialState() {
        return {
            options: this.formOptions(),
        };
    },

    formOptions(selected) {
        const formOption = (x) => ({ label: _.toString(x), value: _.toString(x) });
        const dateOptions = [
            {
                label: 'Today',
                value: moment().format('YYYY-MM-DD'),
            },
            ..._.map(
                _.range(1, 7),
                (i) => {
                    const date = moment().add(i, 'days');
                    return {
                        label: date.format('ddd D MMM'),
                        value: date.format('YYYY-MM-DD')
                    }
                }
            )
        ];

        const hourOptions = _.map(
            _.concat([12], _.range(1, 12)),
            formOption
        );
        const minuteOptions = _.map(_.range(0, 60, 15), formOption);
        const ampmOptions = _.map(['AM', 'PM'], formOption);
        return [
            dateOptions,
            hourOptions,
            minuteOptions,
            ampmOptions,
        ];
    },

    onPickerChange(selected) {
        console.log('selecte',selected);
        this.setState({
            options: this.formOptions(selected),
        });
    },

    convertValueToDate(value) {
        if (_.isEmpty(value)) {
            return null;
        }
        const [date, hour, minute, ampm] = value;

        return moment(`${date} ${hour}:${minute} ${ampm}`, 'YYYY-MM-DD h:m A').format('YYYY-MM-DDTHH:mm:ssZZ');
    },

    convertDateToValue(date) {
        if (!date) {
            return null;
        }

        return _.split(moment(date).format('YYYY-MM-DD h m A'), ' ');
    },

    onChange(value) {
        const { onChange } = this.props;
        const fullDate = this.convertValueToDate(value);

        onChange(fullDate);
    },

    render() {
        const {
            children, className, value,
        } = this.props;

        return (
            <List
                className={classNames(s.datePicker, className, {
                    [s._empty]: !value,
                })}
                style={{ backgroundColor: 'white' }}
            >
                <Picker
                    title="When"
                    value={this.convertDateToValue(value)}
                    cascade={false}
                    data={this.state.options}
                    onChange={this.onChange}
                    format={() => {
                        const fullDate = value;

                        if (!fullDate) {
                            return '';
                        }

                        const today = moment();
                        const tomorrow = moment().add(1, 'days');
                        const isToday = moment(fullDate).isSame(today, 'day');
                        const isTomorrow = moment(fullDate).isSame(tomorrow, 'day');

                        if (isToday) {
                            return `Today ${moment(fullDate).format('h:mm A')}`;
                        }

                        if (isTomorrow) {
                            return `Tomorrow ${moment(fullDate).format('h:mm A')}`;
                        }

                        return moment(fullDate).format('MMM D h:mm A');
                    }}
                >
                      <List.Item>{children}</List.Item>
                </Picker>
            </List>
        );
    },
});
