import _ from 'lodash';
import { buildPostService, defaultHeaders } from './base';

export function signInService(handler) {
    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/login/',
            'POST',
            JSON.stringify,
            _.identity,
            defaultHeaders,
        );

        return service(handler, cursor, data);
    };
}

export function signUpService(handler) {
    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/register/',
            'POST',
            JSON.stringify,
            _.identity,
            defaultHeaders,
        );

        return service(handler, cursor, data);
    };
}

export function activateAccountService(handler) {
    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/activate/',
            'POST',
            JSON.stringify,
            _.identity,
            defaultHeaders,
        );

        return service(handler, cursor, data);
    };
}

export function resetPasswordService(handler) {
    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/password/reset/',
            'POST',
            JSON.stringify,
            _.identity,
            defaultHeaders,
        );

        return service(handler, cursor, data);
    };
}

export function setNewPasswordService(handler) {
    return (cursor, data) => {
        const service = buildPostService(
            '/accounts/password/reset/confirm/',
            'POST',
            JSON.stringify,
            _.identity,
            defaultHeaders,
        );

        return service(handler, cursor, data);
    };
}
