import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Redirect } from 'react-router-dom';
import { setToken, parseQueryString } from 'components/utils';
import { Button } from 'antd-mobile';
import s from '../account.css';

export const SocialAuthPage = createReactClass({
    propTypes: {
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        location: PropTypes.shape({
            search: PropTypes.string.isRequired,
        }).isRequired,
        reInitServices: PropTypes.func.isRequired,
    },

    componentWillMount() {
        const { search } = this.props.location;
        const searchParams = parseQueryString(search);
        const { token } = searchParams;

        setToken(token);
        this.props.tokenCursor.set(token);
        this.props.reInitServices();
    },

    getRedirectPath() {
      const { search } = this.props.location;
        const searchParams = parseQueryString(search);
        const { next } = searchParams;

        return next ? next : '/app';
    },

    render() {
        const redirectPath = this.getRedirectPath();

        return <Redirect to={redirectPath} />;
    },
});

export const SocialAuthErrorPage = createReactClass({
    propTypes: {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    },

    render() {
        const { history } = this.props;

        return (
            <div className={s.content}>
                <div className={s.description}>
                    {'Something went wrong.'}
                </div>
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button
                            type="primary"
                            onClick={() => history.push('/account/login')}
                        >
                            Back to sign in
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
});
