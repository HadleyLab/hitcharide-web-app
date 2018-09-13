import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

export class Loader extends React.Component {
    render() {
        const { data, children } = this.props;

        if (!_.isEmpty(data) && data.status === 'Succeed') {
            return children;
        }

        return (
            <div>Loading...</div>
        );
    }
}

Loader.propTypes = {
    data: PropTypes.shape().isRequired,
    children: PropTypes.node,
};

Loader.defaultProps = {
    children: <div />,
};
