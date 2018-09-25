import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Route, Link, Redirect } from 'react-router-dom';
import {
    LoginPage, RegistrationPage, ActivateAccountPage,
    SocialAuthPage, SocialAuthErrorPage,
    ResetPasswordPage, SetNewPasswordPage,
} from 'pages';
import themeImage from 'components/images/theme.png';
import logoIcon from 'components/icons/logo.svg';
import s from './account.css';

const AccountMenu = createReactClass({
    propTypes: {
        location: PropTypes.shape({
            pathname: PropTypes.string.isRequired,
        }).isRequired,
    },

    render() {
        const { location } = this.props;
        const isRoot = location.pathname === '/account';

        return (
            <div>
                {isRoot ? (
                    <Redirect to="/account/login" />
                ) : null }
            </div>
        );
    },
});

export const AccountPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
        location: PropTypes.shape({
            pathname: PropTypes.string.isRequired,
        }).isRequired,
    },

    renderLogo() {
        const { location } = this.props;
        const isResetPassword = location.pathname === '/account/reset-password';

        if (isResetPassword) {
            return null;
        }

        return (
            <div className={s.logoWrapper}>
                <Link to="/">
                    <div className={s.logo} style={{ backgroundImage: `url(${logoIcon})` }} />
                </Link>
            </div>
        );
    },

    render() {
        const { tokenCursor } = this.props;
        const { url } = this.props.match;

        return (
            <div className={s.container} style={{ backgroundImage: `url(${themeImage})` }}>

                {this.renderLogo()}

                <Route
                    exect
                    path={url}
                    render={(props) => (
                        <AccountMenu {...props} />
                    )}
                />
                <Route
                    path={`${url}/login`}
                    render={() => (
                        <LoginPage
                            tree={this.props.tree.login}
                            tokenCursor={tokenCursor}
                        />
                    )}
                />

                <Route
                    path={`${url}/registration`}
                    render={(props) => (
                        <RegistrationPage
                            {...props}
                            tree={this.props.tree.registration}
                            tokenCursor={tokenCursor}
                        />
                    )}
                />

                <Route
                    path={`${url}/reset-password`}
                    render={(props) => (
                        <ResetPasswordPage
                            {...props}
                            tree={this.props.tree.resetPassword}
                        />
                    )}
                />

                <Route
                    path={`${url}/new-password/:uid/:token`}
                    render={(props) => (
                        <SetNewPasswordPage
                            {...props}
                            tree={this.props.tree.newPassword}
                        />
                    )}
                />

                <Route
                    path={`${url}/activate/:uid/:token`}
                    render={(props) => (
                        <ActivateAccountPage
                            {...props}
                            tree={this.props.tree.activateAccount}
                        />
                    )}
                />

                <Route
                    path={`${url}/social-auth-success`}
                    render={(props) => (
                        <SocialAuthPage
                            {...props}
                            tokenCursor={tokenCursor}
                        />
                    )}
                />

                <Route
                    path={`${url}/social-auth-error`}
                    render={(props) => <SocialAuthErrorPage {...props} />}
                />
            </div>
        );
    },
});
