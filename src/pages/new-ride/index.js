import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Flex, Button } from 'antd-mobile';
import { CreateRideForm } from './create-ride';
import { SuggestRideForm } from './suggest-ride';
import s from './new-ride.css';

export const NewRidePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        creationRights: PropTypes.shape({
            allowed: PropTypes.bool.isRequired,
            message: PropTypes.string,
        }).isRequired,
        userType: PropTypes.string.isRequired,
    },

    render() {
        const { creationRights } = this.props;
        const isDriver = this.props.userType === 'driver';

        if (!creationRights.allowed) {
            return (
                <div className={s.error}>
                    <div className={s.title}>Create a ride</div>
                    <div className={s.errorText}>{creationRights.message}</div>
                    <Flex justify="center">
                        <Button
                            type="primary"
                            inline
                            style={{ width: 250 }}
                            onClick={() => this.props.history.push('/app/profile/edit')}
                        >
                            Go to profile
                        </Button>
                    </Flex>
                </div>
            );
        }

        if (isDriver) {
            return <CreateRideForm {...this.props} tree={this.props.tree.select('createRide')} />;
        }

        return <SuggestRideForm {...this.props} tree={this.props.tree.select('suggestRide')} />;
    },
});
