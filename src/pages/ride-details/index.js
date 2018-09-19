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
import passengerIcon from 'components/icons/passenger.svg';
import s from './ride-details.css';

const model = (props, context) => {
    const { pk } = props.match.params;
    const { getRideService } = context.services;

    return {
        ride: (cursor) => getRideService(cursor, pk),
        seatsToReserve: 1,
        bookingResult: {},
        bookingError: null,
    };
};

export const RideDetailsPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getRideService: PropTypes.func.isRequired,
            bookRideService: PropTypes.func.isRequired,
        }),
    },

    async componentDidMount() {
        const { getRideService } = this.context.services;
        const { pk } = this.props.match.params;
        this.props.tree.select('seatsToReserve').set(1);

        await getRideService(this.props.tree.ride, pk);
    },

    bookRide() {
        const ride = this.props.tree.ride.get();
        const seatsToReserve = this.props.tree.seatsToReserve.get();
        const {
            cityFrom, cityTo, price, dateTime,
        } = ride.data;

        const message = 'You are booking a ride '
            + `from ${cityFrom.name}, ${cityFrom.state.name} `
            + `to ${cityTo.name}, ${cityTo.state.name} `
            + `on ${moment(dateTime).format('MMM d YYYY')} `
            + `at ${moment(dateTime).format('h:mm A')} `
            + `${seatsToReserve} ${seatsToReserve === 1 ? 'seat' : 'seats'} `
            + `priced at ${parseFloat(price * seatsToReserve).toString()}$ per seat. `
            + 'Are you sure?';

        Modal.alert('Check a ride', message, [
            { text: 'Cancel' },
            {
                text: 'OK',
                onPress: async () => {
                    const { pk } = this.props.match.params;
                    const { bookRideService } = this.context.services;

                    const result = await bookRideService(this.props.tree.bookingResult, { ride: pk });

                    if (result.status === 'Failure') {
                        let error = '';

                        _.forEach(result.error.data, (item) => { error += item; });

                        this.props.tree.bookingError.set(error);
                    }

                    if (result.status === 'Failure') {
                        let error = '';

                        _.forEach(result.error.data, (item) => { error += item; });

                        this.props.tree.bookingError.set(error);
                    } else {
                        this.props.tree.bookingError.set(null);
                    }
                },
            },
        ]);
    },

    renderRideInfo() {
        const ride = this.props.tree.ride.get();
        const isRidesLoaded = ride && ride.status === 'Succeed';

        if (isRidesLoaded) {
            const {
                cityFrom, cityTo, price, dateTime, numberOfSeats,
                availableNumberOfSeats, car,
            } = ride.data;

            const rows = [
                {
                    title: 'From',
                    content: `${cityFrom.name}, ${cityFrom.state.name}`,
                },
                {
                    title: 'To',
                    content: `${cityTo.name}, ${cityTo.state.name}`,
                },
                {
                    title: 'Departure date',
                    content: moment(dateTime).format('MMM d YYYY'),
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
                    content: `$ ${parseFloat(price).toString()}`,
                },
                {
                    title: 'Car',
                    content: `${car.brand} ${car.model} (${car.color})`,
                },
            ];

            return (
                <div className={s.ride}>
                    {_.map(rows, (row, index) => (
                        <div className={s.row} key={`ride-row-${index}`}>
                            <span className={s.rowTitle}>{row.title}</span>
                            <span className={s.rowContent}>{row.content}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return <div />;
    },

    renderStepper() {
        const tree = this.props.tree.get();
        const { availableNumberOfSeats } = tree.ride.data;

        return (
            <StepperInput
                title="Number of seats"
                cursor={this.props.tree.select('seatsToReserve')}
                minValue={1}
                maxValue={availableNumberOfSeats}
            />
        );
    },

    render() {
        const tree = this.props.tree.get();
        const isRidesLoaded = tree && tree.ride && tree.ride.status === 'Succeed';

        return (
            <Loader data={this.props.tree.ride.get()}>
                <Title>Trip information</Title>
                {this.renderRideInfo()}
                <Title style={{ marginTop: '25px' }}>Number of reserved seats</Title>
                {tree && tree.seatsToReserve && isRidesLoaded ? this.renderStepper() : null}
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
                {/*
                <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post">
                    <input type="hidden" name="cmd" value="_xclick" />
                    <input type="hidden" name="charset" value="utf-8" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input type="hidden" name="no_shipping" value="1" />
                    <input type="hidden" name="business" value="**SELLER_EMAIL_FROM_CONFIG**" />
                    <input type="hidden" name="amount" value="**RIDE.PRICE_WITH_FEE**" />
                    <input type="hidden" name="item_name" value="ride_booking" />
                    <input type="hidden" name="item_number" value="**RIDE_BOOKING_ID**" />
                    <input type="hidden" name="notify_url" value="http://localhost:8000/paypal/" />
                    <input type="hidden" name="return" value="http://localhost:8000/#/ridebooking-paypal-return-url" />
                    <input
                        type="hidden"
                        name="cancel_return"
                        value="http://localhost:8000/#/ridebooking-paypal-return-url"
                    />
                    <input
                        type="image"
                        src="https://www.paypal.com/en_US/i/btn/btn_buynowCC_LG.gif"
                        border="0"
                        name="submit"
                        alt="Buy it Now"
                    />
                </form>
                */}
            </Loader>
        );
    },
}));
