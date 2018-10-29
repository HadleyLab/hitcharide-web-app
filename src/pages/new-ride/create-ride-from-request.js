import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { Loader } from 'components';
import schema from 'libs/state';
import { BaseCreateRideForm } from './base-create-ride';
import { Modal } from 'antd-mobile/lib/index';

const model = {
    request: {},
};

export const CreateRideFromRequestForm = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
        }).isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                requestPk: PropTypes.string.isRequired,
            }),
        }).isRequired,
        services: PropTypes.shape({
            getRideRequestService: PropTypes.func.isRequired,
        }).isRequired,
    },

    async componentWillMount() {
        const { history, match: { params: { requestPk } } } = this.props;
        const { getRideRequestService } = this.props.services;
        const result = await getRideRequestService(this.props.tree.request, requestPk);

        if (result.status === 'Failed') {
            Modal.alert('Fetching ride request error', result.error.data.detail,
                [
                    {
                        text: 'OK',
                        onPress: () => history.goBack(),
                        style: { color: '#4263CA' },
                    },
                ]
            );
        }
    },

    render() {
        const request = this.props.tree.request.get();
        const isLoaded = request.status === 'Succeed';

        return (
            <Loader isLoaded={isLoaded}>
                <BaseCreateRideForm
                    {...this.props}
                    initData={_.pick(request.data, ['cityFrom', 'cityTo', 'dateTime'])}
                />
            </Loader>
        );
    },
}));
