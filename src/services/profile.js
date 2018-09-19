import _ from 'lodash';
import { getToken } from 'components/utils';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function getMyProfileService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
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

// function hydrateData(profile) {
//     let data = new FormData();
//
//     _.forEach(profile, (field, key) => data.append(key, field));
//
//     return data;
// }

export function updateProfileService(handler) {
    const headers = {
        // 'Content-Type': 'multipart/form-data',
        Authorization: `JWT ${getToken()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/my/',
            'PUT',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

export function verifyPhoneNumberService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
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

export function checkPhoneCodeService(handler) {
    const headers = {
        Authorization: `JWT ${getToken()}`,
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
