import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Title, Input } from 'components';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { validateForm } from 'components/utils';
import {
    updateProfileService, verifyPhoneNumberService,
    checkPhoneCodeService,
} from 'services';
import {
    Flex, Button, WhiteSpace, Modal,
} from 'antd-mobile';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import s from './edit.css';

import minusIcon from 'components/icons/minus-circle.svg';
import plusIcon from 'components/icons/plus-circle.svg';
import arrowIcon from 'components/icons/arrow-right.svg';
import tickIcon from 'components/icons/tick-circle.svg';

const model = {
    form: {
        photo: null,
        firstName: '',
        lastName: '',
        // age: null,
        shortDesc: '',
        phone: '',
        email: '',
        paypal: null,
    },
    phoneVerificationCode: null,
    phoneVerificationResult: {},
    result: {},
    errors: {},
};

const validationSchema = yup.object().shape({
    firstName: yup.string().ensure().required('Name is a required field.'),
    lastName: yup.string().ensure().required('Last name is a required field.'),
    // age: yup.number()
    //     .typeError('Wrong format')
    //     .nullable()
    //     .required('Age is a required field.'),
    phone: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Phone is a required field.'),
});

export const EditProfilePage = schema(model)(createReactClass({
    getInitialState() {
        return {
            openCodeModal: false,
        };
    },

    componentDidMount() {
        const formCursor = this.props.tree.form;
        const profile = this.props.profileCursor.get();

        formCursor.set(profile);
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

    updateProfileInfo(data = {}) {
        const profile = this.props.tree.result.get();

        this.props.profileCursor.set(_.merge({}, profile.data || {}, data));
    },

    onProfileSuccessfullyEdited(data) {
        this.setState({ openCodeModal: false });
        this.updateProfileInfo(data);
        this.props.history.goBack();
    },

    async onSubmit() {
        const formCursor = this.props.tree.form;
        const data = formCursor.get();

        const result = await updateProfileService(this.props.tree.result, data);

        if (result.status === 'Succeed') {
            const sendCodeResultCursor = this.props.tree.phoneVerificationResult;
            const sendCodeResult = await verifyPhoneNumberService(sendCodeResultCursor);

            if (sendCodeResult.status === 'Succeed') {
                const oldProfileInfo = this.props.profileCursor.get();

                sendCodeResultCursor.set({});

                if (oldProfileInfo.phone !== data.phone) {
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
                        brand, model: carModel, color, numberOfSeats, licensePlate, pk,
                    } = car;

                    // return (
                    //     <Link
                    //         key={`car-${index}`}
                    //         className={s.car}
                    //         to={`/app/profile/car/${pk}/edit`}
                    //     >
                    //         <div>{`${brand} ${carModel} (${color}, ${numberOfSeats} seats)`}</div>
                    //         <div>{licensePlate}</div>
                    //         <div className={classNames(s.icon, s._arrow)} style={{ backgroundImage: `url(${arrowIcon})` }} />
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
        const cursor = this.props.tree.phoneVerificationCode;

        return (
            <Modal
                visible={this.state.openCodeModal}
                transparent
                maskClosable={false}
                title="Code"
                footer={[
                    {
                        text: 'OK',
                        style: { color: "red" },
                        onPress: async () => {
                            const code = this.props.tree.phoneVerificationCode.get();
                            const result = await checkPhoneCodeService(cursor, { code });

                            if (result.status === 'Succeed') {
                                this.onProfileSuccessfullyEdited({ isPhoneValidated: true });
                            }
                        },
                    },
                    {
                        text: 'Cancel',
                        onPress: () => {
                            this.setState({ openCodeModal: false });
                            this.updateProfileInfo();
                        },
                    },
                ]}
            >
                <div>
                    <input
                        className={s.code}
                        placeholder="__ __ - __ __"
                        onKeyPress={(e) => {
                            const isString = e.which < 48 || e.which > 57;
                            const isFull = this.state.length === 4;

                            if (isString || isFull) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => cursor.set(e.target.value)}
                    />
                    <div className={s.modalFooter}>
                        {`I didn't receive the code. `}
                        <span className={s.link}>Resend</span>
                    </div>
                </div>
            </Modal>
        );
    },

    renderVerificationInfo() {
        const { isPhoneValidated, phone: savedPhone } = this.props.profileCursor.get();

        if (!savedPhone) {
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
                    const cursor = this.props.tree.phoneVerificationResult;
                    const result = await verifyPhoneNumberService(cursor);

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
                    {/*
                    <Input
                        defaultValue={formCursor.age.get()}
                        onChange={(e) => formCursor.age.set(e.target.value)}
                    >
                        <div className={s.text}>Age</div>
                    </Input>
                    */}
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
                            defaultValue={formCursor.paypal.get()}
                            onChange={(e) => formCursor.paypal.set(e.target.value)}
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
