import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DriverIcon, TravelerIcon } from 'components/icons';
import s from './ride.css';

export const RideItem = ({
    data, history, icon, isMyRide,
}) => {
    const {
        cityFrom, cityTo, availableNumberOfSeats,
        price, pk, dateTime: date, numberOfSeats,
    } = data;

    return (
        <div
            className={s.ride}
            onClick={() => history.push(`/app/ride/${pk}`)}
        >
            <div className={s.userTypeIcon}>{icon}</div>
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
                    {isMyRide ? (
                        <span>
                            {`${numberOfSeats - availableNumberOfSeats}/${numberOfSeats} booked`}
                        </span>
                    ) : (
                        <span>
                            {`${availableNumberOfSeats}/${numberOfSeats}`}
                            {availableNumberOfSeats === 1 ? ' seat' : ' seats'}
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

RideItem.propTypes = {
    data: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    icon: PropTypes.node,
    isMyRide: PropTypes.bool,
};

RideItem.defaultProps = {
    icon: <DriverIcon color="#40A9FF" />,
    isMyRide: false,
};

export const RideRequestItem = ({ data, history, icon }) => {
    const {
        cityFrom, cityTo, dateTime: date, pk,
    } = data;

    return (
        <div
            className={s.ride}
            onClick={() => history.push(`/app/request/${pk}`)}
        >
            <div className={s.userTypeIcon}>{icon}</div>
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
    icon: PropTypes.node,
};

RideRequestItem.defaultProps = {
    icon: <TravelerIcon color="#40A9FF" />,
};
