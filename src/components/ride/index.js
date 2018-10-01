import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DriverIcon, TravelerIcon } from 'components/icons';
import s from './ride.css';

export class RideItem extends React.Component {
    renderRideAdditionalInfo() {
        const { data, authorType, userPk } = this.props;
        const { availableNumberOfSeats, numberOfSeats, bookings } = data;

        if (authorType === 'driver') {
            return (
                <span>
                    {`${numberOfSeats - availableNumberOfSeats}/${numberOfSeats} booked`}
                </span>
            );
        }

        if (authorType === 'passenger') {
            const { seatsCount } = _.filter(bookings, ({ client }) => client.pk === userPk)[0];

            return (
                <span>
                    {seatsCount}
                    {seatsCount === 1 ? ' seat' : ' seats'}
                    {' booked'}
                </span>
            );
        }

        return (
            <span>
                {`${availableNumberOfSeats}/${numberOfSeats}`}
                {availableNumberOfSeats === 1 ? ' seat' : ' seats'}
            </span>
        );
    }

    render() {
        const {
            data, history, icon, authorType,
        } = this.props;
        const {
            cityFrom, cityTo, pk, dateTime: date,
        } = data;

        const price = authorType === 'driver' ? data.price : data.priceWithFee;

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
                        {this.renderRideAdditionalInfo()}
                    </span>
                </div>
            </div>
        );
    }
}

RideItem.propTypes = {
    data: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    icon: PropTypes.node,
    authorType: PropTypes.string,
    userPk: PropTypes.string,
};

RideItem.defaultProps = {
    icon: <DriverIcon color="#40A9FF" />,
    authorType: '',
    userPk: null,
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
