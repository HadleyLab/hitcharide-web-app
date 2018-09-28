import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Link, Redirect } from 'react-router-dom';
import { Button, Modal } from 'antd-mobile';
import schema from 'libs/state';
import * as yup from 'yup';
import { validateForm, checkInputError } from 'components/utils';
import { Input, Error } from 'components';
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
        .required('Password is a required field')
        .min(3, 'Password must be at least 3 characters'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], "Passwords don't match")
        .ensure()
        .required('Confirm password is a required field'),
});

const model = {
    tree: {
        form: {
            email: null,
            password: null,
            confirmPassword: null,
            // email: 'user@bs.com',
            // password: 'k134rf2i',
            // confirmPassword: 'k134rf2i',
        },
        result: {},
        errors: {},
    },
};

export const RegistrationPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        services: PropTypes.shape({
            signUpService: PropTypes.func.isRequired,
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
            const service = this.props.services.signUpService;
            const result = await service(this.props.tree.result, data);

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                Modal.alert("We've sent you the email", 'Please confirm your email address to sign in', [
                    {
                        text: 'Ok',
                        onPress: () => this.props.history.push('/account/login'),
                    },
                ]);
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
                    <Input
                        {...this.getInputProps('confirmPassword')}
                        type="password"
                        placeholder="Confirm password"
                    />
                </form>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button onClick={this.onSubmit} type="primary">Sign up</Button>
                    </div>
                    <span className={s.inlineButton}>
                        {'Already a member? '}
                        <Link to="/account/login">Sign in</Link>
                    </span>
                </div>
            </div>
        );
    },
}));
