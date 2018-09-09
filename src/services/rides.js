import _ from 'lodash';
import { getToken } from 'components/utils';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function addRideService(cursor, data) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildPostService(
        '/rides/ride/',
        'POST',
        JSON.stringify,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor, data);
}

export function addCarService(cursor, data) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildPostService(
        '/rides/car/',
        'POST',
        JSON.stringify,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor, data);
}

export function getCarListService(cursor) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildGetService(
        '/rides/car/',
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}
