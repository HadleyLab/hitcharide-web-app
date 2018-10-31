import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Button, Modal } from 'antd-mobile';
import { Title, Loader } from 'components';
import { displayCityPlace } from 'components/utils';
import moment from 'moment';
import s from './ride-details.css';
import classNames from 'classnames';

const model = {
    request: {},
    deleteResult: {},
};

export const RideRequestDetailsPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        services: PropTypes.shape({
            getRideRequestService: PropTypes.func.isRequired,
            cancelRideRequestService: PropTypes.func.isRequired,
        }).isRequired,
        profile: PropTypes.shape({
            pk: PropTypes.string.isRequired,
        }),
        userType: PropTypes.string.isRequired,
    },

    async componentWillMount() {
        const { getRideRequestService } = this.props.services;
        const { pk } = this.props.match.params;

        await getRideRequestService(this.props.tree.request, pk);
    },

    async cancelRideRequest() {
        const { pk } = this.props.match.params;
        const { services, history } = this.props;
        const { cancelRideRequestService } = services;

        const result = await cancelRideRequestService(this.props.tree.deleteResult, pk);
        if (result.status === 'Failure') {
            Modal.alert('Deleting ride request error', result.error.data.detail,
                [
                    {
                        text: 'OK',
                        style: { color: '#4263CA' },
                    },
                ]);
        }

        if (result.status === 'Succeed') {
            history.goBack();
        }
    },

    renderRideInfo() {
        const rideRequest = this.props.tree.request.get();
        const { cityFrom, placeFrom, cityTo, placeTo, dateTime } = rideRequest.data;

        const rows = [
            {
                title: 'From',
                content: displayCityPlace(cityFrom, placeFrom),
            },
            {
                title: 'To',
                content: displayCityPlace(cityTo, placeTo),
            },
            {
                title: 'Departure date',
                content: moment(dateTime)
                    .format('MMM D YYYY'),
            },
            {
                title: 'Departure time',
                content: moment(dateTime)
                    .format('h:mm A'),
            },
        ];

        return _.map(rows, (row, index) => (
            <div className={s.row} key={`ride-row-${index}`}>
                <span className={s.rowTitle}>{row.title}</span>
                <span className={s.rowContent}>{row.content}</span>
            </div>
        ));
    },

    renderFooter() {
        const { profile, userType, history } = this.props;
        const rideRequest = this.props.tree.request.get();
        const { pk, author } = rideRequest.data;
        const isMine = profile.pk === author;
        const isDriver = userType=== 'driver';

        return (
            <div className={classNames(s.footer)}>
                {isDriver ? (
                    <Button
                        type="primary"
                        inline
                        onClick={() => history.push(`/app/create-ride/${pk}`)}
                    >
                        Create a ride
                    </Button>
                ) : null}
                {!isDriver && isMine ? (
                    <Button
                        type="primary"
                        inline
                        style={{
                            backgroundColor: '#4263CA',
                            borderColor: '#4263CA',
                        }}
                        onClick={() => {
                            Modal.alert('Delete ride request', 'Do you really want to delete your ride request?',
                                [
                                    {
                                        text: 'YES',
                                        onPress: () => this.cancelRideRequest(),
                                        style: { color: '#4263CA' },
                                    },
                                    {
                                        text: 'NO',
                                        style: { color: '#4263CA' },
                                    },
                                ]);
                        }}
                    >
                        Delete request
                    </Button>
                ) : null}
            </div>
        );
    },

    render() {
        const rideRequest = this.props.tree.request.get();
        const isRideRequestLoaded = rideRequest && rideRequest.status === 'Succeed';

        return (
            <Loader isLoaded={isRideRequestLoaded}>
                {isRideRequestLoaded ? (
                    <div className={s.container}>
                        <Title className={s.title}>Trip information</Title>
                        {this.renderRideInfo()}
                        {this.renderFooter()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
