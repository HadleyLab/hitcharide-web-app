import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { Button, WingBlank, WhiteSpace, Flex, List, InputItem, LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import { LoginPage, MainPage, RegistrationPage } from 'pages';
import tree from 'libs/tree';
import schema from 'libs/state';
import 'components/styles/styles.less';
import 'components/styles/styles.css';
import 'components/fonts/fonts.css';
import 'components/robots.txt';

const model = {
    tree: {
        token: {
            // data: {
            //     token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0LCJ1c2VybmFtZSI6ImFkbWluQGJzLmNvbSIsImV4cCI6MTUzNTQ0MDI2NiwiZW1haWwiOiJhZG1pbkBicy5jb20ifQ.5WMCIvcSX2YCoqWf4oyf4lD2iBttjcPTmZORuklcuz0'
            // },
            // status: 'Succeed',
        },
        login: {},
        registration: {},
        app: {},
    },
};

const App = schema(model)(createReactClass({
    render() {
        const tokenCursor = this.props.tree.token;
        const token = tokenCursor.get();
        // console.log('token', token);

        // return (
        //     <MainPage tree={this.props.tree.app} />
        // );

        return (
            <Router>
                <Flex direction="column" align="stretch" justify="center" style={{ height: '100%' }}>
                    <Route
                        path="/"
                        exact
                        render={() => {
                            if (!_.isEmpty(token) && token.status === 'Succeed') {
                                return <MainPage tree={this.props.tree.app} />
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
    <Router>
        <LocaleProvider locale={enUS}>
            <App tree={tree} />
        </LocaleProvider>
    </Router>,
    document.getElementById('root')
);
