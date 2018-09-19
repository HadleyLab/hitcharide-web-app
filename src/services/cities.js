import {
    buildGetService, defaultHeaders, dehydrateBundle, paramsToString,
} from './base';

export function getStatesService(handler) {
    return (cursor, params) => {
        const service = buildGetService(
            `/places/state/${paramsToString(params)}`,
            dehydrateBundle,
            defaultHeaders
        );

        return service(handler, cursor);
    };
}

export function getCitiesService(handler) {
    return (cursor, params) => {
        const service = buildGetService(
            `/places/city/${paramsToString(params)}`,
            dehydrateBundle,
            defaultHeaders,
        );

        return service(handler, cursor);
    };
}
