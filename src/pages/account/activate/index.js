import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'antd-mobile';
import s from '../account.css';

export const ActivateAccountPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                uid: PropTypes.string.isRequired,
                token: PropTypes.string.isRequired,
            }),
        }).isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        services: PropTypes.shape({
            activateAccountService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            seconds: 5,
        };
    },

    async componentWillMount() {
        const { params } = this.props.match;
        const service = this.props.services.activateAccountService;

        const result = await service(this.props.tree, params);

        if (result.status === 'Succeed') {
            this.startTimer();
        }
    },

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },

    timer: null,

    startTimer() {
        const { history } = this.props;

        this.timer = setInterval(() => {
            const { seconds } = this.state;

            if (seconds !== 0) {
                this.setState({ seconds: seconds - 1 });
            } else {
                clearInterval(this.timer);
                history.push('/account/login');
            }
        }, 1000);
    },

    render() {
        const { seconds } = this.state;
        const { history } = this.props;
        const result = this.props.tree.get();

        if (_.isEmpty(result)) {
            return null;
        }

        if (result.status === 'Succeed') {
            return (
                <div className={s.content}>
                    <div className={s.description}>
                        {'Your account has been successfully activated. '}
                        {"You'll  be redirected to "}
                        <Link to="/account/login" className={s.link}>Sign in</Link>
                        {` through ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`}
                    </div>
                    <div className={s.footer}>
                        <div className={s.buttons}>
                            <Button
                                type="primary"
                                onClick={() => history.push('/account/login')}
                            >
                                Sign in
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={s.content}>
                <div className={s.description}>
                    {'Something went wrong.'}
                    {result.error ? (
                        <div className={s.error}>
                            {result.error.data.detail}
                        </div>
                    ) : null}
                </div>
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button
                            type="primary"
                            onClick={() => history.push('/account/login')}
                        >
                            Sign in
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
});
