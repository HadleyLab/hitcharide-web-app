import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import { NavBar, Modal } from 'antd-mobile';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import profileIcon from 'components/icons/profile.svg';
import logoIcon from 'components/icons/logo.svg';
import arrowBackIcon from 'components/icons/arrow-back.svg';
import arrowDownIcon from 'components/icons/arrow-down.svg';
import { DriverIcon, TravelerIcon } from 'components/icons';
import { setUserType } from 'components/utils';
import s from './topbar.css';

export class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.hideModal = this.hideModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.setUserType = this.setUserType.bind(this);
        this.state = {
            modalOpen: false,
        };
    }

    componentDidMount() {
        window.addEventListener('click', this.hideModal, false);
        window.addEventListener('touchend', this.hideModal, false);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.hideModal);
        window.removeEventListener('touchend', this.hideModal, false);
    }

    hideModal() {
        this.setState({ modalOpen: false });
    }

    openModal(e) {
        e.stopPropagation();
        this.setState({ modalOpen: true });
    }

    showMessage(creationRights) {
        Modal.alert("I'm a driver", creationRights.message, [
            { text: 'Cancel', onPress: () => null },
            {
                text: 'Edit profile',
                onPress: () => this.props.history.push('/app/profile/edit'),
            },
        ]);
    }

    setUserType(e, type) {
        e.stopPropagation();
        const creationRights = this.props.checkUserRights(type);
        const isDriver = type === 'driver';

        if (isDriver && !creationRights.allowed) {
            this.showMessage(creationRights);

            return;
        }

        setUserType(type);
        this.props.userTypeCursor.set(type);
        this.setState({ modalOpen: false });
    }

    checkIfInnerPage() {
        const { pathname } = this.props.location;
        const rootPaths = ['/app', '/app/my-rides', '/app/create-ride'];

        return _.indexOf(rootPaths, pathname) === -1;
    }

    renderArrow() {
        const { history } = this.props;

        return (
            <div className={s.wrapper} onClick={history.goBack}>
                <div
                    className={classNames(s.icon, s.arrow)}
                    style={{ backgroundImage: `url(${arrowBackIcon})` }}
                />
            </div>
        );
    }

    renderLogo() {
        return (
            <Link to="/" className={s.wrapper}>
                <div
                    className={classNames(s.icon, s.logo)}
                    style={{ backgroundImage: `url(${logoIcon})` }}
                />
            </Link>
        );
    }

    renderProfile() {
        return (
            <Link to="/app/profile" className={s.wrapper}>
                <div
                    className={classNames(s.icon, s.profile)}
                    style={{ backgroundImage: `url(${profileIcon})` }}
                />
            </Link>
        );
    }

    renderUserTypeSwitch() {
        const userType = this.props.userTypeCursor.get();

        return (
            <div
                className={s.userType}
                onClick={this.openModal}
                onTouchEnd={this.openModal}
            >
                <div className={s.userIcon}>
                    {userType === 'passenger' ? <TravelerIcon /> : <DriverIcon />}
                </div>
                <div
                    className={s.userArrow}
                    style={{ backgroundImage: `url(${arrowDownIcon})` }}
                />
            </div>
        );
    }

    render() {
        const { modalOpen } = this.state;
        const isInnerPage = this.checkIfInnerPage();

        const userTypes = [
            {
                type: 'driver',
                text: 'I’m a driver',
                icon: <DriverIcon />,
            },
            {
                type: 'passenger',
                text: 'I’m a passenger',
                icon: <TravelerIcon />,
            },
        ];

        return (
            <div className={s.navbar}>
                <NavBar
                    mode="dark"
                    leftContent={isInnerPage ? this.renderArrow() : this.renderUserTypeSwitch()}
                    rightContent={this.renderProfile()}
                >
                    {this.renderLogo()}
                </NavBar>
                {modalOpen ? (
                    <div className={s.modal}>
                        <div className={s.list}>
                            {_.map(userTypes, ({ type, text, icon }, index) => (
                                <div
                                    key={`user-type-${index}`}
                                    className={s.item}
                                    onClick={(e) => this.setUserType(e, type)}
                                    onTouchEnd={(e) => this.setUserType(e, type)}
                                >
                                    <div className={s.userIcon}>{icon}</div>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

TopBar.propTypes = {
    userTypeCursor: BaobabPropTypes.cursor.isRequired,
    history: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    checkUserRights: PropTypes.func.isRequired,
};
