import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';


export default createReactClass({
    displayName: 'Portal',
    node: null,

    componentWillMount() {
        this.node = document.createElement('div');
        this.node.className = 'portal';
        document.body.appendChild(this.node);
    },

    componentWillUnmount() {
        document.body.removeChild(this.node);
    },

    render() {
        if (this.node) {
            return ReactDOM.createPortal(
                this.props.children,
                this.node
            );
        } else {
            return null;
        }
    },
});
