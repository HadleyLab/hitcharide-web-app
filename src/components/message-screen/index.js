import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Title, Error } from 'components';
import warningIcon from 'components/icons/warning.svg';
import { validateForm, checkInputError } from 'components/utils';
import { Button, Modal } from 'antd-mobile';
import * as yup from 'yup';
import s from './message-screen.css';

const validationSchema = yup.object().shape({
    description: yup.string().ensure().required('Required field'),
});

const model = {
    form: {},
    result: {},
    errors: {},
};

export const MessageScreen = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        service: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        buttonLabel: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        onSuccessMessage: PropTypes.string.isRequired,
        match: PropTypes.shape().isRequired,
        history: PropTypes.shape().isRequired,
    },

    componentDidMount() {
        const formCursor = this.props.tree.form;

        formCursor.set({
            description: null,
        });
    },

    async onSubmit() {
        const {
            service, match, history, onSuccessMessage, title,
        } = this.props;
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const result = await service(this.props.tree.result, _.merge({
                ride: match.params.pk,
            }, data));

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                Modal.alert(title, onSuccessMessage, [
                    {
                        text: 'OK',
                        onPress: () => history.goBack(),
                        style: { color: '#4263CA' },
                    },
                ]);
            }
        }
    },

    render() {
        const { title, buttonLabel, placeholder } = this.props;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError('description', errorsCursor.get());

        return (
            <div>
                <Title>{title}</Title>
                <div className={s.message}>
                    <textarea
                        placeholder={placeholder}
                        className={s.textarea}
                        onChange={(e) => {
                            formCursor.description.set(e.target.value);
                            errorsCursor.select('description').set(null);
                        }}
                    />
                    {errorProps.error
                        ? (
                            <div
                                className={s.warningIcon}
                                style={{ backgroundImage: `url(${warningIcon})` }}
                                onClick={errorProps.onErrorClick}
                            />
                        ) : null}
                </div>
                <Error
                    form={formCursor.get()}
                    errors={errorsCursor.get()}
                />
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        onClick={this.onSubmit}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        );
    },
}));
