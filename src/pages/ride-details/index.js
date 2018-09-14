import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import schema from 'libs/state';
import { Title, Loader, StepperInput } from 'components';
import { getRideService } from 'services';
import moment from 'moment';
import { Button } from 'antd-mobile';
import passengerIcon from 'components/icons/passenger.svg';
import s from './ride-details.css';

const model = (props) => {
    const { pk } = props.match.params;

    return {
        ride: (cursor) => getRideService(cursor, pk),
        seatsToReserve: 1,
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

    async componentDidMount() {
        const { pk } = this.props.match.params;
        this.props.tree.select('seatsToReserve').set(1);

        await getRideService(this.props.tree.ride, pk);
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
                    content: moment(dateTime).format('HH:mm A'),
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
                messageOnMaxExceeded={
                    `Maximum number (${availableNumberOfSeats}) of available seats exceeded`
                }
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
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.bookRide}
                    >
                        Book it
                    </Button>
                </div>
            </Loader>
        );
    },
}));
