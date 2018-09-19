import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Flex, WhiteSpace } from 'antd-mobile';
import { Title } from 'components';
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
        const profileCursor = this.props.tree.profile;
        const profile = profileCursor.get('data');
        const {
            firstName, lastName, phone, email, isPhoneValidated,
            paypalAccount, shortDesc, age,
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
                        {paypalAccount}
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

export const ProfilePage = createReactClass({
    displayName: 'ProfilePage',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
    },

    render() {
        const profileCursor = this.props.tree.profile;
        const status = profileCursor.get('status');

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
                            tree={this.props.tree.select('editProfile')}
                            profileCursor={this.props.tree.profile.data}
                            cars={this.props.tree.cars.get('data')}
                        />
                    )}
                />
            </div>
        );
    },
});
