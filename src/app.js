import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import { LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import { MainPage, HomePage, AccountPage } from 'pages';
import tree from 'libs/tree';
import schema from 'libs/state';
import { ServiceContext } from 'components';
import { getToken, removeToken } from 'components/utils';
import services from 'services';
import 'components/styles/styles.less';
import 'components/styles/styles.css';
import 'components/fonts/fonts.css';
import 'components/robots.txt';

const model = {
    tree: {
        token: getToken(),
        app: {},
        flatpage: {},
        account: {},
    },
};

const AuthorizedApp = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        services: PropTypes.shape({
            getCarListService: PropTypes.func.isRequired,
            getMyProfileService: PropTypes.func.isRequired,
        }).isRequired,
        logout: PropTypes.func.isRequired,
    },

    componentDidMount() {
        this.loadProfileData();
    },

    async loadProfileData(onLoad) {
        const { getMyProfileService, getCarListService } = this.props.services;

        await getMyProfileService(this.props.tree.app.profile);
        await getCarListService(this.props.tree.app.cars);

        if (onLoad) {
            onLoad();
        }
    },

    render() {
        const { tokenCursor } = this.props;

        return (
            <div>
                <Route
                    path="/"
                    render={(props) => (
                        <HomePage
                            {...props}
                            tree={this.props.tree}
                            tokenCursor={tokenCursor}
                            logout={this.props.logout}
                            services={this.props.services}
                        />
                    )}
                />

                <Route
                    path="/app"
                    render={(props) => {
                        if (tokenCursor.get()) {
                            return (
                                <MainPage
                                    tree={this.props.tree.app}
                                    tokenCursor={tokenCursor}
                                    accountCursor={this.props.tree.account}
                                    logout={this.props.logout}
                                    loadProfileData={this.loadProfileData}
                                    {...props}
                                />
                            );
                        }

                        return (
                            <Redirect to="/account/login" />
                        );
                    }}
                />
            </div>
        );
    },
});

const App = schema(model)(createReactClass({
    displayName: 'App',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            services: this.initServices(),
        };
    },

    initServices() {
        const token = this.props.tree.token.get();
        let initializedServices = {};

        _.each(services, (service, name) => {
            initializedServices[name] = service(this.checkIfTokenExpired, token);
        });

        return initializedServices;
    },

    reInitServices() {
        this.setState({ services: this.initServices() });
    },

    checkIfTokenExpired(response) {
        if (response.status === 401) {
            this.logout();
        }
    },

    logout() {
        removeToken();
        this.props.tree.token.set(null);
        this.props.tree.app.set({});
    },

    render() {
        const tokenCursor = this.props.tree.token;

        return (
            <Router>
                <ServiceContext.Provider value={this.state.services}>
                    <Switch>
                        <Route
                            path="/account"
                            render={(props) => (
                                <AccountPage
                                    {...props}
                                    tree={this.props.tree.account}
                                    tokenCursor={tokenCursor}
                                    services={this.state.services}
                                    reInitServices={this.reInitServices}
                                />
                            )}
                        />
                        <Route
                            path="/"
                            render={(props) => (
                                <AuthorizedApp
                                    {...props}
                                    tree={this.props.tree}
                                    tokenCursor={tokenCursor}
                                    services={this.state.services}
                                    logout={this.logout}
                                />
                            )}
                        />
                    </Switch>
                </ServiceContext.Provider>
            </Router>
        );
    },
}));

ReactDOM.render(
    <LocaleProvider locale={enUS}>
        <App tree={tree} />
    </LocaleProvider>,
    document.getElementById('root')
);
