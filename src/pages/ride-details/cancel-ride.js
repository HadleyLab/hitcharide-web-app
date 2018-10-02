import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import { Title, Error } from 'components';
import warningIcon from 'components/icons/warning.svg';
import { validateForm, checkInputError } from 'components/utils';
import { Button } from 'antd-mobile';
import * as yup from 'yup';
import s from './ride-details.css';

const validationSchema = yup.object().shape({
    reason: yup.string().ensure().required('Indicate the reason for canceling the trip'),
});

const model = {
    form: {},
    result: {},
    errors: {},
};

export const CancelRidePage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape().isRequired,
    },

    componentDidMount() {
        const formCursor = this.props.tree.form;

        formCursor.set({
            reason: null,
        });
    },

    async onSubmit() {
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            // return;
        }

        // if (isDataValid) {
        //     const result = await createRideService(this.props.tree.result, data);
        //
        //     if (result.status === 'Failure') {
        //         this.props.tree.errors.set(result.error.data);
        //     }
        //
        //     if (result.status === 'Succeed') {
        //     }
        // }
    },

    render() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError('reason', errorsCursor.get());
        const { type } = this.props.match.params;
        const isDelete = type === 'delete';

        return (
            <div className={s.section}>
                <Title>
                    {isDelete ? 'Delete trip' : 'Cancel booking'}
                </Title>
                {/*
                <div style={{ fontSize: 12, lineHeight: 12, color: '#aaa' }}>Will be implemented soon</div>
                */}
                <div className={s.reason}>
                    <textarea
                        placeholder="Indicate the reason for canceling the trip"
                        className={s.textarea}
                        onChange={(e) => {
                            formCursor.reason.set(e.target.value);
                            errorsCursor.select('reason').set(null);
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
                <div className={s.footer}>
                    <Error
                        form={formCursor.get()}
                        errors={errorsCursor.get()}
                    />
                    <Button
                        type="primary"
                        inline
                        onClick={this.onSubmit}
                    >
                        {isDelete ? 'Delete trip' : 'Cancel booking'}
                    </Button>
                </div>
            </div>
        );
    },
}));
