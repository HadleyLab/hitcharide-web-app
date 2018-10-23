import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import { Route, Link } from 'react-router-dom';
import { FlatPage, SearchPage } from 'pages';
import { HomeHeader } from './header';
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
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape().isRequired,
        location: PropTypes.shape().isRequired,
    },

    checkIfGuestUser() {
        const { pathname } = this.props.location;

        if (_.startsWith(pathname, '/app') || _.startsWith(pathname, '/account')) {
            return false;
        }

        return true;
    },

    render() {
        const isGuest = this.checkIfGuestUser();
        const token = this.props.tokenCursor.get();

        return (
            <div className={isGuest ? s.container : null}>
                {isGuest ? (
                    <HomeHeader {...this.props} token={token} />
                ) : null}
                <Route
                    path="/"
                    exact
                    render={() => (
                        <div>
                            <HomeIntroSection {...this.props} token={token} />
                            <HomeFooter />
                        </div>
                    )}
                />
                <Route
                    path="/page/:slug"
                    exact
                    render={(props) => (
                        <div>
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
                        <SearchPage
                            {..._.merge(this.props, props)}
                            tree={this.props.tree.app.search}
                            onCreateRide={() => props.history.push('/app/create-ride')}
                            userType="passenger"
                        />
                    )}
                />
            </div>
        );
    },
});
