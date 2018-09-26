import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DriverIcon, TravelerIcon } from 'components/icons';
import s from './ride.css';

export const RideItem = ({ data, history }) => {
    const {
        cityFrom, cityTo, dateTime: date, availableNumberOfSeats, price, pk,
    } = data;

    return (
        <div
            className={s.ride}
            onClick={() => history.push(`/app/ride/${pk}`)}
        >
            <div className={s.userTypeIcon}>
                <DriverIcon color="#40A9FF" />
            </div>
            <div className={s.date}>
                <div style={{ whiteSpace: 'nowrap' }}>{moment(date).format('h:mm A')}</div>
                <div className={s.gray}>{moment(date).format('MMM D')}</div>
            </div>
            <div className={s.direction}>
                {`${cityFrom.name}, ${cityFrom.state.name}`}
                <span className={s.gray}>{`${cityTo.name}, ${cityTo.state.name}`}</span>
            </div>
            <div className={s.info}>
                <span style={{ whiteSpace: 'nowrap' }}>$ {parseFloat(price).toString()}</span>
                <span className={s.gray}>
                    {availableNumberOfSeats}
                    {availableNumberOfSeats === 1 ? ' seat' : ' seats'}
                </span>
            </div>
        </div>
    );
};

RideItem.propTypes = {
    data: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
};

export const RideRequestItem = ({ data, history }) => {
    const {
        cityFrom, cityTo, dateTime: date, pk,
    } = data;

    return (
        <div
            className={s.ride}
            onClick={() => history.push(`/app/request/${pk}`)}
        >
            <div className={s.userTypeIcon}>
                <TravelerIcon color="#40A9FF" />
            </div>
            <div className={s.date}>
                <div style={{ whiteSpace: 'nowrap' }}>{moment(date).format('h:mm A')}</div>
                <div className={s.gray}>{moment(date).format('MMM D')}</div>
            </div>
            <div className={s.direction}>
                {`${cityFrom.name}, ${cityFrom.state.name}`}
                <span className={s.gray}>{`${cityTo.name}, ${cityTo.state.name}`}</span>
            </div>
        </div>
    );
};

RideRequestItem.propTypes = {
    data: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
};
