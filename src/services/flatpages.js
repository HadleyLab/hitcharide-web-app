import {
    buildGetService, defaultHeaders
} from './base';


export function getFlatpageService(handler) {
    return (cursor, slug) => {
        const service = buildGetService(
            `/flatpages/${slug}/`,
            _.identity,
            defaultHeaders
        );

        return service(handler, cursor);
    };
}
