import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Redirect } from 'react-router-dom';
import { setToken } from 'components/utils';
import { Button } from 'antd-mobile';
import s from '../account.css';

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
