import React from 'react';
import { NavBar } from 'antd-mobile';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import profileIcon from 'components/icons/profile.svg';
import logoIcon from 'components/icons/logo.svg';
import arrowIcon from 'components/icons/arrow-back.svg';
import PropTypes from 'prop-types';
import s from './topbar.css';

export class TopBar extends React.Component {
    renderArrow() {
        const { history } = this.props;

        return (
            <div className={s.wrapper}>
                <div
                    className={classNames(s.icon, s.arrow)}
                    style={{ backgroundImage: `url(${arrowIcon})` }}
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

    render() {
        const { innerPage } = this.props;

        if (innerPage) {
            return (
                <NavBar
                    mode="dark"
                    leftContent={this.renderArrow()}
                    rightContent={this.renderProfile()}
                >
                    {this.renderLogo()}
                </NavBar>
            );
        }

        return (
            <NavBar
                mode="dark"
                leftContent={this.renderLogo()}
                rightContent={this.renderProfile()}
            />
        );
    }
}

TopBar.propTypes = {
    innerPage: PropTypes.bool,
};

TopBar.defaultProps = {
    innerPage: false,
};
