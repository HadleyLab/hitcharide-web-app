import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    Search, Title, Input, StepperInput, Error, Loader, DateTimePicker,
} from 'components';
import schema from 'libs/state';
import { Button, List, Picker } from 'antd-mobile';
import { validateForm, checkInputError, formatDate } from 'components/utils';
import * as yup from 'yup';
import moment from 'moment';
import minusIcon from 'components/icons/minus-circle.svg';
import carIcon from 'components/icons/car.svg';
import warningIcon from 'components/icons/warning.svg';
import { AddFilledIcon } from 'components/icons';
import s from './new-ride.css';
import classNames from 'classnames';

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
    search: {},
    form: {},
    result: {},
    errors: {},
};

export const BaseCreateRideForm = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        cars: PropTypes.arrayOf(PropTypes.shape()).isRequired,
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            getPlacesService: PropTypes.func.isRequired,
            createRideService: PropTypes.func.isRequired,
            getRideRequestService: PropTypes.func.isRequired,
        }).isRequired,
        initData: PropTypes.shape({}),
    },

    componentWillMount() {
        this.initForm();
    },

    async initForm() {
        const car = this.props.cars[0];
        const initData = {
            cityFrom: null,
            placeFrom: null,
            cityTo: null,
            placeTo: null,
            dateTime: formatDate(moment()),
            price: null,
            stops: [],
            car: car.pk,
            numberOfSeats: 1,
            description: null,
        };

        this.props.tree.form.set(_.merge(initData, this.props.initData));
        this.props.tree.errors.set({});
    },

    async onSubmit() {
        const { createRideService } = this.props.services;
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
            const stops = _.filter(data.stops, (stop) => stop.city);
            const result = await createRideService(this.props.tree.result, _.assign({}, data, {
                cityFrom: data.cityFrom.pk,
                cityTo: data.cityTo.pk,
                placeFrom: data.placeFrom ? data.placeFrom.pk : null,
                placeTo: data.placeTo ? data.placeTo.pk : null,
                stops: _.map(stops, (stop, index) => ({
                    city: stop.city.pk,
                    place: stop.place ? stop.place.pk : null,
                    order: index,
                })),
            }));

            if (result.status === 'Failure') {
                this.props.tree.errors.set(result.error.data);
            }

            if (result.status === 'Succeed') {
                this.props.history.push('/app/my-rides');
            }
        }
    },

    checkInputError(name) {
        const errorsCursor = this.props.tree.errors;
        return checkInputError(name, errorsCursor.get());
    },

    renderCarPicker() {
        const { cars } = this.props;
        const formCursor = this.props.tree.form;
        let pickerData = [];

        _.forEach(cars, (car) => pickerData.push({
            value: car.pk,
            label: `${car.brand} ${car.model} (${car.color})`,
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
        const { services } = this.props;
        const searchCursor = this.props.tree.search;
        const formCursor = this.props.tree.form;
        const stopsCursor = formCursor.stops;
        const stops = stopsCursor.get();

        return (
            <div className={s.stops}>
                {_.map(stops, (stop, index) => (
                    <Search
                        key={`stop-${index}`}
                        tree={searchCursor}
                        services={services}
                        currentValue={stopsCursor.select(index).get()}
                        onChange={(v) => stopsCursor.select(index).set(v)}
                        color="#97B725"
                    >
                        <div
                            className={s.stopIcon}
                            style={{ backgroundImage: `url(${minusIcon})` }}
                            onClick={() => stopsCursor.unset(index)}
                        />
                        <div className={s.text}>
                            {!stopsCursor.select(index).city.get() ? 'Select a stop' : 'Stop'}
                        </div>
                    </Search>
                ))}
                <div
                    className={s.addStop}
                    onClick={() => formCursor.stops.push({ city: null, place: null })}
                >
                    <div className={s.stopIcon}>
                        <AddFilledIcon />
                    </div>
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
        const { services } = this.props;
        const searchCursor = this.props.tree.search;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;

        return (
            <div className={s.container}>
                <div className={s.section}>
                    <Title>Direction</Title>
                    <Search
                        tree={searchCursor}
                        services={services}
                        currentValue={{ city: formCursor.cityFrom.get(), place: formCursor.placeFrom.get() }}
                        onChange={({ city, place }) => {
                            formCursor.cityFrom.set(city);
                            formCursor.placeFrom.set(place);

                        }}
                        onFocus={() => {
                            errorsCursor.select('cityFrom').set(null);
                            errorsCursor.select('placeFrom').set(null);
                        }}
                        name="from"
                        color="#6FA6F8"
                        {...this.checkInputError('cityFrom')}
                    >
                        <div className={s.text}>From </div>
                    </Search>
                    <Search
                        tree={searchCursor}
                        services={services}
                        currentValue={{ city: formCursor.cityTo.get(), place: formCursor.placeTo.get() }}
                        onChange={({ city, place }) => {
                            formCursor.cityTo.set(city);
                            formCursor.placeTo.set(place);
                        }}
                        onFocus={() => {
                            errorsCursor.select('cityTo').set(null);
                            errorsCursor.select('placeTo').set(null);
                        }}
                        name="to"
                        color="#97B725"
                        {...this.checkInputError('cityTo')}
                    >
                        <div className={s.text}>To </div>
                    </Search>
                    <div className={classNames(s.section, s.departure)}>
                        <Title>
                            Departure
                        </Title>
                        <DateTimePicker
                            value={formCursor.dateTime.get()}
                            onChange={(date) => {
                                formCursor.dateTime.set(date);
                                errorsCursor.select('dateTime')
                                    .set(null);
                            }}
                            {...this.checkInputError('dateTime')}
                        >
                            When
                        </DateTimePicker>
                    </div>
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
                        {...this.checkInputError('numberOfSeats')}
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
                <div className={s.footer}>
                    <Button
                        type="primary"
                        inline
                        style={{ width: 250 }}
                        onClick={this.onSubmit}
                    >
                        Create a ride
                    </Button>
                </div>
            </div>
        );
    },
}));
