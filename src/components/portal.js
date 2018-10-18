import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';

export default createReactClass({
    displayName: 'Portal',

    propTypes: {
        children: PropTypes.node.isRequired,
    },

    componentWillMount() {
        this.node = document.createElement('div');
        this.node.className = 'portal';
        document.body.appendChild(this.node);
    },

    componentWillUnmount() {
        document.body.removeChild(this.node);
    },

    node: null,

    render() {
        if (this.node) {
            return ReactDOM.createPortal(
                this.props.children,
                this.node
            );
        }

        return null;
    },
});
