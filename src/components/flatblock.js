import React from 'react';
import createReactClass from 'create-react-class';
import BaobabPropTypes from 'baobab-prop-types';
import PropTypes from 'prop-types';
import schema from 'libs/state';

const model = {
    content: null,
};

export default schema(model)(createReactClass({
    displayName: 'FlatBlock',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        service: PropTypes.func.isRequired,
        slug: PropTypes.string.isRequired,
    },

    componentDidMount() {
        const { service, slug, tree } = this.props;

        service(tree.content, slug);
    },

    render() {
        const content = this.props.tree.content.get();
        console.log(content);

        if (content && content.status === 'Succeed') {
            return (
                <div dangerouslySetInnerHTML={{__html: content.data.content}}/>
            )
        } else {
            return (
                <div>
                    Loading...
                </div>
            )
        }
    }
}));
