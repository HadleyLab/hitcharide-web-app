import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router-dom';
import { Button, WingBlank, WhiteSpace, Flex, List, InputItem, Toast } from 'antd-mobile';
import schema from 'libs/state';
import * as yup from 'yup';
import { signUpService } from 'services';
import { validateForm, checkInputError, checkUnhandledFormErrors } from 'components/utils';
import s from './registration.css';

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
            email: 'test4@mail.com',
            password: 'k134rf2i',
            confirmPassword: 'k134rf2i',
        },
        result: {},
        errors: {},
    },
};

const RegistrationForm = createReactClass({
    async onSubmit() {
        const formCursor = this.props.tree.form;
        const formData = formCursor.get();
        const data = _.merge({
            first_name: 'test',
            last_name: 'test',
            phone: '8887776655',
        }, formData);
        // const data = {
        //     first_name: 'test',
        //     last_name: 'test',
        //     phone: '8887776655',
        //     email: 'test4@mail.com',
        //     password: 'k134rf2i',
        // };
        const validationResult = await validateForm(validationSchema, formData);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const result = await signUpService(this.props.tree.result, data);

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
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
        return (
            <Flex direction="column" align="stretch" justify="center" style={{ height: '100%' }}>
                <Flex align="center" justify="center">
                    Hitcharide
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
                <WingBlank>
                    <Button
                        onClick={() => console.log('sign up with google')}
                    >
                        Sign up with Google+
                    </Button>
                </WingBlank>
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
