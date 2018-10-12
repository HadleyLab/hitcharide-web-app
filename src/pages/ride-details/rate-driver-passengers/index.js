import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Loader, Title, ClickableStars, Error,
} from 'components';
import { validateForm } from 'components/utils';
import { Redirect } from 'react-router-dom';
import { HappinessIcon } from 'components/icons';
import { Button } from 'antd-mobile';
import * as yup from 'yup';
import s from './rate-driver-passengers.css';

const validationSchema = yup.array().of(
    yup.object().shape({
        authorType: yup.number().nullable().required(),
        ride: yup.number().nullable().required(),
        subject: yup.string().ensure().required(),
        rating: yup.number().nullable().required(),
        comment: yup.string().ensure().required(),
    })
);

const DRIVER = 1;
const PASSENGER = 2;

export const RateDriverAndPassengersScreen = schema({})(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        profile: PropTypes.shape().isRequired,
        match: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getRideService: PropTypes.func.isRequired,
            addReviewService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            userType: null,
            passengers: [],
            driver: null,
        };
    },

    componentDidMount() {
        this.loadRide();
    },

    async loadRide() {
        const { tree, match } = this.props;
        const { getRideService } = this.props.services;

        if (!tree.ride.get()) {
            await getRideService(tree.ride, match.params.pk);
        }

        this.getReviewData();
    },

    getReviewData() {
        const { profile } = this.props;
        const { car, bookings, pk } = this.props.tree.ride.data.get();
        const amIDriver = car.owner.pk === profile.pk;
        const amIPassenger = _.filter(bookings, ({ client }) => client.pk === profile.pk).length;
        const reviewsCursor = this.props.tree.select('reviews');
        reviewsCursor.set([]);

        if (amIDriver) {
            const passengers = _.map(bookings,
                ({ client, seatsCount }) => _.merge({ bookedSeatsCount: seatsCount }, client));

            this.setState({
                userType: 'driver',
                passengers,
            });

            _.forEach(passengers, (passenger) => {
                reviewsCursor.push({
                    authorType: DRIVER,
                    ride: pk,
                    subject: passenger.pk,
                    rating: null,
                    comment: null,
                });
            });

            return;
        }

        if (amIPassenger) {
            this.setState({ userType: 'passenger', driver: car.owner });

            reviewsCursor.push({
                authorType: PASSENGER,
                ride: pk,
                subject: car.owner.pk,
                rating: null,
                comment: null,
            });

            return;
        }

        this.setState({ userType: 'guest' });
    },

    async onSubmit() {
        const { addReviewService } = this.props.services;
        const formCursor = this.props.tree.reviews;
        const errorsCursor = this.props.tree.reviewsErrors;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid } = validationResult;
        const resultCursor = this.props.tree.reviewsResult;
        resultCursor.set([]);

        if (!isDataValid) {
            errorsCursor.set(validationResult.errors);

            return;
        }

        if (isDataValid) {
            const reviews = formCursor.get();
            await Promise.all(_.map(reviews,
                (review, index) => addReviewService(resultCursor.select(index), review)))
                .catch((errors) => errorsCursor.set(errors));
        }
    },

    renderSubject(subject, index) {
        const formCursor = this.props.tree.reviews;
        const { firstName, bookedSeatsCount, photo } = subject;

        return (
            <div
                className={s.subject}
                key={index ? `passenger-${index}` : 'driver'}
            >
                <div className={s.header}>
                    <div className={s.userInfo}>
                        <div className={s.imageWrapper}>
                            {photo ? (
                                <div className={s.image} style={{ backgroundImage: `url(${photo})` }} />
                            ) : (
                                <div className={s.defaultImage}>
                                    <HappinessIcon />
                                </div>
                            )}
                        </div>
                        {`${firstName}`}
                        {bookedSeatsCount > 1 ? (
                            <span className={s.seatsCount}>{` +${bookedSeatsCount - 1}`}</span>
                        ) : null}
                    </div>
                    <div className={s.stars}>
                        <ClickableStars
                            onChange={(value) => {
                                formCursor.select(index, 'rating').set(value);
                            }}
                        />
                    </div>
                </div>
                <textarea
                    placeholder={`Review about ${firstName}`}
                    className={s.textarea}
                    onChange={(e) => {
                        formCursor.select(index, 'comment').set(e.target.value);
                    }}
                />
            </div>
        );
    },

    renderFooter() {
        return (
            <div>
                <Error
                    form={{}}
                    errors={this.props.tree.reviewsErrors.get()}
                />
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.onSubmit}
                    >
                        Done
                    </Button>
                </div>
            </div>
        );
    },

    renderPassengersRateForm() {
        const { passengers } = this.state;

        return (
            <div className={s.container}>
                <Title>Rate passengers</Title>
                {_.map(passengers, (passenger, index) => this.renderSubject(passenger, index))}
                {this.renderFooter()}
            </div>
        );
    },

    renderDriverRateForm() {
        const { driver } = this.state;

        return (
            <div className={s.container}>
                <Title>Rate the driver</Title>
                {this.renderSubject(driver)}
                {this.renderFooter()}
            </div>
        );
    },

    renderContent() {
        const isDriver = this.state.userType === 'driver';

        if (isDriver) {
            return this.renderPassengersRateForm();
        }

        return this.renderDriverRateForm();
    },

    render() {
        console.log('tree', this.props.tree.get());
        const { userType } = this.state;
        const { pk: ridePk } = this.props.match.params;
        const tree = this.props.tree.get();
        const isRideLoaded = tree && tree.ride && tree.ride.status === 'Succeed';

        if (isRideLoaded) {
            const { status } = tree.ride.data;

            // console.log('this.props.tree.reviews', this.props.tree.reviews.get());

            // if (status !== 'completed') {
            //     return <Redirect to={`/app/ride/${ridePk}`} />;
            // }
        }

        if (userType === 'guest') {
            return <Redirect to={`/app/ride/${ridePk}`} />;
        }

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded && userType ? this.renderContent() : null}
            </Loader>
        );
    },
}));
