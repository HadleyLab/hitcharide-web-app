import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Loader, Title, Stars } from 'components';
import { validateForm, checkIfRideStarted } from 'components/utils';
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
        comment: yup.string().ensure(),
    })
);

const DRIVER = 1;
const PASSENGER = 2;

const modal = {
    reviews: {},
    reviewsForm: [],
    addReviewsErrors: {},
    addReviewsResult: {},
};

export const RateDriverAndPassengersScreen = schema(modal)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        rideCursor: BaobabPropTypes.cursor.isRequired,
        profile: PropTypes.shape().isRequired,
        match: PropTypes.shape().isRequired,
        history: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getRideService: PropTypes.func.isRequired,
            addReviewService: PropTypes.func.isRequired,
            getReviewsListService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            userType: null,
            users: [],
        };
    },

    async componentDidMount() {
        await this.loadRide();
        this.checkUserType();
        await this.loadReviews();
    },

    componentWillUnmount() {
        this.props.tree.set({});
    },

    async loadRide() {
        const { match, rideCursor } = this.props;
        const { getRideService } = this.props.services;

        await getRideService(rideCursor, match.params.pk);
    },

    async loadReviews() {
        const { tree, match, profile } = this.props;
        const { pk: ride } = match.params;
        const { getReviewsListService } = this.props.services;
        const result = await getReviewsListService(tree.reviews, { ride, author: profile.pk });

        if (result.status === 'Succeed') {
            this.props.tree.select('reviewsForm').set([]);

            if (result.data.length) {
                tree.reviewsForm.set(result.data);
                this.getUsers();
            } else {
                this.perepareReviewsData();
            }
        }
    },

    checkUserType() {
        const { profile, rideCursor } = this.props;
        const { car, bookings } = rideCursor.data.get();
        const amIDriver = car.owner.pk === profile.pk;
        const amIPassenger = _.filter(bookings, ({ client }) => client.pk === profile.pk).length;

        if (amIDriver) {
            this.setState({ userType: 'driver' });

            return;
        }

        if (amIPassenger) {
            this.setState({ userType: 'passenger' });

            return;
        }

        this.setState({ userType: 'guest' });
    },

    getUsers() {
        const reviews = this.props.tree.reviews.data.get();
        const { userType } = this.state;
        const { car, bookings } = this.props.rideCursor.data.get();

        if (userType === 'driver') {
            const passengers = _.map(bookings, ({ client }) => {
                const review = _.find(reviews, { subject: client.pk });
                const data = review ? _.pick(review, ['rating', 'comment']) : { rating: null, comment: null };

                return _.merge({}, client, data);
            });
            this.setState({ users: passengers });
        }

        if (userType === 'passenger') {
            const review = _.find(reviews, { subject: car.owner.pk });
            const data = review ? _.pick(review, ['rating', 'comment']) : { rating: null, comment: null };

            this.setState({
                users: [_.merge({}, car.owner, data)],
            });
        }
    },

    perepareReviewsData() {
        const { userType } = this.state;
        const { car, bookings, pk } = this.props.rideCursor.data.get();
        const reviewsCursor = this.props.tree.select('reviewsForm');
        this.getUsers();

        if (userType === 'driver') {
            const passengers = _.map(bookings, 'client');

            _.forEach(passengers, (passenger) => {
                reviewsCursor.push({
                    authorType: DRIVER,
                    ride: pk,
                    subject: passenger.pk,
                    rating: null,
                    comment: null,
                });
            });
        }

        if (userType === 'passenger') {
            reviewsCursor.push({
                authorType: PASSENGER,
                ride: pk,
                subject: car.owner.pk,
                rating: null,
                comment: null,
            });
        }
    },

    async onSubmit() {
        const { addReviewService } = this.props.services;
        const formCursor = this.props.tree.reviewsForm;
        const errorsCursor = this.props.tree.addReviewsErrors;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid } = validationResult;
        const resultCursor = this.props.tree.addReviewsResult;
        resultCursor.set([]);

        if (!isDataValid) {
            errorsCursor.set(validationResult.errors);

            return;
        }

        if (isDataValid) {
            const reviews = formCursor.get();
            await Promise.all(_.map(reviews,
                (review, index) => addReviewService(resultCursor.select(index), review)))
                .then(() => this.props.history.goBack());
        }
    },

    renderTitle() {
        const { userType } = this.state;

        if (userType === 'driver') {
            return <Title>Rate passengers</Title>;
        }

        if (userType === 'passenger') {
            return <Title>Rate the driver</Title>;
        }

        return null;
    },

    renderSubject(subject, index) {
        const { reviews } = this.props.tree.get();
        const formCursor = this.props.tree.reviewsForm;
        const hasReviews = reviews && reviews.data && reviews.data.length;
        const {
            firstName, photo, rating, comment,
        } = subject;

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
                    </div>
                    <div className={s.stars}>
                        <Stars
                            rating={rating}
                            onChange={(value) => {
                                formCursor.select(index, 'rating').set(value);
                                this.props.tree.addReviewsErrors.set({});
                            }}
                            clickable={!hasReviews}
                        />
                    </div>
                </div>
                <textarea
                    defaultValue={comment}
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
        const { reviews } = this.props.tree.get();
        const { userType } = this.state;
        const errors = this.props.tree.addReviewsErrors.get();
        const hasError = !_.isEmpty(errors);

        if (!reviews || reviews.status !== 'Succeed') {
            return null;
        }

        if (reviews && reviews.data && reviews.data.length) {
            return null;
        }

        return (
            <div>
                {hasError ? (
                    <div className={s.error}>
                        {userType === 'driver' ? 'Rate all passengers' : null}
                        {userType === 'passenger' ? 'Rate the driver' : null}
                    </div>
                ) : null}
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

    renderForm() {
        const { users } = this.state;

        return (
            <div className={s.reviews}>
                {_.map(users, (user, index) => this.renderSubject(user, index))}
            </div>
        );
    },

    render() {
        const { userType } = this.state;
        const { pk: ridePk } = this.props.match.params;
        const reviews = this.props.tree.select('reviews').get();
        const ride = this.props.rideCursor.get();
        const isRideLoaded = reviews && ride && ride.status === 'Succeed' && reviews.status === 'Succeed';
        const isRideStarted = isRideLoaded && checkIfRideStarted(ride.data.dateTime);

        if (userType === 'guest' || (isRideLoaded && !isRideStarted)) {
            return <Redirect to={`/app/ride/${ridePk}`} />;
        }

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded && userType ? (
                    <div className={s.container}>
                        {this.renderTitle()}
                        {this.renderForm()}
                        {this.renderFooter()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
