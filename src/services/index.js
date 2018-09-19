import { signUpService, signInService, activateAccountService } from './auth.js';
import { getStatesService, getCitiesService } from './cities.js';
import {
    getMyProfileService, updateProfileService,
    verifyPhoneNumberService, checkPhoneCodeService,
} from './profile.js';
import {
    createRideService, addCarService, getCarListService,
    getRidesIHaveCreatedService, getRidesListService,
    getRideService, bookRideService, requestRideService,
} from './rides.js';

export default {
    signUpService,
    signInService,
    activateAccountService,
    getStatesService,
    getCitiesService,
    getMyProfileService,
    updateProfileService,
    verifyPhoneNumberService,
    checkPhoneCodeService,
    createRideService,
    addCarService,
    getCarListService,
    getRidesIHaveCreatedService,
    getRidesListService,
    getRideService,
    bookRideService,
    requestRideService,
};
