import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Search, Title, Error, DateTimePicker } from 'components';
import schema from 'libs/state';
import moment from 'moment';
import { Button } from 'antd-mobile';
import { validateForm, checkInputError, formatDate } from 'components/utils';
import * as yup from 'yup';
import s from './new-ride.css';
import classNames from 'classnames';

const validationSchema = (date) => yup.object().shape({
    cityFrom: yup.mixed().required('Select a city'),
    cityTo: yup.mixed().required('Select a city'),
    dateTime: yup.date().min(moment(date).toDate(),
        `Date field must be later than ${moment(date).format('MMM D YYYY h:mm A')}`),
});

const model = {
    form: {},
    result: {},
    search: {},
    errors: {},
};

export const SuggestRideForm = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        services: PropTypes.shape({
            getCitiesService: PropTypes.func.isRequired,
            getPlacesService: PropTypes.func.isRequired,
            requestRideService: PropTypes.func.isRequired,
        }).isRequired,
        searchForm: PropTypes.shape({}),
    },

    componentWillMount() {
        this.initForm();
    },

    initForm() {
        const initData = {
            cityFrom: null,
            placeFrom: null,
            cityTo: null,
            placeTo: null,
            dateTime: formatDate(moment()),
        };

        this.props.tree.select('form').set(_.merge(initData, _.pickBy(this.props.searchForm, (x) => x)));
        this.props.tree.errors.set({});
    },

    async onSubmit() {
        const { requestRideService } = this.props.services;
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
            const result = await requestRideService(this.props.tree.result, _.assign({}, data, {
                cityFrom: data.cityFrom.pk,
                cityTo: data.cityTo.pk,
                placeFrom: data.placeFrom ? data.placeFrom.pk : null,
                placeTo: data.placeTo ? data.placeTo.pk : null,
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
        const errorProps = checkInputError(name, errorsCursor.get());

        return errorProps;
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
                </div>
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
                        Suggest a ride
                    </Button>
                </div>
            </div>
        );
    },
}));
