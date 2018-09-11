import _ from 'lodash';
import { buildPostService, defaultHeaders } from './base';

export const signInService = buildPostService(
    '/accounts/login/'
);

export const signUpService = buildPostService(
    '/accounts/register/'
);

export function activateAccountService(cursor, data) {
    const service = buildPostService(
        '/accounts/activate/',
        'POST',
        JSON.stringify,
        _.identity,
        defaultHeaders,
    );

    return service(cursor, data);
}
