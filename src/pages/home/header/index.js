import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import createReactClass from 'create-react-class';
import logoIcon from 'components/icons/logo.svg';
import { Button } from '../button';
import s from './header.css';

export const HomeHeader = createReactClass({
    propTypes: {
        token: PropTypes.string,
        logout: PropTypes.func.isRequired,
    },

    getDefaultProps() {
        return {
            token: null,
        };
    },

    getInitialState() {
        return {
            menuOpened: false,
        };
    },

    componentDidMount() {
        window.addEventListener('resize', this.onResize, false);
    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    },

    onResize() {
        if (window.outerWidth > 768) {
            this.setState({ menuOpened: false });
        }
    },

    toggleMenu() {
        const { menuOpened } = this.state;

        this.setState({ menuOpened: !menuOpened });
    },

    logout() {
        this.props.logout();
        this.toggleMenu();
    },

    renderBurger() {
        const { menuOpened } = this.state;

        return (
            <div
                className={classNames(s.burger, {
                    [s._opened]: menuOpened,
                })}
                onClick={this.toggleMenu}
            >
                <div className={classNames(s.line, s._top)} />
                <div className={classNames(s.line, s._center)} />
                <div className={classNames(s.line, s._bottom)} />
            </div>
        );
    },

    renderMobileMenu() {
        const { menuOpened } = this.state;
        const { token } = this.props;

        if (token) {
            return (
                <div
                    className={classNames(s.mobileMenu, {
                        [s._opened]: menuOpened,
                    })}
                >
                    <Link to="/app" className={s.link}>Search</Link>
                    <Link to="/app/my-rides" className={s.link}>My rides</Link>
                    <Link to="/app/profile" className={s.link}>Profile</Link>
                    <div className={s.link} onClick={this.logout}>Logout</div>
                    <Button to="/app/create-ride" className={s.button}>Create a ride</Button>
                </div>
            );
        }

        return (
            <div
                className={classNames(s.mobileMenu, {
                    [s._opened]: menuOpened,
                })}
            >
                <Link to="/account/login" className={s.link}>Log in</Link>
                <Link to="/account/registration" className={s.link}>Sign up</Link>
            </div>
        );
    },

    renderMenu() {
        const { token } = this.props;

        if (token) {
            return (
                <div className={s.menu}>
                    <Button to="/app/create-ride" className={s.button}>Create a ride</Button>
                    <Link to="/app" className={s.link}>Search</Link>
                    <Link to="/app/my-rides" className={s.link}>My rides</Link>
                    <Link to="/app/profile" className={s.link}>Profile</Link>
                    <div className={s.link} onClick={this.logout}>Logout</div>
                </div>
            );
        }

        return (
            <div className={s.menu}>
                <Link to="/account/login" className={s.link}>Log in</Link>
                <Link to="/account/registration" className={s.link}>Sign up</Link>
            </div>
        );
    },

    render() {
        return (
            <div>
                <header className={s.header}>
                    <div className={s.headerContent}>
                        <Link to="/" className={s.wrapper}>
                            <div
                                className={s.logo}
                                style={{ backgroundImage: `url(${logoIcon})` }}
                            />
                        </Link>
                        {this.renderBurger()}
                        {this.renderMenu()}
                    </div>
                </header>
                {this.renderMobileMenu()}
            </div>
        );
    },
});
