import { buildPostService, buildGetService, defaultHeaders } from './base';

export function getMyProfileService(token, cursor) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    const service = buildGetService(
        '/accounts/my/',
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );

    return service(cursor);
}
