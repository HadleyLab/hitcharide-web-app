import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function getMyProfileService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor) => {
        const service = buildGetService(
            '/accounts/my/',
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function getUserProfileService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk) => {
        const service = buildGetService(
            `/accounts/${pk}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

function hydrateData(profile) {
    let data = new FormData();

    _.forEach(profile, (value, key) => data.append(key, value));

    return data;
}

export function updateProfileService(handler, token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/my/',
            'PUT',
            hydrateData,
            _.identity,
            headers
        );

        return service(handler, cursor, data);
    };
}

export function sendPhoneVerificationCodeService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor) => {
        const service = buildPostService(
            '/accounts/send_phone_validation_code/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor);
    };
}

export function checkPhoneVerificationCodeService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/validate_phone/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function addCarImageService(handler, token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, pk, data) => {
        const service = buildPostService(
            `/rides/car/${pk}/images/`,
            'POST',
            hydrateData,
            _.identity,
            headers
        );

        return service(handler, cursor, data);
    };
}
