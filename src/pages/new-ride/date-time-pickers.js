import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import { Title } from 'components';
import moment from 'moment';
import { List, DatePicker } from 'antd-mobile';
import { checkInputError } from 'components/utils';
import warningIcon from 'components/icons/warning.svg';
import s from './new-ride.css';

export const DateTimePickers = createReactClass({
    propTypes: {
        formCursor: BaobabPropTypes.cursor.isRequired,
        errorsCursor: BaobabPropTypes.cursor.isRequired,
    },

    renderDateTimeError() {
        const { errorsCursor } = this.props;
        const errors = checkInputError('dateTime', errorsCursor.get());

        if (!errors.error) {
            return null;
        }

        return (
            <div
                className={s.warning}
                style={{ backgroundImage: `url(${warningIcon})` }}
                onClick={errors.onErrorClick}
            />
        );
    },

    render() {
        const { formCursor, errorsCursor } = this.props;

        return (
            <div className={classNames(s.section, s.departure)}>
                <Title>
                    Departure
                </Title>
                {this.renderDateTimeError()}
                <List className={s.datePicker} style={{ backgroundColor: 'white' }}>
                    <DatePicker
                        value={formCursor.dateTime.get()}
                        onChange={(date) => {
                            errorsCursor.dateTime.set(null);
                            const year = moment(date).year();
                            const month = moment(date).month();
                            const day = moment(date).date();
                            const curDate = formCursor.dateTime.get();
                            const newDate = moment(curDate).year(year).month(month).date(day);

                            formCursor.dateTime.set(newDate.toDate());
                        }}
                        mode="date"
                        use12Hours
                        title="Departure date"
                        minDate={moment().toDate()}
                        format={(date) => moment(date).format('MMM D YYYY')}
                    >
                        <List.Item>Departure date</List.Item>
                    </DatePicker>
                    <DatePicker
                        value={formCursor.dateTime.get()}
                        onChange={(time) => {
                            errorsCursor.dateTime.set(null);
                            const hour = moment(time).hour();
                            const minutes = moment(time).minutes();
                            const curDate = formCursor.dateTime.get();
                            const date = moment(curDate).hour(hour).minutes(minutes);

                            formCursor.dateTime.set(date.toDate());
                        }}
                        mode="time"
                        format={(date) => moment(date).format('h:mm A')}
                        minuteStep={5}
                        use12Hours
                        title="Departure time"
                    >
                        <List.Item>
                            Departure time
                        </List.Item>
                    </DatePicker>
                </List>
            </div>
        );
    },
});
