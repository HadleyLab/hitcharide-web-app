import _ from 'lodash';
import { getToken } from 'components/utils';
import {
    buildGetService, buildPostService, defaultHeaders, paramsToString,
} from './base';

export function addRideService(cursor, data) {
    const headers = {
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

export function getRidesListService(cursor, params) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildGetService(
        `/rides/list/${paramsToString(params)}`,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}

export function getRidesIHaveCreatedService(cursor) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    const service = buildGetService(
        '/rides/ride/my',
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}
