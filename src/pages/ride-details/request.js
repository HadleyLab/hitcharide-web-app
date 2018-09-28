import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Title, Loader } from 'components';
import moment from 'moment';
import s from './ride-details.css';

export const RideRequestDetailsPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        services: PropTypes.shape({
            getRideRequestService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async componentDidMount() {
        const { getRideRequestService } = this.props.services;
        const { pk } = this.props.match.params;
        this.props.tree.select('seatsCount').set(1);

        await getRideRequestService(this.props.tree, pk);
    },

    renderRideInfo() {
        const ride = this.props.tree.get();
        const { cityFrom, cityTo, dateTime } = ride.data;

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
                content: moment(dateTime).format('MMM D YYYY'),
            },
            {
                title: 'Departure time',
                content: moment(dateTime).format('h:mm A'),
            },
        ];

        return _.map(rows, (row, index) => (
            <div className={s.row} key={`ride-row-${index}`}>
                <span className={s.rowTitle}>{row.title}</span>
                <span className={s.rowContent}>{row.content}</span>
            </div>
        ));
    },

    render() {
        const ride = this.props.tree.get();
        const isRideLoaded = ride && ride.status === 'Succeed';

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded ? (
                    <div className={s.container}>
                        <Title className={s.title}>Trip information</Title>
                        {this.renderRideInfo()}
                    </div>
                ) : null}
            </Loader>
        );
    },
});
