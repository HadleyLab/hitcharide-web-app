import _ from 'lodash';
import { getToken } from 'components/utils';
import {
    buildGetService, buildPostService, defaultHeaders, paramsToString,
} from './base';

export function createRideService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/rides/ride/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function requestRideService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/rides/request/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function addCarService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/rides/car/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function getCarListService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor) => {
        const service = buildGetService(
            '/rides/car/',
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

function dehydrateRidesList(data, { toMerge = false, previousResults = [] }) {
    if (toMerge) {
        const results = _.concat([], previousResults, data.results);

        return _.assign({}, data, { results });
    }

    return data;
}

export function getRidesListService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/ride/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getRidesIHaveCreatedService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor) => {
        const service = buildGetService(
            '/rides/ride/my',
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getRideService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, pk) => {
        const service = buildGetService(
            `/rides/ride/${pk}`,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function bookRideService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/rides/booking/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}
