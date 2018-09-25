import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Button, Modal } from 'antd-mobile';
import { Input, Error } from 'components';
import { validateForm, checkInputError } from 'components/utils';
import schema from 'libs/state';
import * as yup from 'yup';
import s from '../account.css';

const validationSchema = yup.object().shape({
    newPassword: yup
        .string()
        .ensure()
        .required('Password is a required field')
        .min(3, 'Password must be at least 3 characters'),
    newPasswordConfirm: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], "Passwords don't match")
        .ensure()
        .required('Confirm password is a required field'),
});

const model = {
    tree: {
        form: {
            newPassword: null,
            newPasswordConfirm: null,
        },
        result: {},
        errors: {},
    },
};

export const SetNewPasswordPage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                uid: PropTypes.string.isRequired,
                token: PropTypes.string.isRequired,
            }),
        }).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            setNewPasswordService: PropTypes.func.isRequired,
        }),
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
            const { params } = this.props.match;
            const service = this.context.services.setNewPasswordService;
            const result = await service(this.props.tree.result,
                _.merge({}, params, _.pick(data, 'newPassword')));

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                Modal.alert('Reset password', 'Your password successfully changed', [
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
        return (
            <div className={s.content}>
                <form className={s.form}>
                    <Input
                        {...this.getInputProps('newPassword')}
                        type="password"
                        placeholder="New password"
                    />
                    <Input
                        {...this.getInputProps('newPasswordConfirm')}
                        type="password"
                        placeholder="Confirm new password"
                    />
                </form>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.footer}>
                    <div className={s.buttons}>
                        <Button onClick={this.onSubmit} type="primary">
                            Sumbit new password
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
}));
