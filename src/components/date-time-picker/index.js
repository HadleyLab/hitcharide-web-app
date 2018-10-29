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
            {
                label: 'Tomorrow',
                value: moment().add(1, 'days').format('YYYY-MM-DD'),
            },

            ..._.map(
                _.range(2, 7),
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

    convertValueToDate(value) {
        if (_.isEmpty(value)) {
            return null;
        }
        const [date, hour, minute, ampm] = value;

        return moment(`${date} ${hour}:${minute} ${ampm}`, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm:ssZZ');
    },

    convertDateToValue(date) {
        if (!date) {
            return null;
        }

        return _.split(moment(date).format('YYYY-MM-DD h m A'), ' ');
    },

     onPickerChange(selected) {
        console.log('selecte',selected);
        this.setState({
            options: this.formOptions(selected),
        });
    },

    onChange(value) {
        const { onChange } = this.props;
        const fullDate = this.convertValueToDate(value);

        onChange(fullDate);
    },

    formatLabel(labels) {
        if (_.isEmpty(labels)) {
            return '';
        }

        const [date, hour, minute, ampm] = labels;
        const paddedHour = _.padStart(hour, 2, '0');
        const paddedMinute = _.padStart(minute, 2, '0');

        return `${date} ${paddedHour}:${paddedMinute} ${ampm}`;
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
                    cols={4}
                    prefixCls={classNames(s.amDatePicker, 'am-picker')}
                    title="When"
                    value={this.convertDateToValue(value)}
                    cascade={false}
                    data={this.state.options}
                    onPickerChange={this.onPickerChange}
                    onChange={this.onChange}
                    format={this.formatLabel}
                >
                      <List.Item>{children}</List.Item>
                </Picker>
            </List>
        );
    },
});
