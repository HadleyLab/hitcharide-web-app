import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import s from './title.css';

export const Title = ({ children, className, style }) => (
    <div className={classNames(s.title, className)} style={style}>{children}</div>
);

Title.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.shape(),
};

Title.defaultProps = {
    className: '',
    children: <div />,
    style: {},
};
