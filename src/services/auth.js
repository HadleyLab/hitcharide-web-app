import { buildPostService } from './base';

export const signInService = buildPostService(
    '/accounts/login/'
);

export const signUpService = buildPostService(
    '/accounts/register/'
);
