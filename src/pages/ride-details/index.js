import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import {
    Title, Loader, StepperInput, Error, ProxyPhone,
} from 'components';
import moment from 'moment';
import { Button, Modal } from 'antd-mobile';
import { Link } from 'react-router-dom';
import passengerIcon from 'components/icons/passenger.svg';
import { checkIfRideStarted } from 'components/utils';
import arrowDownIcon from 'components/icons/arrow-down-blue.svg';
import { Timer } from './timer';
import s from './ride-details.css';

const model = {
    ride: {},
    seatsCount: 1,
    bookingResult: {},
    bookingError: {},
    proxyPhoneResult: {
        driver: {},
        passengers: {},
    },
};

export const RideDetailsPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        profile: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getRideService: PropTypes.func.isRequired,
            bookRideService: PropTypes.func.isRequired,
            bookingRequestPassengerPhoneService: PropTypes.func.isRequired,
            rideRequestDriverPhoneService: PropTypes.func.isRequired,
        }).isRequired,
        history: PropTypes.shape().isRequired,
        onBookRide: PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            detailsModalOpened: false,
            showCostDetails: false,
        };
    },

    componentWillMount() {
        this.props.tree.select('seatsCount').set(1);
        this.loadRide();
    },

    componentWillUnmount() {
        this.props.tree.proxyPhoneResult.set({});
    },

    async loadRide() {
        const { tree, match } = this.props;
        const { getRideService } = this.props.services;

        await getRideService(tree.ride, match.params.pk);
    },

    async onBookingSucceed() {
        this.props.tree.bookingError.set(null);
        this.loadRide();
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

    closeModal() {
        this.setState({ detailsModalOpened: false, showCostDetails: false });
    },

    renderBookingModal() {
        const { detailsModalOpened, showCostDetails } = this.state;
        const ride = this.props.tree.ride.get();
        const seatsCount = this.props.tree.seatsCount.get();
        const { cityFrom, cityTo, dateTime } = ride.data;
        const price = _.round(parseFloat(ride.data.price), 2).toString();
        const priceWithFee = _.round(parseFloat(ride.data.priceWithFee), 2).toString();
        const fee = _.round(parseFloat(ride.data.priceWithFee - ride.data.price), 2).toString();
        const sum = _.round(parseFloat(ride.data.priceWithFee * seatsCount), 2).toString();

        const message = 'You are booking a ride '
            + `from ${cityFrom.name}, ${cityFrom.state.name} `
            + `to ${cityTo.name}, ${cityTo.state.name} `
            + `on ${moment(dateTime).format('MMM D YYYY')} `
            + `at ${moment(dateTime).format('h:mm A')} `
            + `${seatsCount} ${seatsCount === 1 ? 'seat' : 'seats'} `
            + `priced at $${sum}`
            + `${seatsCount > 1 ? ` ($${priceWithFee} per seat)` : ''}. `
            + 'Are you sure?';

        return (
            <Modal
                visible={detailsModalOpened}
                transparent
                maskClosable={false}
                title="Check your ride"
                footer={[
                    {
                        text: 'YES',
                        onPress: async () => {
                            const { pk } = this.props.match.params;
                            const { bookRideService } = this.props.services;

                            const result = await bookRideService(this.props.tree.bookingResult, {
                                ride: pk,
                                seatsCount,
                            });

                            if (result.status === 'Failure') {
                                this.props.tree.bookingError.set(result.error.data);
                            }

                            if (result.status === 'Succeed') {
                                window.location.replace(result.data.paypalApprovalLink);
                                this.closeModal();
                            }
                        },
                        style: { color: '#4263CA' },
                    },
                    {
                        text: 'NO',
                        onPress: this.closeModal,
                        style: { color: '#4263CA' },
                    },
                ]}
            >
                <div className={s.message}>
                    {message}
                    <div className={s.details}>
                        <div
                            className={s.detailsLink}
                            onClick={() => this.setState({ showCostDetails: !showCostDetails })}
                        >
                            See details
                            <div
                                className={classNames(s.arrow, {
                                    [s._up]: showCostDetails,
                                })}
                                style={{ backgroundImage: `url(${arrowDownIcon})` }}
                            />
                        </div>
                        {showCostDetails ? (
                            <div>
                                Driver reward: {`$${price}`}<br />
                                Service fee: {`$${fee}`}
                            </div>
                        ) : null}
                    </div>
                </div>
            </Modal>
        );
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
        const { pk: ridePk, car, bookings, status } = ride.data;
        const isRideActual = status === 'created';
        const isMe = profile.pk === car.owner.pk;
        let isBookingPayed = false;

        if (!isMe) {
            const myBooking = _.find(bookings, ({ client }) => client.pk === profile.pk);
            isBookingPayed = myBooking && myBooking.status === 'payed';
        }

        const rows = _.concat([
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
                            {!isMe ? (
                                <span className={s.rating}>
                                    {`${_.round(car.owner.rating.value, 2)}/5`}
                                </span>
                            ) : null}
                        </Link>
                    </div>
                ),
            },
        ],
        !isMe && isBookingPayed && isRideActual ? {
            title: 'Phone number',
            content: (
                <ProxyPhone
                    tree={this.props.tree.proxyPhoneResult.driver}
                    service={(tree) => this.props.services.rideRequestDriverPhoneService(tree, ridePk)}
                />
            ),
        } : []);

        return _.map(rows, (row, index) => (
            <div className={s.row} key={`ride-row-driver-${index}`}>
                <span className={s.rowTitle}>{row.title}</span>
                <span className={s.rowContent}>{row.content}</span>
            </div>
        ));
    },

    renderBookings() {
        const ride = this.props.tree.ride.get();
        const { car, bookings, status } = ride.data;
        const { profile } = this.props;
        const isRideActual = status === 'created';
        const amIDriver = profile.pk === car.owner.pk;

        if (!bookings.length) {
            return (
                <div className={classNames(s.row, s._notes)}>
                    No passengers yet
                </div>
            );
        }

        return _.map(bookings, ({ pk: bookingPk, client, seatsCount }, index) => {
            const isMe = profile.pk === client.pk;

            return (
                <div className={s.row} key={`ride-row-booking-${index}`}>
                    <span className={s.rowTitle}>
                        {amIDriver && isRideActual ? (
                            <ProxyPhone
                                tree={this.props.tree.proxyPhoneResult.passengers.select(bookingPk)}
                                service={(tree) => this.props.services.bookingRequestPassengerPhoneService(tree, bookingPk)}
                            />
                        ) : 'Passenger'}
                    </span>
                    <span className={s.rowContent}>
                        <span className={s.you}>{isMe ? '(You) ' : null}</span>
                        <Link to={`/app/user/${client.pk}`} className={s.link}>
                            {`${client.firstName} ${client.lastName}`}
                            {seatsCount > 1 ? ` +${seatsCount - 1}` : null}
                            {!isMe ? (
                                <span className={s.rating}>
                                    {`${_.round(client.rating.value, 2)}/5`}
                                </span>
                            ) : null}
                        </Link>
                    </span>
                </div>
            );
        });
    },

    renderNumberOfSeats() {
        const tree = this.props.tree.get();
        const { availableNumberOfSeats } = tree.ride.data;

        return (
            <StepperInput
                className={s.stepper}
                title="Number of seats"
                cursor={this.props.tree.select('seatsCount')}
                minValue={1}
                maxValue={availableNumberOfSeats}
            />
        );
    },

    renderRateButton() {
        const { history, match } = this.props;
        const { pk } = match.params;

        return (
            <Button
                type="primary"
                style={{
                    backgroundColor: '#4263CA',
                    borderColor: '#4263CA',
                }}
                inline
                onClick={() => history.push(`/app/rate/${pk}`)}
            >
                Rate the ride
            </Button>
        );
    },

    renderFooter() {
        const { profile, history } = this.props;
        const tree = this.props.tree.get();
        const amIDriver = this.checkIfIAmDriver();
        const amIPassenger = this.checkIfIAmPassenger();
        const { ride } = tree;
        const ridePk = ride.data.pk;

        if (ride.data.status === 'canceled') {
            return (
                <div className={s.footer}>
                    <div className={s.canceled}>The ride canceled</div>
                </div>
            );
        }

        const { bookings, dateTime } = ride.data;
        const isRideStarted = checkIfRideStarted(dateTime);
        const canBeRated = isRideStarted && bookings.length;

        if (amIPassenger) {
            const myBooking = _.find(bookings, ({ client }) => client.pk === profile.pk);
            const isBookingPayed = myBooking.status === 'payed';
            const isBookingNotPayed = myBooking.status === 'created';
            const dayBeforeRide = moment(dateTime).subtract(1, 'days').utc();
            const canBeCanceled = moment().utc().isSameOrBefore(dayBeforeRide, 'minute');

            return (
                <div className={classNames(s.footer, s._passenger)}>
                    {canBeRated ? this.renderRateButton() : null}
                    {isBookingPayed && canBeCanceled ? (
                        <Button
                            type="primary"
                            inline
                            style={{
                                backgroundColor: '#4263CA',
                                borderColor: '#4263CA',
                            }}
                            onClick={() => {
                                Modal.alert('Cancel booking', 'Do you really want to cancel your booking? '
                                    + 'The money will be returned to your PayPal account.', [
                                    {
                                        text: 'YES',
                                        onPress: () => history.push(`/app/cancel-booking/${myBooking.pk}`),
                                        style: { color: '#4263CA' },
                                    },
                                    {
                                        text: 'NO',
                                        style: { color: '#4263CA' },
                                    },
                                ]);
                            }}
                        >
                            Cancel booking
                        </Button>
                    ) : null}
                    {isBookingNotPayed ? (
                        <div className={s.warningText}>
                            {'You have '}
                            <Timer
                                date={myBooking.created}
                                intervalInMinutes={15}
                                onTimeExpired={this.loadRide}
                            />
                            {' minutes to pay your booking before it will be cancelled'}
                        </div>
                    ) : null}
                    {isBookingNotPayed ? (
                        <Button
                            type="primary"
                            inline
                            onClick={() => window.location.replace(myBooking.paypalApprovalLink)}
                        >
                            Pay your booking
                        </Button>
                    ) : null}
                    {isRideStarted ? (
                        <Button
                            type="ghost"
                            inline
                            onClick={() => history.push(`/app/complain/${ridePk}`)}
                        >
                            Complain
                        </Button>
                    ) : null}
                </div>
            );
        }

        if (amIDriver) {
            return (
                <div className={s.footer}>
                    {canBeRated ? this.renderRateButton() : null}
                    {!isRideStarted ? (
                        <Button
                            type="ghost"
                            inline
                            onClick={() => {
                                Modal.alert('Delete trip', 'Do you really want to delete this trip?', [
                                    {
                                        text: 'YES',
                                        onPress: () => history.push(`/app/delete-ride/${ridePk}`),
                                        style: { color: '#4263CA' },
                                    },
                                    {
                                        text: 'NO',
                                        style: { color: '#4263CA' },
                                    },
                                ]);
                            }}
                        >
                            Delete trip
                        </Button>
                    ) : null}
                </div>
            );
        }

        return (
            <div style={{ marginTop: 25 }}>
                <Title className={s.title}>Number of reserved seats</Title>
                {tree && tree.seatsCount ? this.renderNumberOfSeats() : null}
                <div className={s.footer}>
                    <Error
                        form={{}}
                        errors={tree.bookingError}
                    />
                    <div className={s.warningText}>
                        You can cancel the trip
                        <br />
                        up to 24 hours before
                    </div>
                    <Button
                        type="primary"
                        inline
                        onClick={() => this.props.onBookRide(
                            () => this.setState({ detailsModalOpened: true })
                        )}
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
                        {this.renderBookingModal()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
