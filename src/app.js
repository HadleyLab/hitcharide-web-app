import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import {
    HashRouter as Router, Route, Redirect,
} from 'react-router-dom';
import { LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import {
    LoginPage, MainPage, RegistrationPage, HomePage,
} from 'pages';
import tree from 'libs/tree';
import schema from 'libs/state';
import { getToken } from 'components/utils';
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

const App = schema(model)(createReactClass({
    displayName: 'App',

    render() {
        const tokenCursor = this.props.tree.token;

        return (
            <Router>
                <div>
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
                                        {...props}
                                    />
                                );
                            }

                            return (
                                <Redirect to="/login" />
                            );
                        }}
                    />

                    <Route
                        path="/login"
                        render={() => (
                            <LoginPage
                                tree={this.props.tree.login}
                                tokenCursor={tokenCursor}
                            />
                        )}
                    />

                    <Route
                        path="/registration"
                        render={(props) => (
                            <RegistrationPage
                                {...props}
                                tree={this.props.tree.registration}
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
