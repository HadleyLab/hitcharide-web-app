import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Loader } from 'components';
import { ProfileContent } from './profile-content';

export const UserProfilePage = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                pk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        services: PropTypes.shape({
            getUserProfileService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async componentDidMount() {
        const { getUserProfileService } = this.props.services;
        const { pk } = this.props.match.params;

        await getUserProfileService(this.props.tree, pk);
    },

    render() {
        const profile = this.props.tree.get();
        const isRideLoaded = profile && profile.status === 'Succeed';

        return (
            <Loader isLoaded={isRideLoaded}>
                {isRideLoaded ? (
                    <ProfileContent
                        profile={profile.data}
                        cars={profile.data.cars}
                    />
                ) : null }
            </Loader>
        );
    },
});
