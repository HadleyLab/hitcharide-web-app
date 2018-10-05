import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import classNames from 'classnames';
import { Route, Link } from 'react-router-dom';
import { SearchPage } from 'pages';
import { HomeHeader } from './header';
import { HomeIntroSection } from './intro';
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

        return (
            <div className={isGuest ? s.container : null}>
                {isGuest ? (
                    <HomeHeader {...this.props} />
                ) : null}
                <Route
                    path="/"
                    exact
                    render={() => (
                        <HomeIntroSection {...this.props} />
                    )}
                />
                <Route
                    path="/search"
                    render={(props) => (
                        <SearchPage
                            {..._.merge(this.props, props)}
                            onCreateRide={() => props.history.push('/app/create-ride')}
                            userType="passenger"
                        />
                    )}
                />
            </div>
        );
    },
});
