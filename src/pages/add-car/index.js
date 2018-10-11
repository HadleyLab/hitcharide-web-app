import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import classNames from 'classnames';
import createReactClass from 'create-react-class';
import { Button, List, DatePicker } from 'antd-mobile';
import { Title, Input, Error } from 'components';
import { validateForm, checkInputError } from 'components/utils';
import schema from 'libs/state';
import * as yup from 'yup';
import moment from 'moment';
import deleteIcon from 'components/icons/delete.svg';
import s from './add-car.css';

const model = {
    form: {},
    result: {},
    imagesResult: [],
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
        services: PropTypes.shape({
            addCarService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
            addCarImageService: PropTypes.func.isRequired,
        }).isRequired,
    },

    getDefaultProps() {
        return {
            editMode: false,
        };
    },

    getInitialState() {
        return {
            images: [],
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
            productionYear: null,
            images: [],
        };

        this.props.tree.select('form').set(initData);
    },

    async reloadCarsList() {
        const { getCarListService } = this.props.services;

        await getCarListService(this.props.carsCursor);
        this.props.history.goBack();
    },

    async loadImages(pk) {
        const { addCarImageService } = this.props.services;
        const errorsCursor = this.props.tree.errors;
        const { images } = this.state;

        await Promise.all(
            _.map(images, (image, index) => addCarImageService(
                this.props.tree.imagesResult.select(index),
                pk,
                { image }
            ))
        )
            .then((data) => {
                this.reloadCarsList();

                return data;
            })
            .catch((error) => errorsCursor.set(error));
    },

    async onSubmit() {
        const { addCarService } = this.props.services;
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const data = formCursor.get();
        const { images } = this.state;
        const validationResult = await validateForm(validationSchema, data);
        const { isDataValid, errors } = validationResult;

        if (!isDataValid) {
            this.props.tree.errors.set(errors);

            return;
        }

        if (isDataValid) {
            const result = await addCarService(this.props.tree.result, _.omit(data, 'images'));

            if (result.status === 'Succeed' && !_.isEmpty(images)) {
                this.loadImages(result.data.pk);
            }

            if (result.status === 'Succeed') {
                this.reloadCarsList();
            }

            if (result.status === 'Failure') {
                errorsCursor.set(result.error.data);
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

    handleFileChange(images) {
        if (images && !_.isEmpty(images)) {
            this.setState({ images: _.map(images) });

            _.forEach(images, (image, index) => {
                const reader = new FileReader();

                reader.onload = (e) => this.props.tree.form.images.push({
                    pk: `local-${index}`,
                    image: e.target.result,
                });
                reader.readAsDataURL(image);
            });
        }
    },

    removeImage(pk, index) {
        const formCursor = this.props.tree.form;
        const images = formCursor.get('images');
        const indexInTree = _.findIndex(images, { pk });
        const stateImages = this.state.images;

        formCursor.select('images').unset(indexInTree);
        this.setState({
            images: _.filter(stateImages,
                (stateImage, stateImageIndex) => stateImageIndex !== index),
        });
    },

    renderImages() {
        const formCursor = this.props.tree.form;
        const images = formCursor.get('images') || [];

        return (
            <div className={s.imagesContainer}>
                <div className={s.title}>Photo</div>
                <div className={s.imagesWrapper}>
                    <div className={s.images}>
                        {_.map(images, ({ pk, image }, index) => (
                            <div
                                key={`image-${index}`}
                                className={s.photo}
                                style={{ backgroundImage: `url(${image})` }}
                            >
                                <div
                                    className={s.deleteIcon}
                                    style={{ backgroundImage: `url(${deleteIcon})` }}
                                    onClick={() => this.removeImage(pk, index)}
                                />
                            </div>
                        ))}
                        <div className={s.photoPicker}>
                            <input
                                className={s.photoInput}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => this.handleFileChange(e.target.files)}
                            />
                        </div>
                        <div className={s.imagesOffset} />
                    </div>
                </div>
            </div>
        );
    },

    renderYearSelect() {
        const formCursor = this.props.tree.form;
        const errorsCursor = this.props.tree.errors;
        const yearCursor = formCursor.productionYear;
        const year = yearCursor.get();

        return (
            <List
                className={classNames(s.datePicker, {
                    [s._empty]: !year,
                })}
            >
                <DatePicker
                    value={year ? moment().year(year).toDate() : null}
                    onChange={(date) => {
                        errorsCursor.productionYear.set(null);
                        yearCursor.set(moment(date).year());
                    }}
                    mode="year"
                    title="Car year"
                    minDate={moment('1900', 'YYYY').toDate()}
                    maxDate={moment().toDate()}
                    format={(date) => moment(date).format('YYYY')}
                >
                    <List.Item>Year</List.Item>
                </DatePicker>
            </List>
        );
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
                {this.renderYearSelect()}
                <Input {...this.getInputProps('licensePlate')}>
                    <div className={s.text}>License plate</div>
                </Input>
                {this.renderImages()}
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
                        {editMode ? 'Save car' : 'Add car'}
                    </Button>
                </div>
            </div>
        );
    },
}));
