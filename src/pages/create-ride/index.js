import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Search, Title, Input } from 'components';
import schema from 'libs/state';
import {
    Flex, Button, List, DatePicker, WhiteSpace, Picker,
} from 'antd-mobile';
import { getCitiesService, addRideService, getCarListService } from 'services';
import { validateForm, getToken } from 'components/utils';
import * as yup from 'yup';
import s from './create-ride.css';

import minusIcon from 'components/icons/minus-circle.svg';
import plusIcon from 'components/icons/plus-circle.svg';

// const data = {
//     city_from: "city_pk",
//     city_to: "city_pk",
//     date: "date",
//     priceForSeat: float,
//     stops: [{city: ’achinsk_pk’, order: 1},{city: 'kemerovo_pk’, order:2}],
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
        model: yup.number().typeError('Wrong format').nullable().required('Select a car'),
        availableSeats: yup.number()
            .typeError('Wrong format')
            .nullable()
            .required('Add number of available seats in the car'),
    }),
    description: yup.string().ensure().required('Add notes about this ride'),
});

const model = () => {
    const token = getToken();

    return {
        cities: {},
        cars: (cursor) => getCarListService(token.data.token, cursor),
        form: {},
        result: {},
        errors: {},
    };
};

export const CreateRidePage = schema(model)(createReactClass({
    displayName: 'CreateRidePage',

    getInitialState() {
        return {};
    },

    async componentDidMount() {
        const token = getToken();
        const cars = this.props.tree.get('cars');

        this.initForm();

        if (_.isEmpty(cars)) {
            const result = await getCarListService(token.data.token, this.props.tree.cars);

            if (result.status === 'Succeed' && !_.isEmpty(result.data)) {
                const car = result.data[0];
                const formCursor = this.props.tree.form;

                formCursor.car.model.set(car.pk);
            }
        }
    },

    initForm() {
        const initData = {
            from: null,
            to: null,
            date: new Date(),
            price: null,
            stops: [],
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
                cityFrom: data.from.pk,
                cityTo: data.to.pk,
                car: data.car.model,
                stops: _.map(data.stops, (stop, index) => ({
                    city: stop.pk,
                    order: index,
                })),
                dateTime: data.date,
                price: data.price,
                numberOfSeats: data.car.availableSeats,
                description: data.description,

            });

            console.log('result', result);

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }
        }
    },

    renderCarPicker() {
        const cars = this.props.tree.cars.get();
        const formCursor = this.props.tree.form;
        let pickerData = [];

        if (!_.isEmpty(cars) && cars.status === 'Succeed' && !_.isEmpty(cars.data)) {
            _.forEach(cars.data, (car) => pickerData.push({
                value: car.pk,
                label: `${car.brand} ${car.model} (Black)`,
            }));

            return (
                <div className={s.carPicker}>
                    <List>
                        <Picker
                            data={pickerData}
                            cols={1}
                            value={[formCursor.car.model.get()]}
                            onChange={([v]) => formCursor.car.model.set(v)}
                            onOk={([v]) => formCursor.car.model.set(v)}
                        >
                            <List.Item arrow="horizontal">Car</List.Item>
                        </Picker>
                    </List>
                </div>
            );
        }

        return null;
    },

    renderStopOvers() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;
        const stopsCursor = formCursor.stops;
        const stops = stopsCursor.get();

        return (
            <div className={s.stops}>
                {_.map(stops, (stop, index) => (
                    <Search
                        key={`stop-${index}`}
                        cursor={citiesCursor}
                        selectedValue={stopsCursor.get(index)}
                        valueCursor={stopsCursor.select(index)}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => stopsCursor.select(index).set(v)}
                        placeholder="Select a stop"
                    >
                        <div className={s.stopIcon} style={{ backgroundImage: `url(${minusIcon})`}} />
                    </Search>
                ))}
                <div
                    className={s.addStop}
                    onClick={() => formCursor.stops.push({})}
                >
                    <div className={s.stopIcon} style={{ backgroundImage: `url(${plusIcon})`}} />
                    <div>Add one</div>
                </div>
            </div>
        );
    },

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;

        console.log('tree', this.props.tree.get());

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
                    {this.renderStopOvers()}
                </div>
                <div className={s.section}>
                    <Title>Car</Title>
                    {this.renderCarPicker()}
                    {/*
                    <Input onChange={(e) => formCursor.car.model.set(e.target.value)}>
                        <div className={s.text}>Model</div>
                    </Input>
                    */}
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
