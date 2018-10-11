import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Loader, ServiceContext } from 'components';
import { AddCarPage } from 'pages';
import { Route } from 'react-router-dom';
import { EditProfilePage } from './edit';
import { ProfileContent } from './profile-content';

export const YourProfilePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
    },

    render() {
        const profile = this.props.tree.profile.get();
        const cars = this.props.tree.cars.get();
        const isProfileLoaded = profile && profile.status === 'Succeed';
        const isCarsLoaded = cars && cars.status === 'Succeed';
        const isPageReady = isProfileLoaded && isCarsLoaded;
        const { url } = this.props.match;

        return (
            <Loader isLoaded={isPageReady}>
                {isPageReady ? (
                    <ServiceContext.Consumer>
                        {(services) => (
                            <div>
                                <Route
                                    exact
                                    path={url}
                                    render={() => (
                                        <ProfileContent
                                            {...this.props}
                                            profile={profile.data}
                                            cars={cars.data}
                                            isYourProfile
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path={`${url}/car/add`}
                                    render={(props) => (
                                        <AddCarPage
                                            {...props}
                                            services={services}
                                            tree={this.props.tree.select('addCar')}
                                            carsCursor={this.props.tree.cars}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path={`${url}/car/:pk/:mode`}
                                    render={(props) => (
                                        <AddCarPage
                                            {...props}
                                            services={services}
                                            editMode
                                            tree={this.props.tree.select('addCar')}
                                            carsCursor={this.props.tree.cars}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path={`${url}/edit`}
                                    render={(props) => (
                                        <EditProfilePage
                                            {...props}
                                            services={services}
                                            tree={this.props.tree.select('editProfile')}
                                            profileCursor={this.props.tree.profile.data}
                                            carsCursor={this.props.tree.cars}
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
