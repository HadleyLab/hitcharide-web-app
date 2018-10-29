import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { TabBar, Modal } from 'antd-mobile';
import {
    TopBar, Loader, ServiceContext, MessageScreen,
} from 'components';
import { Route } from 'react-router-dom';
import {
    SearchPage, MyRidesPage, NewRidePage,
    YourProfilePage, RideDetailsPage, UserProfilePage,
    RideRequestDetailsPage, RateDriverAndPassengersScreen,
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

const MainPageContent = createReactClass({
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
        services: PropTypes.shape({
            getMyProfileService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
            rideComplainService: PropTypes.func.isRequired,
            rideDeleteService: PropTypes.func.isRequired,
            bookingCancelService: PropTypes.func.isRequired,
        }).isRequired,
        loadProfileData: PropTypes.func.isRequired,
    },

    componentWillMount() {
        this.props.tree.userType.set(getUserType() || 'passenger');
        this.props.accountCursor.set({});

        this.loadProfileData();
    },

    checkUserRights() {
        const checkIfUserCanBeDriver = this.checkIfUserCanBeDriver();

        if (!checkIfUserCanBeDriver.allowed) {
            this.props.tree.userType.set('passenger');
            setUserType('passenger');
        }

        this.props.tree.userType.set(getUserType() || 'passenger');
    },

    loadProfileData() {
        const tree = this.props.tree.get();

        if (!tree) {
            this.props.loadProfileData(this.checkUserRights);

            return;
        }

        const { profile, cars } = this.props.tree.get();

        if (_.isEmpty(profile) || _.isEmpty(cars)
            || profile.status === 'Failure' || cars.status === 'Failure') {
            this.props.loadProfileData(this.checkUserRights);
        }
    },

    checkIfSuggestAndBookingAllowed() {
        const { profile } = this.props.tree.get();
        const {
            firstName, lastName, phone, isPhoneValidated,
        } = profile && profile.data ? profile.data : {};

        if (!firstName || !lastName || !phone) {
            return {
                allowed: false,
                message: 'You should fill your profile: first name, last name and phone number',
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
        const { paypalAccount } = profile && profile.data ? profile.data : {};

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

    showMessage(creationRights, title) {
        Modal.alert(title || 'Create a ride', creationRights.message, [
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
        const userType = userTypeCursor.get() || 'passenger';
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
                                        tree={this.props.tree.search}
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
                                        userPk={profile.data.pk}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/create-ride`}
                                render={(props) => (
                                    <NewRidePage
                                        {..._.merge(this.props, props)}
                                        searchForm={this.props.tree.search.searchForm.get()}
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
                                        onBookRide={(bookRide) => {
                                            const userRights = this.checkIfUserCanBeDriver(userType);

                                            if (!userRights.allowed) {
                                                this.showMessage(userRights, 'Book a ride');

                                                return;
                                            }

                                            bookRide();
                                        }}
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
                                path={`${url}/rate/:pk`}
                                render={(props) => (
                                    <RateDriverAndPassengersScreen
                                        {..._.merge(this.props, props)}
                                        tree={this.props.tree.select('reviews')}
                                        rideCursor={this.props.tree.select('ride', 'ride')}
                                        profile={profile.data}
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
                            <Route
                                path={`${url}/delete-ride/:pk`}
                                render={(props) => (
                                    <MessageScreen
                                        {...props}
                                        tree={this.props.tree.select('deleteTrip')}
                                        title="Delete trip"
                                        buttonLabel="Delete trip"
                                        placeholder="Indicate the reason for canceling the trip"
                                        service={this.props.services.rideDeleteService}
                                        onSuccessMessage="Your trip succefully deleted!"
                                        hydrateData={(pk, data) => ({ cancelReason: data.description })}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/cancel-booking/:pk`}
                                render={(props) => (
                                    <MessageScreen
                                        {...props}
                                        tree={this.props.tree.select('cancelBooking')}
                                        title="Cancel booking"
                                        buttonLabel="Cancel booking"
                                        placeholder="Indicate the reason for canceling the booking"
                                        service={this.props.services.bookingCancelService}
                                        onSuccessMessage="Your booking succefully canceled!"
                                        hydrateData={(pk, data) => ({ cancelReason: data.description })}
                                    />
                                )}
                            />
                            <Route
                                path={`${url}/complain/:pk`}
                                render={(props) => (
                                    <MessageScreen
                                        {...props}
                                        tree={this.props.tree.select('complain')}
                                        title="Complaint"
                                        buttonLabel="Send complaint"
                                        placeholder="Enter text"
                                        service={this.props.services.rideComplainService}
                                        onSuccessMessage="Your complaint succefully sent!"
                                        hydrateData={(pk, data) => ({ ride: pk, description: data.description })}
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

export function MainPage(props) {
    return (
        <ServiceContext.Consumer>
            {(services) => <MainPageContent {...props} services={services} />}
        </ServiceContext.Consumer>
    );
}
