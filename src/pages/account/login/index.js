import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Redirect, Link } from 'react-router-dom';
import { Button } from 'antd-mobile';
import schema from 'libs/state';
import { Input, Error } from 'components';
import { validateForm, checkInputError, setToken } from 'components/utils';
import * as yup from 'yup';
import googleIcon from 'components/icons/google.svg';
import s from '../account.css';

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .ensure()
        .required('Email is a required field')
        .email(),
    password: yup
        .string()
        .ensure()
        .required('Password is a required field'),
});

const model = {
    tree: {
        form: {
            // email: null,
            // password: null,
            email: 'user@bs.com',
            password: 'k134rf2i',
        },
        result: {},
        errors: {},
    },
};

export const LoginPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        reInitServices: PropTypes.func.isRequired,
        services: PropTypes.shape({
            signInService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async onSubmit() {
        const formCursor = this.props.tree.form;
        const data = formCursor.get();

        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const service = this.props.services.signInService;
            const result = await service(this.props.tree.result, {
                username: data.email,
                password: data.password,
            });

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                const { token } = result.data;

                await setToken(token);
                await this.props.tokenCursor.set(token);
                this.props.reInitServices();
            }
        }
    },

    getInputProps(name) {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError(name, errorsCursor.get());

        return _.merge({
            className: s.input,
            onChange: (e) => {
                formCursor.select(name).set(e.target.value);
                errorsCursor.select(name).set(null);
            },
            defaultValue: formCursor.get(name),
        }, errorProps);
    },

    render() {
        const token = this.props.tokenCursor.get();

        if (token) {
            return <Redirect to="/app" />;
        }

        return (
            <div className={s.content}>
                <form className={s.form}>
                    <Input
                        {...this.getInputProps('email')}
                        placeholder="E-mail"
                    />
                    <Input
                        {...this.getInputProps('password')}
                        type="password"
                        placeholder="Password"
                    />
                </form>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button onClick={this.onSubmit} type="primary">Sign in</Button>
                        <a
                            className={s.googleButton}
                            href="http://localhost:8000/accounts/social/login/google-oauth2/"
                        >
                            <img src={googleIcon} alt="Google" />
                            Sign in with Google+
                        </a>
                    </div>
                    <span className={s.inlineButton}>
                        <Link to="/account/reset-password">Forgot password?</Link>
                    </span>
                    <span className={s.inlineButton}>
                        {"Don't have an account? "}
                        <Link to="/account/registration">Sign up</Link>
                    </span>
                </div>
            </div>
        );
    },
}));
