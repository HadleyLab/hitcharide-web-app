import React from 'react';
import createReactClass from 'create-react-class';
import { Link, Redirect } from 'react-router-dom';
import { Button, WingBlank, WhiteSpace, Flex, List, InputItem, Toast } from 'antd-mobile';
import schema from 'libs/state';
import * as yup from 'yup';
import { signUpService, signInService } from 'services';
import {
    validateForm, checkInputError, checkUnhandledFormErrors, setToken
} from 'components/utils';

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
        .required('Password confirmation is a required field'),
});

const model = {
    tree: {
        form: {
            email: 'test@mail.com',
            password: 'k134rf2i',
            confirmPassword: 'k134rf2i',
        },
        result: {},
        loginResult: {},
        errors: {},
    },
};

const RegistrationForm = createReactClass({
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
            const signUpResult = await signUpService(this.props.tree.result, data);

            console.log('signUpResult', signUpResult);

            if (signUpResult.status === 'Failure') {
                this.props.tree.errors.set(signUpResult.error.data);
            }

            if (signUpResult.status === 'Succeed') {
                const signInResult = await signInService(this.props.tree.loginResult, {
                    username: data.email,
                    password: data.password,
                });

                console.log('signInResult', signInResult);

                if (signInResult.status === 'Succeed') {
                    setToken(signInResult.data);
                    this.props.tokenCursor.set(signInResult);
                }
            }
        }
    },

    getInputProps(name) {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError(name, errorsCursor.get());

        return _.merge({
            labelNumber: 7,
            onChange: (v) => {
                formCursor.select(name).set(v);
                errorsCursor.select(name).set(null);
            },
            defaultValue: formCursor.get(name),
        }, errorProps);
    },

    renderError() {
        const form = this.props.tree.form.get();
        const errors = this.props.tree.errors.get();
        const error = checkUnhandledFormErrors(form, errors);

        if (error) {
            return (
                <WingBlank>
                    {error}
                    <WhiteSpace />
                </WingBlank>
            );
        }

        return null;
    },

    render() {
        const token = this.props.tokenCursor.get();
        const isTokenExists = !_.isEmpty(token) && token.status === 'Succeed';

        if (isTokenExists) {
            return <Redirect to="/" />;
        }

        return (
            <Flex direction="column" align="stretch" justify="center" style={{ height: '100%' }}>
                <Flex align="center" justify="center">
                    Hitcharide
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
                <form>
                    <List renderHeader={() => 'Sign up with email'}>
                        <InputItem {...this.getInputProps('email')}>
                            Email
                        </InputItem>
                        <InputItem type="password" {...this.getInputProps('password')}>
                            Password
                        </InputItem>
                        <InputItem type="password" {...this.getInputProps('confirmPassword')}>
                            Confirm password
                        </InputItem>
                    </List>
                    <WhiteSpace />
                    {this.renderError()}
                    <WingBlank>
                        <Button onClick={this.onSubmit}>Sign up</Button>
                        <WhiteSpace />
                        Already a member? <Link to="/login">Sign in</Link>
                    </WingBlank>
                </form>
            </Flex>
        );
    },
});

export const RegistrationPage = schema(model)(RegistrationForm);
