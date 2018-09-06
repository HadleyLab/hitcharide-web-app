import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Link } from 'react-router-dom';
import { Search, Title, Input } from 'components';
import schema from 'libs/state';
import {
    Flex, NavBar, WingBlank, Button, List, DatePicker, WhiteSpace,
} from 'antd-mobile';
import { getCitiesService, addRideService } from 'services';
import { validateForm, getToken } from 'components/utils';
import * as yup from 'yup';
import s from './create-ride.css';

// const data = {
//     city_from: "city_pk",
//     city_to: "city_pk",
//     date: "date",
//     priceForSeat: float,
//     stops: ['achinsk_pk', 'kemerovo_pk'],
//     number_of_sits: number,
//     car: 'car_pk',
//     description: "",
// };

const validationSchema = yup.object().shape({
    from: yup.mixed().required('Select a city'),
    to: yup.mixed().required('Select a city'),
    date: yup.date(new Date()),
    price: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Add price for a seat'),
    car: yup.object().shape({
        model: yup.string().ensure().required('Add car model'),
        availableSeats: yup.number()
            .typeError('Wrong format')
            .nullable()
            .required('Add number of available seats in the car'),
    }),
    description: yup.string().ensure().required('Add notes about this ride'),
});

const model = {
    cities: {},
    form: {},
    result: {},
    errors: {},
};

export const CreateRidePage = schema(model)(createReactClass({
    displayName: 'CreateRidePage',

    getInitialState() {
        return {};
    },

    componentDidMount() {
        this.initForm();
    },

    initForm() {
        const initData = {
            from: null,
            to: null,
            date: new Date(),
            price: null,
            car: {
                model: null,
                availableSeats: null,
            },
            description: null,
        };

        this.props.tree.select('form').set(initData);
    },

    async onSubmit() {
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        console.log('validationResult', validationResult);

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const token = getToken();
            const result = await addRideService(token.data.token, this.props.tree.result, {
                from_city: data.from,
                to_city: data.to,
                car: {
                    brand: 'test',
                    model: data.car.model,
                    number_of_sits: data.car.availableSeats,
                },
                stops: [],
                number_of_sits: data.car.availableSeats,
                description: data.description,
            });

            console.log('result', result);

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }
        }
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;

        console.log('form', this.props.tree.get());

        return (
            <div className={s.container}>
                <div className={s.section}>
                    <Title>Ride information</Title>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('from')}
                        valueCursor={formCursor.from}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.from.set(v)}
                    >
                        <div className={s.text}>From</div>
                    </Search>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('to')}
                        valueCursor={formCursor.to}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => formCursor.to.set(v)}
                    >
                        <div className={s.text}>To</div>
                    </Search>
                    <List className={s.datePicker} style={{ backgroundColor: 'white' }}>
                        <DatePicker
                            value={new Date()}
                            onChange={(date) => formCursor.date.set(date)}
                            use12Hours
                            title="When"
                        >
                            <List.Item arrow="horizontal">When</List.Item>
                        </DatePicker>
                    </List>
                    <Input
                        type="number"
                        className={s.inputWithIcon}
                        onKeyPress={(e) => {
                            const isString = e.which < 48 || e.which > 57;
                            const isDot = e.which === 46;

                            if (isString && !isDot) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => formCursor.price.set(e.target.value)}
                    >
                        <div className={s.text}>Price for seat</div>
                        <div className={s.icon}>$</div>
                    </Input>
                </div>
                <div className={s.section}>
                    <Title>Stop overs</Title>
                </div>
                <div className={s.section}>
                    <Title>Car</Title>
                    <Input onChange={(e) => formCursor.car.model.set(e.target.value)}>
                        <div className={s.text}>Model</div>
                    </Input>
                    <Input
                        type="number"
                        onKeyPress={(e) => {
                            const isString = e.which < 48 || e.which > 57;

                            if (isString) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => formCursor.car.availableSeats.set(e.target.value)}
                    >
                        <div className={s.text}>Available seats</div>
                    </Input>
                </div>
                <div className={s.section}>
                    <Title>Notes</Title>
                    <textarea
                        placeholder="Enter text"
                        className={s.notes}
                        onChange={(e) => formCursor.description.set(e.target.value)}
                    />
                </div>
                <WhiteSpace />
                <WhiteSpace />
                <Flex justify="center">
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.onSubmit}
                    >
                        Create a ride
                    </Button>
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
            </div>
        );
    },
}));
