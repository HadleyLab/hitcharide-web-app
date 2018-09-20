import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd-mobile';
import s from './loader.css';

export class Loader extends React.Component {
    render() {
        const { isLoaded, children } = this.props;

        if (isLoaded) {
            return children;
        }

        return (
            <div className={s.container}>
                <Icon type="loading" size="md" />
            </div>
        );
    }
}

Loader.propTypes = {
    isLoaded: PropTypes.bool,
    children: PropTypes.node,
};

Loader.defaultProps = {
    isLoaded: false,
    children: <div />,
};
