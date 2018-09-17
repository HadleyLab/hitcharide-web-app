import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Search, Title } from 'components';
import schema from 'libs/state';
import {
    Flex, Button, List, DatePicker, WhiteSpace,
} from 'antd-mobile';
import { getCitiesService, addRideService } from 'services';
import { validateForm, checkInputError } from 'components/utils';
import * as yup from 'yup';
// import warningIcon from 'components/icons/warning.svg';
import s from './new-ride.css';

const validationSchema = yup.object().shape({
    cityFrom: yup.mixed().required('Select a city'),
    cityTo: yup.mixed().required('Select a city'),
    dateTime: yup.date().min(new Date(), `Date field must be later than ${new Date()}`),
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
    },

    initForm() {
        const initData = {
            cityFrom: null,
            cityTo: null,
            dateTime: new Date(),
        };

        this.props.tree.select('form').set(initData);
    },

    async onSubmit() {
        const formCursor = this.props.tree.form;
        const data = formCursor.get();
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const result = await addRideService(this.props.tree.result, _.assign({}, data, {
                cityFrom: data.cityFrom.pk,
                cityTo: data.cityTo.pk,
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

    render() {
        const citiesCursor = this.props.tree.cities;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;

        return (
            <div className={s.container}>
                <div className={s.section}>
                    <Title>Ride information</Title>
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
                    <List className={s.datePicker} style={{ backgroundColor: 'white' }}>
                        <DatePicker
                            value={formCursor.dateTime.get()}
                            onChange={(date) => formCursor.dateTime.set(date)}
                            use12Hours
                            title="When"
                        >
                            <List.Item arrow="horizontal">When</List.Item>
                        </DatePicker>
                    </List>
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
                        Suggest a ride
                    </Button>
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
            </div>
        );
    },
}));
