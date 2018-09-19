import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Flex, WhiteSpace } from 'antd-mobile';
import { Title } from 'components';
import schema from 'libs/state';
import { AddCarPage } from 'pages';
import { Route, Link } from 'react-router-dom';
import tickIcon from 'components/icons/tick-circle.svg';
import { EditProfilePage } from './edit';
import s from './profile.css';

export const ProfilePageContent = createReactClass({
    displayName: 'ProfilePageContent',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        logout: PropTypes.func.isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getMyProfileService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
        }),
    },

    renderCars() {
        const carsCursor = this.props.tree.cars;
        const cars = carsCursor.get('data');
        const status = carsCursor.get('status');

        if (!status || status !== 'Succeed') {
            return null;
        }

        return (
            <div className={s.cars}>
                {_.map(cars, (car, index) => {
                    const {
                        brand, model: carModel, color, numberOfSeats, licensePlate,
                    } = car;

                    return (
                        <div key={`car-${index}`} className={s.car}>
                            <div>{`${brand} ${carModel} (${color}, ${numberOfSeats} seats)`}</div>
                            <div>{licensePlate}</div>
                        </div>
                    );
                })}
            </div>
        );
    },

    render() {
        const infoCursor = this.props.tree.info;
        const profile = infoCursor.get('data');
        const {
            firstName, lastName, phone, email, isPhoneValidated,
            paypal = '1234567890', shortDesc, age,
        } = profile;

        return (
            <div>
                <div className={s.profile}>
                    <div className={s.photo}>Photo</div>
                    <div className={s.name}>
                        {`${firstName} ${lastName}`}
                        {age ? ` (${age} years)` : null}
                    </div>
                </div>
                <div className={s.section}>
                    <Title>About you</Title>
                    <div className={s.infoField}>
                        {shortDesc || 'A few words about myself'}
                    </div>
                </div>
                <div className={s.section}>
                    <Title>Contacts</Title>
                    {phone ? (
                        <div className={s.infoField}>
                            {phone}
                            {isPhoneValidated ? (
                                <div className={s.tick} style={{ backgroundImage: `url(${tickIcon})` }} />
                            ) : null}
                        </div>
                    ) : null}
                    <div className={s.infoField}>
                        {email}
                        <div className={s.tick} style={{ backgroundImage: `url(${tickIcon})` }} />
                    </div>
                </div>
                <div className={s.section}>
                    <Title>Car</Title>
                    {this.renderCars()}
                </div>
                <div className={s.section}>
                    <Title>PayPal</Title>
                    <div className={s.infoField}>
                        {paypal}
                    </div>
                </div>
                <WhiteSpace />
                <WhiteSpace />
                <WhiteSpace />
                <Flex direction="column" justify="center">
                    <Link
                        to="/app/profile/edit"
                        className="am-button am-button-primary am-button-inline"
                        style={{ width: 250 }}
                    >
                        Edit profile
                    </Link>
                    <div className={s.logout} onClick={this.props.logout}>
                        Logout
                    </div>
                </Flex>
                <WhiteSpace />
                <WhiteSpace />
            </div>
        );
    },
});

const model = (props, context) => ({
    info: context.services.getMyProfileService,
    cars: context.services.getCarListService,
});

export const ProfilePage = schema(model)(createReactClass({
    displayName: 'ProfilePage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getMyProfileService: PropTypes.func.isRequired,
            getCarListService: PropTypes.func.isRequired,
        }),
    },

    async componentDidMount() {
        const profile = this.props.tree.get('info');
        const cars = this.props.tree.get('cars');
        const { getMyProfileService, getCarListService } = this.context.services;

        if (_.isEmpty(profile)) {
            await getMyProfileService(this.props.tree.info);
        }

        if (_.isEmpty(cars)) {
            await getCarListService(this.props.tree.cars);
        }
    },

    render() {
        const infoCursor = this.props.tree.info;
        const status = infoCursor.get('status');

        if (!status || status !== 'Succeed') {
            return null;
        }

        const { url } = this.props.match;

        return (
            <div>
                <Route
                    exact
                    path={url}
                    render={() => (
                        <ProfilePageContent {...this.props} tree={this.props.tree} />
                    )}
                />
                <Route
                    exact
                    path={`${url}/car/add`}
                    render={(props) => (
                        <AddCarPage
                            {...props}
                            tree={this.props.tree.select('addCar')}
                            carsCursor={this.props.tree.cars}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${url}/car/:pk/edit`}
                    render={(props) => (
                        <AddCarPage
                            {...props}
                            editMode
                            tree={this.props.tree.select('addCar')}
                            carsCursor={this.props.tree.cars}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${url}/edit`}
                    render={(props) => (
                        <EditProfilePage
                            {...props}
                            tree={this.props.tree.select('edit')}
                            profileCursor={this.props.tree.info.data}
                            cars={this.props.tree.cars.get('data')}
                        />
                    )}
                />
            </div>
        );
    },
}));
