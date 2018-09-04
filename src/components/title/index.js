import React from 'react';
import PropTypes from 'prop-types';
import s from './title.css';

export const Title = ({ children }) => (
    <div className={s.title}>{children}</div>
);

Title.propTypes = {
    children: PropTypes.any, // eslint-disable-line
};
