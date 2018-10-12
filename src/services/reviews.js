import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function addReviewService(handler, token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/reviews/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return service(handler, cursor, data);
    };
}

// export function getReviesListService(handler, token) {
//     const headers = {
//         Authorization: `JWT ${token}`,
//     };
//
//     return (cursor) => {
//         const service = buildGetService(
//             '/rides/car/',
//             _.identity,
//             _.merge({}, defaultHeaders, headers)
//         );
//
//         return service(handler, cursor);
//     };
// }
