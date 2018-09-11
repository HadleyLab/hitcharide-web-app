import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Flex, TabBar, Modal } from 'antd-mobile';
import { TopBar } from 'components';
import { Route, Redirect } from 'react-router-dom';
import {
    SearchPage, MyRidesPage, CreateRidePage,
    CalendarPage, ProfilePage,
} from 'pages';
import schema from 'libs/state';
import { removeToken } from 'components/utils';
import { getMyProfileService } from 'services';

import searchIcon from './images/search.svg';
import routeIcon from './images/route.svg';
import addIcon from './images/plus.svg';
import calendarIcon from './images/calendar.svg';
import searchIconActive from './images/search-active.svg';
import routeIconActive from './images/route-active.svg';
import addIconActive from './images/plus-active.svg';
import calendarIconActive from './images/calendar-active.svg';
import s from './main.css';

const tabs = [
    {
        title: 'Search a ride',
        path: '/app',
        icon: searchIcon,
        iconActive: searchIconActive,
    },
    {
        title: 'My rides',
        path: '/app/my-rides',
        icon: routeIcon,
        iconActive: routeIconActive,
    },
    {
        title: 'Calendar',
        path: '/app/calendar',
        icon: calendarIcon,
        iconActive: calendarIconActive,
    },
    {
        title: 'Create a ride',
        path: '/app/create-ride',
        icon: addIcon,
        iconActive: addIconActive,
    },
];

const Icon = ({ icon }) => (
    <div
        style={{
            width: '22px',
            height: '22px',
            background: `url(${icon}) center center / 21px 21px no-repeat`,
        }}
    />
);

export const MainPage = createReactClass({
    async componentDidMount() {
        const profile = this.props.tree.profile.get('info');

        if (_.isEmpty(profile)) {
            await getMyProfileService(this.props.tree.profile.info)
        }
    },

    logout() {
        removeToken();
        this.props.tokenCursor.set(null);
        this.props.tree.profile.set({});
    },

    checkIfSignatureHasExpired() {
        const profile = this.props.tree.get('profile');

        if (!_.isEmpty(profile) && !_.isEmpty(profile.info.error)) {
            const error = profile.info.error;

            if (error.response.status === 401) {
                this.logout();
            }
        }
    },

    checkIfRideCreationAllowed() {
        const profile = this.props.tree.profile.get('info');

        if (!_.isEmpty(profile) && !_.isEmpty(profile.data)) {
            const {
                firstName, lastName, phone, isPhoneValidated,
            } = profile.data;

            if (!firstName || !lastName || !phone) {
                return {
                    allowed: false,
                    message: 'Your should fill your profile to create a ride',
                };
            }

            if (!isPhoneValidated) {
                return {
                    allowed: false,
                    message: 'Your should verify your phone number to create a ride',
                };
            }
        }

        return { allowed: true };
    },

    render() {
        const { url } = this.props.match;
        const creationRights = this.checkIfRideCreationAllowed();

        this.checkIfSignatureHasExpired();

        return (
            <Flex direction="column" align="stretch" style={{ height: '100vh' }}>
                <TopBar />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Route
                        exact
                        path={url}
                        render={() => (
                            <SearchPage {...this.props} tree={this.props.tree.select('searchTab')} />
                        )}
                    />
                    <Route
                        path={`${url}/my-rides`}
                        render={() => (
                            <MyRidesPage {...this.props} />
                        )}
                    />
                    <Route
                        path={`${url}/calendar`}
                        render={() => (
                            <CalendarPage {...this.props} />
                        )}
                    />
                    <Route
                        path={`${url}/create-ride`}
                        render={(props) => (
                            <CreateRidePage
                                {..._.merge(this.props, props)}
                                creationRights={creationRights}
                                tree={this.props.tree.select('createRide')}
                            />
                        )}
                    />
                    <Route
                        path={`${url}/profile`}
                        render={(props) => (
                            <ProfilePage
                                {..._.merge(this.props, props)}
                                tree={this.props.tree.select('profile')}
                                logout={this.logout}
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
                                icon={(<Icon icon={tab.icon} />)}
                                selectedIcon={(<Icon icon={tab.iconActive} selected />)}
                                selected={this.props.location.pathname === tab.path}
                                onPress={() => {
                                    if (tab.path === '/app/create-ride') {
                                        if (creationRights.allowed) {
                                            this.props.history.push(tab.path)
                                        } else {
                                            Modal.alert('Create a ride', creationRights.message, [
                                                { text: 'Cancel', onPress: () => null },
                                                {
                                                    text: 'Edit profile',
                                                    onPress: () => this.props.history.push('/app/profile/edit')
                                                },
                                            ]);
                                        }
                                    } else {
                                        this.props.history.push(tab.path)
                                    }
                                }}
                            />
                        ))}
                    </TabBar>
                </div>
            </Flex>
        );
    },
});
