import _ from 'lodash';
import {
    buildGetService, buildPostService,
    defaultHeaders, hydrateFormData,
} from './base';

export function addCarImageService(handler, token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk, data) => {
        const service = buildPostService(
            `/rides/car/${pk}/images/`,
            'POST',
            hydrateFormData,
            _.identity,
            headers
        );

        return service(handler, cursor, data);
    };
}

export function addCarService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
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

export function removeCarService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk) => {
        const service = buildPostService(
            `/rides/car/${pk}/`,
            'DELETE',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getCarListService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
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
