import _ from 'lodash';
import {
    buildGetService, buildPostService,
    defaultHeaders, hydrateFormData,
} from './base';

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

export function updateProfileService(handler, token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/my/',
            'PUT',
            hydrateFormData,
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
