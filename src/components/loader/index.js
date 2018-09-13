import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'antd-mobile';
import s from './loader.css';

export class Loader extends React.Component {
    render() {
        const { data, children } = this.props;

        if (!_.isEmpty(data) && data.status === 'Succeed') {
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
    data: PropTypes.shape(),
    children: PropTypes.node,
};

Loader.defaultProps = {
    data: {},
    children: <div />,
};
