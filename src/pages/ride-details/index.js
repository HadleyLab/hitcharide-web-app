import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import {
    Title, Loader, StepperInput, Error,
} from 'components';
import moment from 'moment';
import { Button, Modal } from 'antd-mobile';
import { Link } from 'react-router-dom';
import passengerIcon from 'components/icons/passenger.svg';
import s from './ride-details.css';

const model = {
    ride: {},
    seatsCount: 1,
    bookingResult: {},
    bookingError: null,
};

export const RideDetailsPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        profile: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getRideService: PropTypes.func.isRequired,
            bookRideService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async componentDidMount() {
        const { getRideService } = this.props.services;
        const { pk } = this.props.match.params;
        this.props.tree.select('seatsCount').set(1);

        await getRideService(this.props.tree.ride, pk);
    },

    bookRide() {
        const ride = this.props.tree.ride.get();
        const seatsCount = this.props.tree.seatsCount.get();
        const {
            cityFrom, cityTo, priceWithFee, dateTime,
        } = ride.data;

        const message = 'You are booking a ride '
            + `from ${cityFrom.name}, ${cityFrom.state.name} `
            + `to ${cityTo.name}, ${cityTo.state.name} `
            + `on ${moment(dateTime).format('MMM D YYYY')} `
            + `at ${moment(dateTime).format('h:mm A')} `
            + `${seatsCount} ${seatsCount === 1 ? 'seat' : 'seats'} `
            + `priced at ${parseFloat(priceWithFee * seatsCount).toString()}$ per seat. `
            + 'Are you sure?';

        Modal.alert('Check a ride', message, [
            { text: 'Cancel' },
            {
                text: 'OK',
                onPress: async () => {
                    const { pk } = this.props.match.params;
                    const { bookRideService, getRideService } = this.props.services;

                    const result = await bookRideService(this.props.tree.bookingResult, {
                        ride: pk,
                        seatsCount,
                    });

                    if (result.status === 'Failure') {
                        let error = '';

                        _.forEach(result.error.data, (item) => { error += item; });

                        this.props.tree.bookingError.set(error);
                    } else {
                        this.props.tree.bookingError.set(null);
                    }

                    if (result.status === 'Succeed') {
                        this.props.tree.bookingError.set(null);

                        await getRideService(this.props.tree.ride, pk);
                    }
                },
            },
        ]);
    },

    renderRideInfo() {
        const ride = this.props.tree.ride.get();
        const { profile } = this.props;
        const {
            cityFrom, cityTo, price, priceWithFee, dateTime,
            stops, numberOfSeats, availableNumberOfSeats, car,
        } = ride.data;
        const amIDriver = profile.pk === car.owner.pk;

        const rows = [
            {
                title: 'From',
                content: `${cityFrom.name}, ${cityFrom.state.name}`,
            },
            ..._.map(stops, ({ city }) => ({
                title: 'Stop over',
                content: `${city.name}, ${city.state.name}`,
            })),
            {
                title: 'To',
                content: `${cityTo.name}, ${cityTo.state.name}`,
            },
            {
                title: 'Departure date',
                content: moment(dateTime).format('MMM D YYYY'),
            },
            {
                title: 'Departure time',
                content: moment(dateTime).format('h:mm A'),
            },
            {
                title: 'Free seats',
                content: (
                    <div className={s.seats}>
                        {_.map(_.range(0, numberOfSeats), (seat, index) => (
                            <div
                                key={`seat-${index}`}
                                style={{ backgroundImage: `url(${passengerIcon})` }}
                                className={classNames(s.seat, {
                                    [s._reserved]: (index + 1) > availableNumberOfSeats,
                                })}
                            />
                        ))}
                    </div>
                ),
            },
            {
                title: 'Price for seat',
                content: `$ ${parseFloat(amIDriver ? price : priceWithFee).toString()}`,
            },
        ];

        return _.map(rows, (row, index) => (
            <div className={s.row} key={`ride-row-${index}`}>
                <span className={s.rowTitle}>{row.title}</span>
                <span className={s.rowContent}>{row.content}</span>
            </div>
        ));
    },

    renderNotes() {
        const ride = this.props.tree.ride.get();
        const { description } = ride.data;

        return (
            <div className={classNames(s.row, s._notes)}>
                {description}
            </div>
        );
    },

    renderDriverInfo() {
        const { profile } = this.props;
        const ride = this.props.tree.ride.get();
        const { car } = ride.data;
        const isMe = profile.pk === car.owner.pk;

        const rows = [
            {
                title: 'Car',
                content: `${car.brand} ${car.model} (${car.color})`,
            },
            {
                title: 'Driver',
                content: (
                    <div>
                        <span className={s.you}>{isMe ? '(You) ' : null}</span>
                        <Link to={`/app/user/${car.owner.pk}`} className={s.link}>
                            {`${car.owner.firstName} ${car.owner.lastName}`}
                        </Link>
                    </div>
                ),
            },
        ];

        return _.map(rows, (row, index) => (
            <div className={s.row} key={`ride-row-driver-${index}`}>
                <span className={s.rowTitle}>{row.title}</span>
                <span className={s.rowContent}>{row.content}</span>
            </div>
        ));
    },

    renderBookings() {
        const { profile } = this.props;
        const ride = this.props.tree.ride.get();
        const { bookings } = ride.data;

        if (!bookings.length) {
            return (
                <div className={classNames(s.row, s._notes)}>
                    No passengers yet
                </div>
            );
        }

        return _.map(bookings, ({ client, seatsCount }, index) => (
            <div className={s.row} key={`ride-row-booking-${index}`}>
                <span className={s.rowTitle}>Passenger</span>
                <span className={s.rowContent}>
                    <span className={s.you}>{profile.pk === client.pk ? '(You) ' : null}</span>
                    <Link to={`/app/user/${client.pk}`} className={s.link}>
                        {`${client.firstName} ${client.lastName}`}
                        {seatsCount > 1 ? ` +${seatsCount - 1}` : null}
                    </Link>
                </span>
            </div>
        ));
    },

    renderNumberOfSeats() {
        const tree = this.props.tree.get();
        const { availableNumberOfSeats } = tree.ride.data;

        return (
            <StepperInput
                title="Number of seats"
                cursor={this.props.tree.select('seatsCount')}
                minValue={1}
                maxValue={availableNumberOfSeats}
            />
        );
    },

    renderFooter() {
        const tree = this.props.tree.get();
        const { profile } = this.props;
        const ride = this.props.tree.ride.get();
        const { car } = ride.data;
        const amIDriver = profile.pk === car.owner.pk;
        const { bookings } = ride.data;
        const amIClient = _.findIndex(bookings, ({ client }) => client.pk === profile.pk) !== -1;

        if (amIDriver || amIClient) {
            return null;
        }

        return (
            <div>
                <Title className={s.title}>Number of reserved seats</Title>
                {tree && tree.seatsCount ? this.renderNumberOfSeats() : null}
                <div className={s.footer}>
                    {tree && tree.bookingError ? (
                        <Error>
                            {tree.bookingError}
                        </Error>
                    ) : null}
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.bookRide}
                    >
                        Book it
                    </Button>
                </div>
            </div>
        );
    },

    render() {
        const tree = this.props.tree.get();
        const isRideLoaded = tree && tree.ride && tree.ride.status === 'Succeed';

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded ? (
                    <div className={s.container}>
                        <Title className={s.title}>Trip information</Title>
                        {this.renderRideInfo()}
                        <Title className={s.title}>Notes</Title>
                        {this.renderNotes()}
                        <Title className={s.title}>Driver information</Title>
                        {this.renderDriverInfo()}
                        <Title className={s.title}>Passengers</Title>
                        {this.renderBookings()}
                        {this.renderFooter()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
