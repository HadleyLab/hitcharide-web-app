import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import { Title, Input, Error } from 'components';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { validateForm, checkInputError } from 'components/utils';
import {
    Button, Modal, Toast, Switch,
} from 'antd-mobile';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import tickIcon from 'components/icons/tick-circle.svg';
import { AddFilledIcon } from 'components/icons';
import warningIcon from 'components/icons/warning.svg';
import minusIcon from 'components/icons/minus-circle.svg';
import arrowIcon from 'components/icons/arrow-right.svg';
import moment from 'moment';
import timezone from 'moment-timezone'; // eslint-disable-line
import { PhoneInput } from './phone-input';
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
    removeCarResult: {},
    errors: {},
};

const validationSchema = yup.object().shape({
    firstName: yup.string().ensure().required('Name is a required field.'),
    lastName: yup.string().ensure().required('Last name is a required field.'),
    phone: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Phone is a required field')
        .test('length', 'Phone must be exactly 11 numbers', (value) => value.toString().length === 11),
    paypalAccount: yup
        .string()
        .nullable()
        .email('Wrong format of a PayPal email account'),
});

export const EditProfilePage = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        profileCursor: BaobabPropTypes.cursor.isRequired,
        carsCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
        }).isRequired,
        services: PropTypes.shape({
            updateProfileService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
            sendPhoneVerificationCodeService: PropTypes.func.isRequired,
            checkPhoneVerificationCodeService: PropTypes.func.isRequired,
            removeCarService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            openCodeModal: false,
            photo: null,
        };
    },

    componentDidMount() {
        const formCursor = this.props.tree.form;
        const profile = this.props.profileCursor.get();

        if (_.isEmpty(formCursor.get())) {
            formCursor.set(profile);
        }
    },

    handleFileChange(files) {
        if (files && files[0]) {
            const reader = new FileReader();

            this.setState({ photo: files[0] });
            reader.onload = (e) => this.props.tree.form.photo.set(e.target.result);
            reader.readAsDataURL(files[0]);
        }
    },

    prepareData() {
        const formCursor = this.props.tree.form;
        const formFields = _.merge({}, formCursor.get(), { timezone: moment.tz.guess() });
        const oldProfile = this.props.profileCursor.get();
        const { photo } = this.state;

        const formData = _.pickBy(formFields, (data, key) => {
            if (oldProfile[key] !== data) {
                return true;
            }

            return false;
        });

        const photoData = photo ? { photo } : {};

        return _.merge(formData, _.pick(formFields, ['firstName', 'lastName', 'phone']), photoData);
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
        const profile = this.props.tree.result.get() || this.props.profileCursor.get();

        this.props.profileCursor.set(_.merge({}, profile ? profile.data : {}, data));
    },

    onProfileSuccessfullyEdited(data) {
        this.setState({ openCodeModal: false, photo: null });
        this.updateProfile(data);
        this.resetCodeRelatedCursors();
        this.props.history.goBack();
    },

    async onSubmit() {
        const { updateProfileService, sendPhoneVerificationCodeService } = this.props.services;
        const formCursor = this.props.tree.form;
        const data = this.prepareData();
        const result = await updateProfileService(this.props.tree.result, data);

        if (result.status === 'Succeed') {
            const oldProfile = this.props.profileCursor.get();

            if (oldProfile.phone !== formCursor.phone.get()) {
                const sendCodeResultCursor = this.props.tree.sendPhoneVerificationCodeResult;
                const sendCodeResult = await sendPhoneVerificationCodeService(sendCodeResultCursor);

                if (sendCodeResult.status === 'Succeed') {
                    sendCodeResultCursor.set({});
                    this.setState({ openCodeModal: true });
                }
            } else {
                this.onProfileSuccessfullyEdited();
            }
        }

        if (result.status === 'Failure') {
            this.props.tree.errors.set(result.error.data);
        }
    },

    checkInputError(name) {
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError(name, errorsCursor.get());

        return errorProps;
    },

    getInputProps(name) {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;

        return _.merge({
            defaultValue: formCursor.select(name).get(),
            onChange: (e) => {
                formCursor.select(name).set(e.target.value);
                errorsCursor.select(name).set(null);
            },
        }, this.checkInputError(name));
    },

    getSwitchProps(name) {
        const formCursor = this.props.tree.form;

        return {
            checked: formCursor.select(name).get(),
            onChange: (checked) => formCursor.select(name).set(checked),
        };
    },

    async removeCar(pk) {
        const { removeCarService, getCarListService } = this.props.services;
        const result = await removeCarService(this.props.tree.removeCarResult, pk);

        if (result.status === 'Succeed') {
            await getCarListService(this.props.carsCursor);
        }

        if (result.status === 'Failure') {
            Modal.alert('Removing car error', result.error.data.detail,
                [
                    {
                        text: 'OK',
                        style: { color: '#4263CA' },
                    },
                ]);
        }
    },

    renderCarsList() {
        const cars = this.props.carsCursor.get('data');

        return (
            <div className={s.cars}>
                {_.map(cars, (car, index) => {
                    const {
                        brand, model: carModel, numberOfSeats,
                        licensePlate, productionYear, color, pk,
                    } = car;

                    return (
                        <div
                            key={`car-${index}`}
                            className={s.car}
                        >
                            <div
                                className={s.deleteIcon}
                                style={{ backgroundImage: `url(${minusIcon})` }}
                                onClick={() => {
                                    Modal.alert('Remove car',
                                        `You are going to remove ${brand} ${carModel}. Are you sure?`,
                                        [
                                            {
                                                text: 'YES',
                                                onPress: () => this.removeCar(pk),
                                                style: { color: '#4263CA' },
                                            },
                                            {
                                                text: 'NO',
                                                style: { color: '#4263CA' },
                                            },
                                        ]);
                                }}
                            />
                            <Link className={s.carInfo} to={`/app/profile/car/${pk}/edit`}>
                                <div>
                                    {`${brand} ${carModel} `}
                                    {`(${color}, ${numberOfSeats} seats`}
                                    {productionYear ? `, ${productionYear} year)` : ')'}
                                </div>
                                {licensePlate ? <div className={s.licensePlate}>{licensePlate}</div> : null}
                                <div
                                    className={classNames(s.icon, s._arrow)}
                                    style={{ backgroundImage: `url(${arrowIcon})` }}
                                />
                            </Link>
                        </div>
                    );
                })}
                <Link
                    to="/app/profile/car/add"
                    className={s.addCar}
                >
                    <div className={classNames(s.icon, s._plus)}>
                        <AddFilledIcon />
                    </div>
                    <div>Add auto</div>
                </Link>
            </div>
        );
    },

    renderPhoneCodeModal() {
        const { sendPhoneVerificationCodeService, checkPhoneVerificationCodeService } = this.props.services;
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
                        <span style={{ color: '#1A1B20' }}>+{phone}</span>
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
        const { sendPhoneVerificationCodeService } = this.props.services;

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

    renderAboutInput() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = this.checkInputError('shortDesc');

        return (
            <div className={s.section}>
                <Title>About you</Title>
                <div className={s.about}>
                    <textarea
                        placeholder="A few words about yourself"
                        className={s.aboutInput}
                        onChange={(e) => {
                            formCursor.description.set(e.target.value);
                            errorsCursor.select('shortDesc').set(null);
                        }}
                    />
                    {errorProps.error
                        ? (
                            <div
                                className={s.warning}
                                style={{ backgroundImage: `url(${warningIcon})` }}
                                onClick={errorProps.onErrorClick}
                            />
                        ) : null}
                </div>
            </div>
        );
    },

    renderPhoto() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const photo = formCursor.get('photo');
        const errorProps = this.checkInputError('photo');

        return (
            <div className={classNames(s.section, s._photo)}>
                <Title>Photo</Title>
                <div
                    className={classNames(s.photoPicker, {
                        [s._empty]: !photo,
                    })}
                >
                    <div
                        className={s.photo}
                        style={{ backgroundImage: photo ? `url(${photo})` : null }}
                    />
                    <input
                        className={s.photoInput}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            errorsCursor.select('photo').set(null);
                            this.handleFileChange(e.target.files);
                        }}
                    />
                </div>
                {errorProps.error
                    ? (
                        <div
                            className={s.warning}
                            style={{ backgroundImage: `url(${warningIcon})` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                errorProps.onErrorClick();
                            }}
                        />
                    ) : null}
            </div>
        );
    },

    renderNotifications() {
        const { isPhoneValidated } = this.props.profileCursor.get();

        return (
            <div>
                <div className={s.notificationsRow}>
                    <div className={s.notificationsTitle}>
                        SMS notification
                    </div>
                    <Switch
                        color="#97B725"
                        disabled={!isPhoneValidated}
                        {...this.getSwitchProps('smsNotifications')}
                    />
                </div>
                {!isPhoneValidated
                    ? (
                        <div className={s.notificationsText}>
                            Before enabling notifications, please save your profile changes and verify phone number.
                        </div>
                    ) : null}
            </div>
        );
    },

    render() {
        const { phone } = this.props.tree.form.get() || '';

        return (
            <div>
                <div className={classNames(s.section, s.general)}>
                    <Title>General</Title>
                    <Input {...this.getInputProps('firstName')}>
                        <div className={s.text}>Name</div>
                    </Input>
                    <Input {...this.getInputProps('lastName')}>
                        <div className={s.text}>Last name</div>
                    </Input>
                </div>
                {this.renderPhoto()}
                <div className={s.moreInfo}>
                    {this.renderAboutInput()}
                    <div className={s.section}>
                        <Title>Contacts</Title>
                        <PhoneInput
                            {...this.getInputProps('phone')}
                            onKeyPress={(e) => {
                                const isString = e.which < 48 || e.which > 57;
                                const isFull = phone && phone.length >= 11;

                                if (isString || isFull) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="Phone number"
                            phoneValue={phone}
                        >
                            {this.renderVerificationInfo()}
                        </PhoneInput>
                        <Input
                            {...this.getInputProps('email')}
                            disabled
                            placeholder="Email"
                        >
                            <div className={s.tick} style={{ backgroundImage: `url(${tickIcon})` }} />
                        </Input>
                    </div>
                    <div className={s.section}>
                        <Title>Notifications</Title>
                        {this.renderNotifications()}
                    </div>
                    <div className={s.section}>
                        <Title>Car</Title>
                        {this.renderCarsList()}
                    </div>
                    <div className={s.section}>
                        <Title>PayPal</Title>
                        <Input
                            {...this.getInputProps('paypalAccount')}
                            placeholder="PayPal"
                        />
                    </div>
                </div>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.validateForm}
                    >
                        Save profile
                    </Button>
                </div>
                {this.renderPhoneCodeModal()}
            </div>
        );
    },
}));
