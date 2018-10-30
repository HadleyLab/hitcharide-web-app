import React from 'react';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { List, Picker } from 'antd-mobile';
import moment from 'moment';
import warningIcon from 'components/icons/warning.svg';
import { formatDate } from 'components/utils'
import s from './date-time-picker.css';

export const DateTimePicker = createReactClass({
    propTypes: {
        value: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        error: PropTypes.bool,
        onErrorClick: PropTypes.func,
        minuteStep: PropTypes.number,
        numberOfDays: PropTypes.number,
    },

    innerDateFormat: 'YYYY-MM-DD h m A',

    getDefaultProps() {
        return {
            value: null,
            className: null,
            minuteStep: 15,
            // From today + one week
            numberOfDays: 8,
        };
    },

    getInitialState() {
        return {
            options: this.formOptions(),
        };
    },

    formOptions() {
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
                _.range(2, this.props.numberOfDays),
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
        const minuteOptions = _.map(_.range(0, 60, this.props.minuteStep), formOption);
        const ampmOptions = _.map(['AM', 'PM'], formOption);
        return [
            dateOptions,
            hourOptions,
            minuteOptions,
            ampmOptions,
        ];
    },

    takeClosestMin(arr, value) {
        return _.last(_.takeWhile(arr, (x) => x <= value))
    },

    convertValueToDateStr(value) {
        if (_.isEmpty(value)) {
            return null;
        }

        return formatDate(moment(_.join(value, ' '), this.innerDateFormat));
    },

    convertDateStrToValue(dateStr) {
        if (!dateStr) {
            return null;
        }

        const [date, hour, minute, ampm] = _.split(moment(dateStr).format(this.innerDateFormat), ' ');
        const roundedMinute = _.toString(this.takeClosestMin(_.range(0, 60, this.props.minuteStep), minute));

        return [date, hour, roundedMinute, ampm];
    },

    onChange(value) {
        const { onChange } = this.props;
        const fullDate = this.convertValueToDateStr(value);

        onChange(fullDate);
    },

    formatLabel(labels) {
        const { error, onErrorClick } = this.props;

        if (_.isEmpty(labels)) {
            return '';
        }

        const [date, hour, minute, ampm] = labels;
        const paddedHour = _.padStart(hour, 2, '0');
        const paddedMinute = _.padStart(minute, 2, '0');

        const label = `${date} ${paddedHour}:${paddedMinute} ${ampm}`;

        return (
            <div className={s.label}>
                <div className={s.labelText}>
                    {label}
                </div>
                {error
                    ? (
                        <div
                            className={s.icon}
                            style={{ backgroundImage: `url(${warningIcon})` }}
                            onClick={onErrorClick}
                        />
                    ) : null}
            </div>
        );
    },

    render() {
        const {
            children, className, value, error,
        } = this.props;

        return (
            <List
                className={classNames(s.datePicker, className, {
                    [s._empty]: !value,
                    [s._error]: error,
                })}
                style={{ backgroundColor: 'white' }}
            >
                <Picker
                    cols={4}
                    prefixCls={classNames(s.amDatePicker, 'am-picker')}
                    title="When"
                    value={this.convertDateStrToValue(value)}
                    cascade={false}
                    data={this.state.options}
                    onChange={this.onChange}
                    format={this.formatLabel}
                >
                      <List.Item>
                          {children}
                      </List.Item>
                </Picker>
            </List>
        );
    },
});
