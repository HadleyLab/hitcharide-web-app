import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';
import { Link } from 'react-router-dom';
import { activateAccountService } from 'services';

export const ActivateAccountPage = createReactClass({
    async componentDidMount() {
        const { params } = this.props.match;
        await activateAccountService(this.props.tree, params);
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
                    <Link to="/login">Sign In</Link><br /><br />
                    <Link to="/registration">Sign Up</Link><br /><br />
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
