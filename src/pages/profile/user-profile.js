import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Loader, ServiceContext } from 'components';
import { ReviewsPage } from 'pages';
import { Route } from 'react-router-dom';
import { ProfileContent } from './profile-content';

export const UserProfilePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape().isRequired,
        services: PropTypes.shape({
            getUserProfileService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async componentDidMount() {
        const { getUserProfileService } = this.props.services;
        const { pk } = this.props.match.params;

        await getUserProfileService(this.props.tree, pk);
    },

    render() {
        const profile = this.props.tree.get();
        const isRideLoaded = profile && profile.status === 'Succeed';
        const { url } = this.props.match;

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded ? (
                    <ServiceContext.Consumer>
                        {(services) => (
                            <div>
                                <Route
                                    exact
                                    path={url}
                                    render={(props) => (
                                        <ProfileContent
                                            {...props}
                                            profile={profile.data}
                                            cars={profile.data.cars}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path={`${url}/reviews`}
                                    render={(props) => (
                                        <ReviewsPage
                                            {...props}
                                            services={services}
                                            tree={this.props.tree.select('userReviews')}
                                            profile={profile.data}
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </ServiceContext.Consumer>
                ) : null}
            </Loader>
        );
    },
});
