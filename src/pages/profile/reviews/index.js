import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { Loader, Stars } from 'components';
import { HappinessIcon } from 'components/icons';
import moment from 'moment';
import s from './reviews.css';

const modal = {
    reviews: {},
};

export const ReviewsPage = schema(modal)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        profile: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getReviewsListService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getDefaultProps() {},

    componentDidMount() {
        this.loadReviews();
    },

    componentWillUnmount() {
        this.props.tree.set({});
    },

    async loadReviews() {
        const { tree, profile, services } = this.props;
        const { getReviewsListService } = services;
        await getReviewsListService(tree.reviews, { subject: profile.pk });
    },

    getUserType(type) {
        if (type === '1') {
            return 'Driver';
        }

        return 'Passenger';
    },

    getReviewDate(date) {
        if (moment(date).year() === moment().year()) {
            return moment(date).format('MMM D');
        }

        return moment(date).format('MMM D YYYY');
    },

    renderStatistics() {
        const reviews = this.props.tree.select('reviews').get('data');
        const groupedRatings = _.groupBy(reviews, 'rating');

        return (
            <div className={s.statistics}>
                {_.map(_.range(1, 6), (item, index) => {
                    const count = groupedRatings[item] ? groupedRatings[item].length : 0;

                    return (
                        <div className={s.statisticsItem} key={`statistics-${index}`}>
                            <Stars
                                rating={item}
                                className={s.stars}
                                blankColor="#C4C4C4"
                                fillColor="#007AFF"
                                small
                            />
                            <div className={s.statisticsCount}>
                                {`${count} ${count === 1 ? 'review' : 'reviews'}`}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    },

    renderReviews() {
        const reviews = this.props.tree.reviews.data.get();
        const filteredReviews = _.filter(reviews, ({ comment }) => !!comment);

        return (
            <div className={s.reviews}>
                {_.map(filteredReviews, (review, index) => {
                    const {
                        author: { firstName, lastName, photo },
                        comment, authorType, rating, created,
                    } = review;

                    return (
                        <div key={`review-${index}`} className={s.review}>
                            <div className={s.header}>
                                <div className={s.userInfo}>
                                    {photo ? (
                                        <div className={s.photo} style={{ backgroundImage: `url(${photo})` }} />
                                    ) : (
                                        <div className={s.defaultPhoto}>
                                            <HappinessIcon />
                                        </div>
                                    )}
                                    <div>
                                        <div className={s.name}>
                                            {`${firstName} ${lastName}`}
                                        </div>
                                        {this.getUserType(authorType)}
                                    </div>
                                </div>
                                <div className={s.rating}>
                                    <Stars
                                        rating={rating}
                                        className={s.stars}
                                        blankColor="#C4C4C4"
                                        fillColor="#007AFF"
                                        small
                                    />
                                    {this.getReviewDate(created)}
                                </div>
                            </div>
                            <div className={s.comment}>{comment}</div>
                        </div>
                    );
                })}
            </div>
        );
    },

    render() {
        const reviews = this.props.tree.select('reviews').get();
        const isLoaded = reviews && reviews.status === 'Succeed';

        return (
            <Loader isLoaded={isLoaded}>
                {isLoaded ? (
                    <div className={s.container}>
                        {this.renderStatistics()}
                        {this.renderReviews()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
