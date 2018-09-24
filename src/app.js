import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    HashRouter as Router, Route, Redirect,
} from 'react-router-dom';
import { LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import { MainPage, HomePage, AccountPage } from 'pages';
import tree from 'libs/tree';
import schema from 'libs/state';
import { getToken, removeToken } from 'components/utils';
import services from 'services';
import 'components/styles/styles.less';
import 'components/styles/styles.css';
import 'components/fonts/fonts.css';
import 'components/robots.txt';

const model = {
    tree: {
        token: getToken(),
        login: {},
        registration: {},
        app: {},
    },
};

function initServices(statusHandler) {
    let initializedServices = {};

    _.each(services, (service, name) => {
        initializedServices[name] = service(statusHandler);
    });

    return initializedServices;
}

let servicesShape = {};

_.each(services, (service, name) => {
    servicesShape[name] = PropTypes.func.isRequired;
});

const App = schema(model)(createReactClass({
    displayName: 'App',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    childContextTypes: {
        services: PropTypes.shape(servicesShape),
    },

    getChildContext() {
        return {
            services: initServices((response) => {
                if (response.status === 401) {
                    this.logout();
                }
            }),
        };
    },

    logout() {
        removeToken();
        this.props.tree.token.set(null);
    },

    render() {
        const tokenCursor = this.props.tree.token;

        return (
            <Router>
                <div style={{ height: '100%' }}>
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
                                tree={this.props.tree}
                                tokenCursor={tokenCursor}
                            />
                        )}
                    />
                </div>
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
