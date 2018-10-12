import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';


export default createReactClass({
    displayName: 'Portal',

    componentDidMount() {
        this.node = document.createElement('div');
        this.node.className = 'portal';
        document.body.appendChild(this.node);
        this.renderPortal();
    },

    componentDidUpdate() {
        this.renderPortal();
    },

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this.node);
        document.body.removeChild(this.node);
    },

    node: {},

    renderPortal() {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            this.props.children,
            this.node,
        );
    },

    render() {
        return null;
    },
});
