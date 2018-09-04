import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Flex, TabBar, NavBar } from 'antd-mobile';
import schema from 'libs/state';
import { getToken } from 'components/utils';
import { Route, Link } from 'react-router-dom';
import { SearchPage, MyRidesPage, ProfilePage, CreateRidePage } from 'pages';

import searchIcon from './images/search.svg';
import routeIcon from './images/route.svg';
import profileIcon from './images/user.svg';
import searchIconActive from './images/search-active.svg';
import routeIconActive from './images/route-active.svg';
import profileIconActive from './images/user-active.svg';

const tabs = [
    {
        title: 'Search',
        name: 'searchTab',
        path: '/search',
        icon: searchIcon,
        iconActive: searchIconActive,
        renderComponent: (props) => <SearchPage {...props} tree={props.tree.select('searchTab')} />,
    },
    {
        title: 'My Rides',
        name: 'ridesTab',
        path: '/my-rides',
        icon: routeIcon,
        iconActive: routeIconActive,
        renderComponent: (props) => <MyRidesPage {...props} />,
    },
    {
        title: 'Profile',
        name: 'profileTab',
        path: '/profile',
        icon: profileIcon,
        iconActive: profileIconActive,
        renderComponent: (props) => <ProfilePage {...props} />,
    },
];

const Icon = ({ icon }) => (
    <div
        style={{
            width: '22px',
            height: '22px',
            background: `url(${icon}) center center /  21px 21px no-repeat`,
        }}
    />
);

const model = {
    tree: {
        profile: {},
    },
};

export const MainPage = schema(model)(createReactClass({
    getInitialState() {
        return {
            selectedTab: 'searchTab',
        };
    },

    render() {
        return (
            <Flex direction="column" align="stretch" justify="center" style={{ height: '100%' }}>

                <TabBar
                    unselectedTintColor="#949494"
                    tintColor="#33A3F4"
                    barTintColor="white"
                >
                    {_.map(tabs, (tab, index) => (
                        <TabBar.Item
                            title={tab.title}
                            key={`tab-${index}`}
                            icon={(<Icon icon={tab.icon} />)}
                            selectedIcon={(<Icon icon={tab.iconActive} selected />)}
                            selected={this.state.selectedTab === tab.name}
                            onPress={() => {
                                this.setState({ selectedTab: tab.name });
                            }}
                        >
                            <NavBar
                                mode="dark"
                                leftContent="Hitcharide"
                                rightContent={(<Link to="/create-ride" style={{ whiteSpace: 'nowrap', fontSize: '14px', color: '#fff' }}>+ Create a ride</Link>)}
                                // rightContent={(<Button size="small">+ Create a ride</Button>)}
                            />
                            {tab.renderComponent(this.props)}
                        </TabBar.Item>
                    ))}
                </TabBar>
            </Flex>
        );
    },
}));
