import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import { Title, Loader, StepperInput } from 'components';
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
        history: PropTypes.shape().isRequired,
    },

    async componentDidMount() {
        const { tree, history, match } = this.props;
        const { getRideService } = this.props.services;
        tree.select('seatsCount').set(1);

        if (history.action === 'POP' && !_.isEmpty(tree.ride.get())) {
            return;
        }

        await getRideService(tree.ride, match.params.pk);
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

    checkIfIAmDriver() {
        const { profile } = this.props;
        const ride = this.props.tree.ride.get();
        const { car } = ride.data;
        const amIDriver = profile.pk === car.owner.pk;

        return amIDriver;
    },

    checkIfIAmPassenger() {
        const { profile } = this.props;
        const ride = this.props.tree.ride.get();
        const { bookings } = ride.data;
        const amIPassenger = _.findIndex(bookings, ({ client }) => client.pk === profile.pk) !== -1;

        return amIPassenger;
    },

    getPageTitle() {
        const amIDriver = this.checkIfIAmDriver();
        const amIPassenger = this.checkIfIAmPassenger();

        if (amIDriver) {
            return 'Your trip';
        }

        if (amIPassenger) {
            return 'Booked trip';
        }

        return 'Trip information';
    },

    renderRideInfo() {
        const ride = this.props.tree.ride.get();
        const {
            cityFrom, cityTo, price, priceWithFee, dateTime,
            stops, numberOfSeats, availableNumberOfSeats,
        } = ride.data;
        const amIDriver = this.checkIfIAmDriver();

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
        const amIDriver = this.checkIfIAmDriver();
        const amIPassenger = this.checkIfIAmPassenger();
        const { ride } = tree;

        if (amIPassenger) {
            return (
                <div className={classNames(s.footer, s._passenger)}>
                    <Button
                        type="primary"
                        inline
                        onClick={() => {
                            Modal.alert('Refuse trip', 'Do you really want to refuse this trip? '
                                + 'The money will be returned to your PayPal account.', [
                                {
                                    text: 'YES',
                                    onPress: () => this.props.history.push(`/app/cancel-ride/${ride.data.pk}/refuse`),
                                    style: { color: '#4263CA' },
                                },
                                {
                                    text: 'NO',
                                    onPress: () => {},
                                    style: { color: '#4263CA' },
                                },
                            ]);
                        }}
                    >
                        Refuse trip
                    </Button>
                    <Button
                        type="ghost"
                        inline
                        onClick={() => {}}
                    >
                        Complain
                    </Button>
                </div>
            );
        }

        if (amIDriver) {
            return (
                <div className={s.footer}>
                    <Button
                        type="ghost"
                        inline
                        onClick={() => {
                            Modal.alert('Delete trip', 'Do you really want to delete this trip?', [
                                {
                                    text: 'YES',
                                    onPress: () => this.props.history.push(`/app/cancel-ride/${ride.data.pk}/delete`),
                                    style: { color: '#4263CA' },
                                },
                                {
                                    text: 'NO',
                                    onPress: () => {},
                                    style: { color: '#4263CA' },
                                },
                            ]);
                        }}
                    >
                        Delete trip
                    </Button>
                </div>
            );
        }

        return (
            <div>
                <Title className={s.title}>Number of reserved seats</Title>
                {tree && tree.seatsCount ? this.renderNumberOfSeats() : null}
                <div className={s.footer}>
                    {/*
                    {tree && tree.bookingError ? (
                        <Error>
                            {tree.bookingError}
                        </Error>
                    ) : null}
                    */}
                    <div className={s.warningText}>
                        You can cancel the trip
                        <br />
                        up to 24 hours before
                    </div>
                    <Button
                        type="primary"
                        inline
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
                        <Title className={s.title}>
                            {this.getPageTitle()}
                        </Title>
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
