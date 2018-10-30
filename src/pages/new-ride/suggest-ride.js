import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Search, Title, Error } from 'components';
import schema from 'libs/state';
import moment from 'moment';
import { Button } from 'antd-mobile';
import { validateForm, checkInputError } from 'components/utils';
import * as yup from 'yup';
import { DateTimePickers } from './date-time-pickers';
import s from './new-ride.css';

const validationSchema = (date) => yup.object().shape({
    cityFrom: yup.mixed().required('Select a city'),
    cityTo: yup.mixed().required('Select a city'),
    dateTime: yup.date().min(moment(date).toDate(),
        `Date field must be later than ${moment(date).format('MMM D YYYY h:mm A')}`),
});

const model = {
    cities: {},
    form: {},
    result: {},
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
            cityTo: null,
            dateTime: moment().toDate(),
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
        const { getCitiesService } = this.props.services;
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;

        return (
            <div className={s.container}>
                <div className={s.section}>
                    <Title>Direction</Title>
                    <Search
                        citiesCursor={citiesCursor}
                        service={getCitiesService}
                        currentValue={formCursor.cityFrom.get()}
                        onChange={(v) => {
                            formCursor.cityFrom.set(v);
                            errorsCursor.select('cityFrom').set(null);
                        }}
                        {...this.checkInputError('cityFrom')}
                    >
                        <div className={s.text}>From</div>
                    </Search>
                    <Search
                        citiesCursor={citiesCursor}
                        service={getCitiesService}
                        currentValue={formCursor.cityTo.get()}
                        onChange={(v) => {
                            formCursor.cityTo.set(v);
                            errorsCursor.select('cityTo').set(null);
                        }}
                        {...this.checkInputError('cityTo')}
                    >
                        <div className={s.text}>To</div>
                    </Search>
                </div>
                <DateTimePickers formCursor={formCursor} errorsCursor={errorsCursor} />
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
