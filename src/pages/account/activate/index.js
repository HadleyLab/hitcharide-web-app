import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Link } from 'react-router-dom';

export const ActivateAccountPage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                uid: PropTypes.string.isRequired,
                token: PropTypes.string.isRequired,
            }),
        }).isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            activateAccountService: PropTypes.func.isRequired,
        }),
    },

    async componentDidMount() {
        const { params } = this.props.match;
        const service = this.context.services.activateAccountService;

        await service(this.props.tree, params);
    },

    render() {
        const result = this.props.tree.get();

        if (_.isEmpty(result)) {
            return null;
        }

        if (result.status === 'Succeed') {
            return (
                <div>
                    Your account has been successfully activated<br /><br />
                    <Link to="/account/login">Sign In</Link><br /><br />
                    <Link to="/account/registration">Sign Up</Link><br /><br />
                </div>
            );
        }


        return (
            <div>
                Something went wrong<br />
                {result.error ? result.error.data.detail : null}
            </div>
        );
    },
});
