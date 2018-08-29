import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { Button, WingBlank, WhiteSpace, Flex, List, InputItem, LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import { LoginPage, MainPage, RegistrationPage } from 'pages';
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
    render() {
        const tokenCursor = this.props.tree.token;
        const token = tokenCursor.get();

        return (
            <Router>
                <Flex direction="column" align="stretch" justify="center" style={{ height: '100%' }}>
                    <Route
                        path="/"
                        exact
                        render={(props) => {
                            if (!_.isEmpty(token) && token.status === 'Succeed') {
                                return (
                                    <MainPage
                                        tree={this.props.tree.app}
                                        tokenCursor={this.props.tree.token}
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
                                tokenCursor={this.props.tree.token}
                            />
                        )}
                    />

                    <Route
                        path="/registration"
                        render={() => (
                            <RegistrationPage
                                tree={this.props.tree.registration}
                            />
                        )}
                    />
                </Flex>
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
