import React from 'react';
// import _ from 'lodash';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import { Title } from 'components';

const model = {

};

export const RideDetailsPage = schema(model)(createReactClass({
    render() {
        return (
            <div>
                <Title>Trip information</Title>
                <Title>Number of reserved seats</Title>
            </div>
        );
    },
}));
