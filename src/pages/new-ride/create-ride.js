import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    Search, Title, Input, StepperInput, Error,
} from 'components';
import schema from 'libs/state';
import {
    Flex, Button, List, WhiteSpace, Picker,
} from 'antd-mobile';
import { validateForm, checkInputError } from 'components/utils';
import * as yup from 'yup';
import moment from 'moment';
import minusIcon from 'components/icons/minus-circle.svg';
import plusIcon from 'components/icons/plus-circle.svg';
import carIcon from 'components/icons/car.svg';
import warningIcon from 'components/icons/warning.svg';
import { DateTimePickers } from './date-time-pickers';
import s from './new-ride.css';

const validationSchema = (date) => yup.object().shape({
    cityFrom: yup.mixed().required('Select a city'),
    cityTo: yup.mixed().required('Select a city'),
    dateTime: yup.date().min(moment(date).toDate(),
        `Date field must be later than ${moment(date).format('MMM D YYYY h:mm A')}`),
    price: yup.number()
        .typeError('Wrong format')
        .nullable()
        .required('Add price for a seat'),
    car: yup.number().typeError('Wrong format').nullable().required('Select a car'),
    numberOfSeats: yup.number()
        .typeError('Wrong format')
        .nullable()
        .min(1, 'Add number of available seats in the car'),
    description: yup.string().ensure().required('Add notes about this ride'),
});

const model = {
    cities: {},
    form: {},
    result: {},
    errors: {},
};

export const CreateRideForm = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        cars: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            createRideService: PropTypes.func.isRequired,
        }),
    },

    componentDidMount() {
        this.initForm();
    },

    initForm() {
        const car = this.props.cars[0];

        const initData = {
            cityFrom: null,
            cityTo: null,
            dateTime: moment().toDate(),
            price: null,
            stops: [],
            car: car.pk,
            numberOfSeats: 1,
            description: null,
        };

        this.props.tree.select('form').set(initData);
    },

    async onSubmit() {
        const { createRideService } = this.context.services;
        const date = moment();
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema(date), data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const stops = _.filter(data.stops, (stop) => !_.isEmpty(stop));
            const result = await createRideService(this.props.tree.result, _.assign({}, data, {
                cityFrom: data.cityFrom.pk,
                cityTo: data.cityTo.pk,
                stops: _.map(stops, (stop, index) => ({
                    city: stop.pk,
                    order: index,
                })),
            }));

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                this.props.history.push('/app');
            }
        }
    },

    checkInputError(name) {
        const errorsCursor = this.props.tree.errors;
        const errorProps = checkInputError(name, errorsCursor.get());

        return errorProps;
    },

    renderCarPicker() {
        const { cars } = this.props;
        const formCursor = this.props.tree.form;
        let pickerData = [];

        _.forEach(cars, (car) => pickerData.push({
            value: car.pk,
            label: `${car.brand} ${car.model} (Black)`,
        }));

        return (
            <div className={s.carPicker}>
                <List>
                    <Picker
                        data={pickerData}
                        cols={1}
                        value={[formCursor.car.get()]}
                        onChange={([v]) => formCursor.car.set(v)}
                        onOk={([v]) => formCursor.car.set(v)}
                    >
                        <List.Item arrow="horizontal">
                            <div className={s.carIcon} style={{ backgroundImage: `url(${carIcon})` }} />
                        </List.Item>
                    </Picker>
                </List>
            </div>
        );
    },

    renderStopOvers() {
        const { getCitiesService } = this.context.services;
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
                        <div
                            className={s.stopIcon}
                            style={{ backgroundImage: `url(${minusIcon})` }}
                            onClick={() => stopsCursor.unset(index)}
                        />
                    </Search>
                ))}
                <div
                    className={s.addStop}
                    onClick={() => formCursor.stops.push({})}
                >
                    <div className={s.stopIcon} style={{ backgroundImage: `url(${plusIcon})` }} />
                    <div>Add one</div>
                </div>
            </div>
        );
    },

    renderNotes() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const errorProps = this.checkInputError('description');

        return (
            <div className={s.section}>
                <Title>Notes</Title>
                <div className={s.notes}>
                    <textarea
                        placeholder="Enter text"
                        className={s.notesInput}
                        onChange={(e) => {
                            formCursor.description.set(e.target.value);
                            errorsCursor.select('description').set(null);
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

    render() {
        const { getCitiesService } = this.context.services;
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;

        return (
            <div className={s.container}>
                <div className={s.section}>
                    <Title>Direction</Title>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('cityFrom')}
                        valueCursor={formCursor.cityFrom}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => {
                            formCursor.cityFrom.set(v);
                            errorsCursor.select('cityFrom').set(null);
                        }}
                        {...this.checkInputError('cityFrom')}
                    >
                        <div className={s.text}>From</div>
                    </Search>
                    <Search
                        cursor={citiesCursor}
                        selectedValue={formCursor.get('cityTo')}
                        valueCursor={formCursor.cityTo}
                        service={getCitiesService}
                        displayItem={({ name, state }) => `${name}, ${state.name}`}
                        onItemSelect={(v) => {
                            formCursor.cityTo.set(v);
                            errorsCursor.select('cityTo').set(null);
                        }}
                        {...this.checkInputError('cityTo')}
                    >
                        <div className={s.text}>To</div>
                    </Search>
                    <DateTimePickers formCursor={formCursor} errorsCursor={errorsCursor} />
                </div>
                <div className={s.section}>
                    <Title>Stop overs</Title>
                    {this.renderStopOvers()}
                </div>
                <div className={s.section}>
                    <Title>Car</Title>
                    {this.renderCarPicker()}
                </div>
                <div className={s.section}>
                    <Title>Seats</Title>
                    <StepperInput
                        className={s.numberOfSeatsInput}
                        title="Number of seats"
                        cursor={formCursor.numberOfSeats}
                        minValue={1}
                        maxValue={100}
                    />
                </div>
                <div className={s.section}>
                    <Title>Price</Title>
                    <Input
                        type="number"
                        onKeyPress={(e) => {
                            const isString = e.which < 48 || e.which > 57;
                            const isDot = e.which === 46;

                            if (isString && !isDot) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            formCursor.price.set(e.target.value);
                            errorsCursor.select('price').set(null);
                        }}
                        {...this.checkInputError('price')}
                    >
                        <div className={s.text}>Price for seat, $</div>
                    </Input>
                </div>
                {this.renderNotes()}
                <Error
                    form={this.props.tree.form.get()}
                    errors={this.props.tree.errors.get()}
                />
                <div className={s.warningText}>
                    You can delete this trip
                    <br />
                    up to 24 hours before
                </div>
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
