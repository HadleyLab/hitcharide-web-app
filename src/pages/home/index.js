import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import { Route, Link, Redirect } from 'react-router-dom';
import { FlatPage, SearchPage } from 'pages';
import { TopBar } from 'components';
import { HomeIntroSection } from './intro';
import { HomeFooter } from './footer';
import s from './home.css';

export const Button = ({ to, className, children }) => (
    <Link to={to} className={classNames(s.button, className)}>{children}</Link>
);

Button.propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string.isRequired,
    className: PropTypes.string,
};

Button.defaultProps = {
    className: null,
};

export const HomePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        searchCursor: BaobabPropTypes.cursor.isRequired,
        userTypeCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        location: PropTypes.shape().isRequired,
    },

    renderTopBar() {
        const userTypeCursor = this.props.userTypeCursor;

        return (
            <TopBar
                {...this.props}
                userTypeCursor={userTypeCursor}
                checkUserRights={() => ({ allowed: true })}
                isAuthenticated={false}
            />
        )
    },

    render() {
        const token = this.props.tokenCursor.get();
        const userTypeCursor = this.props.userTypeCursor;

        return (
            <div>
                <Route
                    path="/"
                    exact
                    render={() => {
                        if (token) {
                            return <Redirect to="/app" />;
                        }

                        return (
                            <div className={classNames(s.rootContainer, s._root)}>
                                {this.renderTopBar()}
                                <HomeIntroSection
                                    {...this.props}
                                    token={token}
                                    userTypeCursor={userTypeCursor}
                                    tree={this.props.searchCursor}
                                />
                                <HomeFooter />
                            </div>
                        )
                    }}
                />
                <Route
                    path="/page/:slug"
                    exact
                    render={(props) => (
                        <div className={s.container}>
                            {this.renderTopBar()}
                            <FlatPage
                                {..._.merge(this.props, props)}
                                tree={this.props.tree.flatpage}
                            />
                        </div>
                    )}
                />
                <Route
                    path="/search"
                    render={(props) => (
                        <div className={s.container}>
                            {this.renderTopBar()}
                            <SearchPage
                                {..._.merge(this.props, props)}
                                tree={this.props.tree.app.search}
                                onCreateRide={() => props.history.push('/app/create-ride')}
                                userType={userTypeCursor.get()}
                            />
                        </div>
                    )}
                />
            </div>
        );
    },
});
