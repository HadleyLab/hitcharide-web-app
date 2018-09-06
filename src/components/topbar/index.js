import React from 'react';
import { NavBar } from 'antd-mobile';
import { Link } from 'react-router-dom';
import profileIcon from 'components/icons/profile.svg';
import logoIcon from 'components/icons/logo.svg';
import s from './topbar.css';

export const TopBar = () => (
    <NavBar
        mode="dark"
        leftContent={(
            <Link to="/">
                <div className={s.logo} style={{ backgroundImage: `url(${logoIcon})` }} />
            </Link>
        )}
        rightContent={(
            <Link to="/app/profile">
                <div className={s.profile} style={{ backgroundImage: `url(${profileIcon})` }} />
            </Link>
        )}
    />
);
