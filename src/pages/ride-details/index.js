import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Title, Loader } from 'components';
import { getRideService } from 'services';
import moment from 'moment';
import passengerIcon from 'components/icons/passenger.svg';
import s from './ride-details.css';

const model = (props) => {
    const { pk } = props.match.params;

    return {
        ride: (cursor) => getRideService(cursor, pk),
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

        await getRideService(this.props.tree.ride, pk);
    },

    renderRideInfo() {
        const ride = this.props.tree.ride.get();

        if (!_.isEmpty(ride) && ride.status === 'Succeed') {
            const {
                cityFrom, cityTo, price, dateTime, numberOfSeats,
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
                                    className={s.seat}
                                />
                            ))}
                        </div>
                    ),
                },
                {
                    title: 'Price for seat',
                    content: `$ ${parseFloat(price).toString()}`,
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

        return null;
    },

    render() {
        console.log('ride', this.props.tree.get());

        return (
            <div>
                <Title>Trip information</Title>
                <Loader data={this.props.tree.ride.get()}>
                    {this.renderRideInfo()}
                </Loader>
                <Title>Number of reserved seats</Title>
            </div>
        );
    },
}));
