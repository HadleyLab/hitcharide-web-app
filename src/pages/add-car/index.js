import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Flex, Button, WhiteSpace } from 'antd-mobile';
import { Title, Input } from 'components';
import { validateForm } from 'components/utils';
import schema from 'libs/state';
import * as yup from 'yup';
import s from './add-car.css';

const model = {
    form: {
        brand: '',
        model: '',
        color: '',
        numberOfSeats: null,
        licensePlate: '',
    },
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
    licensePlate: yup.string().ensure().required('Car license plate is a required field.'),
});

export const AddCarPage = schema(model)(createReactClass({
    displayName: 'AddCarPage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            addCarService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
        }),
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
                await getCarListService(this.props.carsCursor)
                this.props.history.goBack();
            }

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }
        }
    },

    render() {
        const { editMode } = this.props;
        const formCursor = this.props.tree.form;

        return (
            <div className={s.container}>
                <Title>Car information</Title>
                <Input onChange={(e) => formCursor.brand.set(e.target.value)}>
                    <div className={s.text}>Brand</div>
                </Input>
                <Input onChange={(e) => formCursor.model.set(e.target.value)}>
                    <div className={s.text}>Model</div>
                </Input>
                <Input onChange={(e) => formCursor.color.set(e.target.value)}>
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
                    onChange={(e) => formCursor.numberOfSeats.set(e.target.value)}
                >
                    <div className={s.text}>Number of seats</div>
                </Input>
                <Input onChange={(e) => formCursor.licensePlate.set(e.target.value)}>
                    <div className={s.text}>License plate</div>
                </Input>
                <WhiteSpace />
                <WhiteSpace />
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
