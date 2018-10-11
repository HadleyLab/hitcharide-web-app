import _ from 'lodash';
import {
    buildGetService, buildPostService, defaultHeaders, paramsToString,
} from './base';

export function createRideService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
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

export function requestRideService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
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

function dehydrateRidesList(data, { toMerge = false, previousResults = [] }) {
    if (toMerge) {
        const results = _.concat([], previousResults, data.results);

        return _.assign({}, data, { results });
    }

    return data;
}

export function getRidesListService(handler) {
    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/ride/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            defaultHeaders
        );

        return service(handler, cursor);
    };
}

export function getRideRequestsListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/request/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getMyRidesListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/ride/my/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getMyRideRequestsListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/request/my/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getMyBookingsListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params, dehydrateParams = {}) => {
        const service = buildGetService(
            `/rides/booking/${paramsToString(params)}`,
            (data) => dehydrateRidesList(data, dehydrateParams),
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getRideService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk) => {
        const service = buildGetService(
            `/rides/ride/${pk}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getRideRequestService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk) => {
        const service = buildGetService(
            `/rides/request/${pk}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function bookRideService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
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

export function rideComplainService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk, data) => {
        const service = buildPostService(
            '/rides/complaint/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function rideDeleteService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk, data) => {
        const service = buildPostService(
            `/rides/ride/${pk}/cancel/`,
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function bookingCancelService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk, data) => {
        const service = buildPostService(
            `/rides/booking/${pk}/cancel/`,
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}
