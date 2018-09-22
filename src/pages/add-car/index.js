import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Flex, Button, WhiteSpace } from 'antd-mobile';
import { Title, Input, Error } from 'components';
import { validateForm, checkInputError } from 'components/utils';
import schema from 'libs/state';
import * as yup from 'yup';
import s from './add-car.css';

const model = {
    form: {},
    result: {},
    errors: {},
};

const validationSchema = yup.object().shape({
    brand: yup.string().ensure().required('Car brand is a required field.'),
    model: yup.string().ensure().required('Car model is a required field.'),
    color: yup.string().ensure().required('Car color is a required field.'),
    numberOfSeats: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Number of seats is a required field.'),
});

export const AddCarPage = schema(model)(createReactClass({
    displayName: 'AddCarPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        carsCursor: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
        }).isRequired,
        editMode: PropTypes.bool,
    },

    contextTypes: {
        services: PropTypes.shape({
            addCarService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
        }),
    },

    getDefaultProps() {
        return {
            editMode: false,
        };
    },

    componentDidMount() {
        this.initForm();
    },

    initForm() {
        const initData = {
            brand: '',
            model: '',
            color: '',
            numberOfSeats: null,
            licensePlate: '',
        };

        this.props.tree.select('form').set(initData);
    },

    async onSubmit() {
        const { addCarService, getCarListService } = this.context.services;
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const result = await addCarService(this.props.tree.result, data);

            if (result.status === 'Succeed') {
                await getCarListService(this.props.carsCursor);

                this.props.history.goBack();
            }

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }
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
            onChange: (e) => {
                formCursor.select(name).set(e.target.value);
                errorsCursor.select(name).set(null);
            },
        }, this.checkInputError(name));
    },

    render() {
        const { editMode } = this.props;

        return (
            <div className={s.container}>
                <Title>Car information</Title>
                <Input {...this.getInputProps('brand')}>
                    <div className={s.text}>Brand</div>
                </Input>
                <Input {...this.getInputProps('model')}>
                    <div className={s.text}>Model</div>
                </Input>
                <Input {...this.getInputProps('color')}>
                    <div className={s.text}>Color</div>
                </Input>
                <Input
                    type="number"
                    onKeyPress={(e) => {
                        const isString = e.which < 48 || e.which > 57;

                        if (isString) {
                            e.preventDefault();
                        }
                    }}
                    {...this.getInputProps('numberOfSeats')}
                >
                    <div className={s.text}>Number of seats</div>
                </Input>
                <Input {...this.getInputProps('licensePlate')}>
                    <div className={s.text}>License plate</div>
                </Input>
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <WhiteSpace />
                <WhiteSpace />
                <Flex justify="center">
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.onSubmit}
                    >
                        {editMode ? 'Save car' : 'Add car'}
                    </Button>
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
            </div>
        );
    },
}));
