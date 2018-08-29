import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Redirect, Link } from 'react-router-dom';
import {
    Button, WingBlank, WhiteSpace, Flex, List, InputItem
} from 'antd-mobile';
import { signInService } from 'services';
import schema from 'libs/state';
import {
    validateForm, checkInputError, checkUnhandledFormErrors, setToken
} from 'components/utils';
import * as yup from 'yup';

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
            email: 'admin@bs.com',
            password: 'k134rf2i',
        },
        result: {},
        errors: {},
    },
};

export const LoginPage = schema(model)(createReactClass({
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
            const result = await signInService(this.props.tree.result, {
                username: data.email,
                password: data.password,
            });

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                setToken(result.data);
                this.props.tokenCursor.set(result);
            }
        }
    },

    getInputProps(name) {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError(name, errorsCursor.get());

        return _.merge({
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
        const formCursor = this.props.tree.form;
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
                <WingBlank>
                    <Button
                        onClick={() => {
                            const auth2 = gapi.auth2.getAuthInstance();

                            auth2.signIn().then((data) => {
                                const tokenData = data.getAuthResponse(true);
                                this.props.tokenCursor.set({
                                    status: 'Succeed',
                                    data: tokenData,
                                })
                                // console.log("data", data.getAuthResponse(true));
                                console.log('User signed in.');
                            });
                        }}
                    >
                        Sign in with Google+
                    </Button>
                </WingBlank>
                <WhiteSpace />
                <WhiteSpace />
                <List renderHeader={() => 'Sign in with email'}>
                    <InputItem {...this.getInputProps('email')}>
                        Email
                    </InputItem>
                    <InputItem type="password" {...this.getInputProps('password')}>
                        Password
                    </InputItem>
                </List>
                <WhiteSpace />
                {this.renderError()}
                <WingBlank>
                    <Button onClick={this.onSubmit}>Sign in</Button>
                    <WhiteSpace />
                    Don't have an account? <Link to="/registration">Sign up</Link>
                </WingBlank>
            </Flex>
        );
    },
}));
