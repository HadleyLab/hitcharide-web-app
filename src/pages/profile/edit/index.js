import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import { Title, Input } from 'components';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { validateForm } from 'components/utils';
import {
    Flex, Button, WhiteSpace, Modal, Toast,
} from 'antd-mobile';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import plusIcon from 'components/icons/plus-circle.svg';
import tickIcon from 'components/icons/tick-circle.svg';
import s from './edit.css';

const model = {
    form: {
        photo: null,
        firstName: '',
        lastName: '',
        shortDesc: '',
        phone: '',
        paypalAccount: null,
    },
    phoneVerificationCode: '',
    sendPhoneVerificationCodeResult: {},
    checkPhoneVerificationCodeResult: {},
    result: {},
    errors: {},
};

const validationSchema = yup.object().shape({
    firstName: yup.string().ensure().required('Name is a required field.'),
    lastName: yup.string().ensure().required('Last name is a required field.'),
    phone: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Phone is a required field'),
    paypalAccount: yup
        .string()
        .email('Wrong format of a PayPal email account'),
});

export const EditProfilePage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        profileCursor: BaobabPropTypes.cursor.isRequired,
        cars: PropTypes.arrayOf(PropTypes.shape()).isRequired,
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
        }).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            updateProfileService: PropTypes.func.isRequired,
            sendPhoneVerificationCodeService: PropTypes.func.isRequired,
            checkPhoneVerificationCodeService: PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            openCodeModal: false,
        };
    },

    componentDidMount() {
        const formCursor = this.props.tree.form;
        const profile = this.props.profileCursor.get();

        if (_.isEmpty(formCursor.get())) {
            formCursor.set(profile);
        }
    },

    async validateForm() {
        const data = this.props.tree.form.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            this.onSubmit();
        }
    },

    resetCodeRelatedCursors() {
        const { tree } = this.props;

        tree.phoneVerificationCode.set(null);
        tree.sendPhoneVerificationCodeResult.set({});
        tree.checkPhoneVerificationCodeResult.set({});
    },

    updateProfile(data = {}) {
        const profile = this.props.tree.result.get();

        this.props.profileCursor.set(_.merge({}, profile ? profile.data : {}, data));
    },

    onProfileSuccessfullyEdited(data) {
        this.setState({ openCodeModal: false });
        this.updateProfile(data);
        this.resetCodeRelatedCursors();
        this.props.history.goBack();
    },

    async onSubmit() {
        const { updateProfileService, sendPhoneVerificationCodeService } = this.context.services;
        const formCursor = this.props.tree.form;
        const data = formCursor.get();

        const result = await updateProfileService(this.props.tree.result, data);

        if (result.status === 'Succeed') {
            const sendCodeResultCursor = this.props.tree.sendPhoneVerificationCodeResult;
            const sendCodeResult = await sendPhoneVerificationCodeService(sendCodeResultCursor);

            if (sendCodeResult.status === 'Succeed') {
                const oldProfile = this.props.profileCursor.get();

                sendCodeResultCursor.set({});

                if (oldProfile.phone !== data.phone) {
                    this.setState({ openCodeModal: true });
                } else {
                    this.onProfileSuccessfullyEdited();
                }
            }
        }

        if (result.status === 'Failure') {
            this.props.tree.errors.set(result.error.data);
        }
    },

    renderCarsList() {
        const { cars } = this.props;

        return (
            <div className={s.cars}>
                {_.map(cars, (car, index) => {
                    const {
                        brand, model: carModel, color, numberOfSeats, licensePlate,
                    } = car;

                    // return (
                    //     <Link
                    //         key={`car-${index}`}
                    //         className={s.car}
                    //         to={`/app/profile/car/${pk}/edit`}
                    //     >
                    //         <div>{`${brand} ${carModel} (${color}, ${numberOfSeats} seats)`}</div>
                    //         <div>{licensePlate}</div>
                    //         <div
                    //             className={classNames(s.icon, s._arrow)}
                    //             style={{ backgroundImage: `url(${arrowIcon})` }}
                    //         />
                    //     </Link>
                    // );
                    return (
                        <div
                            key={`car-${index}`}
                            className={s.car}
                        >
                            <div>{`${brand} ${carModel} (${color}, ${numberOfSeats} seats)`}</div>
                            <div>{licensePlate}</div>
                        </div>
                    );
                })}
                <Link
                    to="/app/profile/car/add"
                    className={s.addCar}
                >
                    <div className={classNames(s.icon, s._plus)} style={{ backgroundImage: `url(${plusIcon})` }} />
                    <div>Add one</div>
                </Link>
            </div>
        );
    },

    renderPhoneCodeModal() {
        const { sendPhoneVerificationCodeService, checkPhoneVerificationCodeService } = this.context.services;
        const codeCursor = this.props.tree.phoneVerificationCode;
        const resultCursor = this.props.tree.checkPhoneVerificationCodeResult;
        const code = codeCursor.get() || '';
        const phone = this.props.tree.form.phone.get();
        const resultHasError = resultCursor.get() && !_.isEmpty(resultCursor.get())
            && resultCursor.status.get() === 'Failure';

        return (
            <Modal
                visible={this.state.openCodeModal}
                transparent
                maskClosable={false}
                title="Code"
                footer={[
                    {
                        text: 'OK',
                        style: code.length < 4 || resultHasError
                            ? {
                                color: 'rgba(26, 27, 32, .3)',
                                background: 'transparent',
                            } : {},
                        disabled: true,
                        onPress: async () => {
                            if (code.length === 4) {
                                const result = await checkPhoneVerificationCodeService(resultCursor, { code });

                                if (result.status === 'Succeed') {
                                    this.onProfileSuccessfullyEdited({ isPhoneValidated: true });
                                }
                            }
                        },
                    },
                    {
                        text: 'Cancel',
                        onPress: () => {
                            this.setState({ openCodeModal: false });
                            this.updateProfile();
                            this.resetCodeRelatedCursors();
                        },
                    },
                ]}
            >
                <div>
                    <div className={s.modalHeader}>
                        {"We've sent the code to your phone number "}
                        <span style={{ color: '#1A1B20' }}>{phone}</span>
                    </div>
                    <div className={s.codeInputWrapper}>
                        <input
                            className={classNames(s.code, {
                                [s._error]: resultHasError,
                            })}
                            placeholder="— — — —"
                            onKeyPress={(e) => {
                                const isString = e.which < 48 || e.which > 57;
                                const isFull = code && code.length >= 4;

                                if (isString || isFull) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                codeCursor.set(e.target.value);
                                resultCursor.set({});
                            }}
                        />
                        {resultHasError
                            ? <span className={s.errorText}>Wrong code</span>
                            : null
                        }
                    </div>
                    <div className={s.modalFooter}>
                        {"I didn't receive the code. "}
                        <span
                            className={s.link}
                            onClick={async () => {
                                const cursor = this.props.tree.sendPhoneVerificationCodeResult;
                                const result = await sendPhoneVerificationCodeService(cursor);

                                if (result.status === 'Succeed') {
                                    Toast.success('Code successfully sent', 1);
                                }
                            }}
                        >
                            Resend
                        </span>
                    </div>
                </div>
            </Modal>
        );
    },

    renderVerificationInfo() {
        const { isPhoneValidated, phone: savedPhone } = this.props.profileCursor.get();
        const currentPhone = this.props.tree.form.phone.get();
        const { sendPhoneVerificationCodeService } = this.context.services;

        if (!savedPhone || savedPhone !== currentPhone) {
            return null;
        }

        if (isPhoneValidated) {
            return (
                <div className={s.tick} style={{ backgroundImage: `url(${tickIcon})` }} />
            );
        }

        return (
            <div
                className={s.button}
                onClick={async () => {
                    const cursor = this.props.tree.sendPhoneVerificationCodeResult;
                    const result = await sendPhoneVerificationCodeService(cursor);

                    if (result.status === 'Succeed') {
                        this.setState({ openCodeModal: true });
                    }
                }}
            >
                Verification
            </div>
        );
    },

    render() {
        const formCursor = this.props.tree.form;

        return (
            <div>
                <div className={s.photoPicker}>
                    <div className={s.photo}>Photo</div>
                    Change photo
                </div>
                <div className={classNames(s.section, s.general)}>
                    <Title>General</Title>
                    <Input
                        defaultValue={formCursor.firstName.get()}
                        onChange={(e) => formCursor.firstName.set(e.target.value)}
                    >
                        <div className={s.text}>Name</div>
                    </Input>
                    <Input
                        defaultValue={formCursor.lastName.get()}
                        onChange={(e) => formCursor.lastName.set(e.target.value)}
                    >
                        <div className={s.text}>Last name</div>
                    </Input>
                </div>
                <div className={s.moreInfo}>
                    <div className={s.section}>
                        <Title>About you</Title>
                        <Input
                            defaultValue={formCursor.shortDesc.get()}
                            onChange={(e) => formCursor.shortDesc.set(e.target.value)}
                            placeholder="A few words about myself"
                        />
                    </div>
                    <div className={s.section}>
                        <Title>Contacts</Title>
                        <Input
                            defaultValue={formCursor.phone.get()}
                            onChange={(e) => formCursor.phone.set(e.target.value)}
                            placeholder="Phone number"
                        >
                            {this.renderVerificationInfo()}
                        </Input>
                        <Input
                            disabled
                            defaultValue={formCursor.email.get()}
                            onChange={(e) => formCursor.email.set(e.target.value)}
                            placeholder="Email"
                        >
                            <div className={s.tick} style={{ backgroundImage: `url(${tickIcon})` }} />
                        </Input>
                    </div>
                    <div className={s.section}>
                        <Title>Car</Title>
                        {this.renderCarsList()}
                    </div>
                    <div className={s.section}>
                        <Title>PayPal</Title>
                        <Input
                            defaultValue={formCursor.paypalAccount.get()}
                            onChange={(e) => formCursor.paypalAccount.set(e.target.value)}
                            placeholder="PayPal"
                        />
                    </div>
                </div>
                <WhiteSpace />
                <WhiteSpace />
                <WhiteSpace />
                <Flex direction="column" justify="center">
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.validateForm}
                    >
                        Save profile
                    </Button>
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
                <WhiteSpace />
                {this.renderPhoneCodeModal()}
            </div>
        );
    },
}));
