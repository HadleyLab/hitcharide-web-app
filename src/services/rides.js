import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function addRideService(token, cursor, data) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
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

export function addCarService(token, cursor, data) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
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

export function getCarListService(token, cursor) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    const service = buildGetService(
        '/rides/car/',
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}
