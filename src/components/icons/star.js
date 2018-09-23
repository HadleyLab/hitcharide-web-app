import React from 'react';
import PropTypes from 'prop-types';

export const StarIcon = ({ color }) => (
    <svg width="100%" height="100%" viewBox="0 0 33 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={'M16.5 0L20.2045 11.4012H32.1924L22.494 18.4476L26.1985 29.8488L16.5 '
                + '22.8024L6.80154 29.8488L10.506 18.4476L0.807568 11.4012H12.7955L16.5 0Z'}
            fill={color}
        />
    </svg>
);

StarIcon.propTypes = {
    color: PropTypes.string,
};

StarIcon.defaultProps = {
    color: '#C4C4C4',
};
