import React from 'react';
import _ from 'lodash';
// import classNames from 'classnames';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { Loader, Stars } from 'components';
import { HappinessIcon } from 'components/icons';
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

    renderReviews() {
        const reviews = this.props.tree.reviews.data.get();
        const filteredReviews = _.filter(reviews, ({ comment }) => !!comment);

        return (
            <div className={s.reviews}>
                {_.map(filteredReviews, (review, index) => {
                    const {
                        author: { firstName, lastName, photo },
                        comment, authorType, rating,
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
                        {this.renderReviews()}
                    </div>
                ) : null}
            </Loader>
        );
    },
}));
