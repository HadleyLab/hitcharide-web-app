import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Redirect, Link } from 'react-router-dom';
import { setToken } from 'components/utils';
import sadnessIcon from 'components/icons/sadness.svg';
import s from './social-auth.css';

export const SocialAuthPage = createReactClass({
    propTypes: {
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        location: PropTypes.shape({
            search: PropTypes.string.isRequired,
        }).isRequired,
    },

    async componentDidMount() {
        const { search } = this.props.location;
        const token = _.replace(search, '?token=', '');

        await setToken(token);
        await this.props.tokenCursor.set(token);
    },

    render() {
        return <Redirect to="/app" />;
    },
});

export const SocialAuthErrorPage = createReactClass({
    render() {
        return (
            <div className={s.container}>
                <img src={sadnessIcon} alt="Sadness" />
                Something went wrong
                <Link
                    to="/account/login"
                    className={classNames('am-button', 'am-button-primary', s.button)}
                >
                    Back to sign in
                </Link>
            </div>
        );
    },
});
