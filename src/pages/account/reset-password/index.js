import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'antd-mobile';
import { Input, Error } from 'components';
import { validateForm, checkInputError } from 'components/utils';
import schema from 'libs/state';
import * as yup from 'yup';
import { HappinessIcon } from 'components/icons';
import s from '../account.css';

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .ensure()
        .required('Email is a required field')
        .email(),
});

const model = {
    tree: {
        form: {
            email: null,
        },
        result: {},
        errors: {},
    },
};

export const ResetPasswordPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        services: PropTypes.shape({
            resetPasswordService: PropTypes.func.isRequired,
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
            const service = this.props.services.resetPasswordService;
            const result = await service(this.props.tree.result, {
                email: _.toLower(data.email),
            });

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                Modal.alert("We've sent you the email", 'Please check your mailbox.', [
                    {
                        text: 'Ok',
                        onPress: () => this.props.history.push('/account/login'),
                    },
                ]);
            }
        }
    },

    render() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError('email', errorsCursor.get());

        return (
            <div className={classNames(s.content, s._fullScreen)}>
                <div className={s.header}>
                    <div className={s.smiley}>
                        <HappinessIcon color="#97B725" />
                    </div>
                    <div className={s.title}>
                        Don’t worry
                    </div>
                    <div className={s.description}>
                        Just enter your email address.
                        <br />
                        We will send you a reset password link.
                    </div>
                </div>
                <form className={s.form}>
                    <Input
                        className={s.input}
                        onChange={(e) => {
                            formCursor.select('email').set(e.target.value);
                            errorsCursor.select('email').set(null);
                        }}
                        placeholder="E-mail"
                        defaultValue={formCursor.get('email')}
                        {...errorProps}
                    />
                </form>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button
                            type="primary"
                            onClick={this.onSubmit}
                        >
                            Get a reset link
                        </Button>
                    </div>
                    <span className={s.inlineButton}>
                        {'Just kidding. '}
                        <Link to="/account/login">I remembered</Link>
                    </span>
                </div>
            </div>
        );
    },
}));
