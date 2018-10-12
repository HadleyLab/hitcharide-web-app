import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';


export default createReactClass({
    displayName: 'ModalContext',

    propTypes: {
        modal: PropTypes.any,
    },

    childContextTypes: {
        modal: PropTypes.any,
    },

    getChildContext() {
        return {
            modal: this.props.modal,
        };
    },

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    },
});
