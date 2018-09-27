import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { TabBar, Modal } from 'antd-mobile';
import { TopBar, Loader } from 'components';
import { Route } from 'react-router-dom';
import {
    SearchPage, MyRidesPage, NewRidePage,
    YourProfilePage, RideDetailsPage, UserProfilePage,
    RideRequestDetailsPage,
} from 'pages';
import { getUserType, setUserType } from 'components/utils';
import { AddIcon, RouteIcon, SearchIcon } from 'components/icons';
import s from './main.css';

const tabs = [
    {
        title: 'Search a ride',
        path: '/app',
        icon: SearchIcon,
    },
    {
        title: 'My rides',
        path: '/app/my-rides',
        icon: RouteIcon,
    },
    {
        title: 'Create a ride',
        path: '/app/create-ride',
        icon: AddIcon,
    },
];

export const MainPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        accountCursor: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
        location: PropTypes.shape({
            pathname: PropTypes.string.isRequired,
        }).isRequired,
        history: PropTypes.shape().isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getMyProfileService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
        }),
    },

    async componentDidMount() {
        const { getMyProfileService, getCarListService } = this.context.services;

        this.props.tree.userType.set(getUserType() || 'passenger');
        this.props.accountCursor.set({});
        await getMyProfileService(this.props.tree.profile);
        await getCarListService(this.props.tree.cars);
        const checkIfUserCanBeDriver = this.checkIfUserCanBeDriver();

        if (!checkIfUserCanBeDriver.allowed) {
            this.props.tree.userType.set('passenger');
            setUserType('passenger');
        }

        this.props.tree.userType.set(getUserType() || 'passenger');
    },

    componentWillUnmount() {
        this.props.tree.set({});
    },

    checkIfSuggestAndBookingAllowed() {
        const { profile } = this.props.tree.get();
        const {
            firstName, lastName, phone, isPhoneValidated,
        } = profile.data;

        if (!firstName || !lastName || !phone) {
            return {
                allowed: false,
                message: 'You should fill your profile',
            };
        }

        if (!isPhoneValidated) {
            return {
                allowed: false,
                message: 'You should verify your phone number',
            };
        }

        return { allowed: true };
    },

    checkIfRideCreationAllowed() {
        const { profile, cars } = this.props.tree.get();
        const { paypalAccount } = profile.data;

        if (!paypalAccount) {
            return {
                allowed: false,
                message: 'You should add your paypal account number',
            };
        }

        if (!cars.data.length) {
            return {
                allowed: false,
                message: 'You should add a car to your profile',
            };
        }

        return { allowed: true };
    },

    checkIfUserCanBeDriver(userType) {
        const suggestAndBookingRights = this.checkIfSuggestAndBookingAllowed();
        const creationRights = this.checkIfRideCreationAllowed();

        if (suggestAndBookingRights.allowed && !userType) {
            // Check driver rights for all users
            return creationRights;
        }

        if (suggestAndBookingRights.allowed && userType && userType === 'driver') {
            // Check driver rights specially for driver
            return creationRights;
        }

        return suggestAndBookingRights;
    },

    showMessage(creationRights) {
        Modal.alert('Create a ride', creationRights.message, [
            { text: 'Cancel', onPress: () => null },
            {
                text: 'Edit profile',
                onPress: () => this.props.history.push('/app/profile/edit'),
            },
        ]);
    },

    render() {
        const profile = this.props.tree.profile.get();
        const cars = this.props.tree.cars.get();
        const userTypeCursor = this.props.tree.select('userType');
        const userType = userTypeCursor.get();
        const { url } = this.props.match;
        const isProfileLoaded = profile && profile.status === 'Succeed';
        const isCarsLoaded = cars && cars.status === 'Succeed';
        const isPageReady = isProfileLoaded && isCarsLoaded && !_.isNull(userType);

        return (
            <Loader isLoaded={isPageReady}>
                {isPageReady ? (
                    <div className={s.container}>
                        <TopBar
                            {...this.props}
                            userTypeCursor={userTypeCursor}
                            checkUserRights={this.checkIfUserCanBeDriver}
                        />
                        <div className={s.content}>
                            <Route
                                exact
                                path={url}
                                render={(props) => (
                                    <SearchPage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('searchTab')}
                                        userType={userType}
                                        onCreateRide={() => {
                                            const userRights = this.checkIfUserCanBeDriver(userType);

                                            if (!userRights.allowed) {
                                                this.showMessage(userRights);

                                                return;
                                            }

                                            this.props.history.push('/app/create-ride');
                                        }}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/my-rides`}
                                render={(props) => (
                                    <MyRidesPage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('myRides')}
                                        userType={userType}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/create-ride`}
                                render={(props) => (
                                    <NewRidePage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree}
                                        userType={userType}
                                        cars={cars.data}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/profile`}
                                render={(props) => (
                                    <YourProfilePage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/ride/:pk`}
                                render={(props) => (
                                    <RideDetailsPage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('ride')}
                                        profile={profile.data}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/request/:pk`}
                                render={(props) => (
                                    <RideRequestDetailsPage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('rideRequest')}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/user/:pk`}
                                render={(props) => (
                                    <UserProfilePage
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('user')}
                                    />
                                )}
                            />
                        </div>
                        <div className={s.tabs}>
                            <TabBar
                                unselectedTintColor="#8C8D8F"
                                tintColor="#4263CA"
                                barTintColor="white"
                            >
                                {_.map(tabs, (tab, index) => (
                                    <TabBar.Item
                                        title={tab.title}
                                        key={`tab-${index}`}
                                        icon={(
                                            <div className={s.icon}>
                                                <tab.icon />
                                            </div>
                                        )}
                                        selectedIcon={(
                                            <div className={s.icon}>
                                                <tab.icon color="#4263CA" />
                                            </div>
                                        )}
                                        selected={this.props.location.pathname === tab.path}
                                        onPress={() => {
                                            const userRights = this.checkIfUserCanBeDriver(userType);

                                            if (tab.path === '/app/create-ride' && !userRights.allowed) {
                                                this.showMessage(userRights);

                                                return;
                                            }

                                            this.props.history.push(tab.path);
                                        }}
                                    />
                                ))}
                            </TabBar>
                        </div>
                    </div>
                ) : null}
            </Loader>
        );
    },
});
