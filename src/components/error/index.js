import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import s from './error.css';

export const Error = ({ children, className, style }) => (
    <div className={classNames(s.error, className)} style={style}>{children}</div>
);

Error.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.shape(),
};

Error.defaultProps = {
    className: '',
    children: <div />,
    style: {},
};
