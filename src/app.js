import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    BrowserRouter as Router, Route, Redirect,
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
        account: {},
    },
};

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
    },

    render() {
        const tokenCursor = this.props.tree.token;

        return (
            <Router>
                <ServiceContext.Provider value={this.state.services}>
                    <Route
                        path="/"
                        exact
                        render={() => (
                            <HomePage />
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
                                        logout={this.logout}
                                        {...props}
                                    />
                                );
                            }

                            return (
                                <Redirect to="/account/login" />
                            );
                        }}
                    />

                    <Route
                        path="/account"
                        render={(props) => (
                            <AccountPage
                                {...props}
                                tree={this.props.tree.account}
                                tokenCursor={tokenCursor}
                                reInitServices={this.reInitServices}
                            />
                        )}
                    />
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
