import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import s from './home.css';

export const Button = ({ to, className, children }) => (
    <Link to={to} className={classNames(s.button, className)}>{children}</Link>
);

Button.propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string.isRequired,
    className: PropTypes.string,
};

Button.defaultProps = {
    className: null,
};
