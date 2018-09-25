import {
    signUpService, signInService, setNewPasswordService,
    activateAccountService, resetPasswordService,
} from './auth.js';
import { getStatesService, getCitiesService } from './cities.js';
import {
    getMyProfileService, updateProfileService, getUserProfileService,
    sendPhoneVerificationCodeService, checkPhoneVerificationCodeService,
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
    resetPasswordService,
    setNewPasswordService,
    getStatesService,
    getCitiesService,
    getUserProfileService,
    getMyProfileService,
    updateProfileService,
    sendPhoneVerificationCodeService,
    checkPhoneVerificationCodeService,
    createRideService,
    addCarService,
    getCarListService,
    getRidesIHaveCreatedService,
    getRidesListService,
    getRideService,
    bookRideService,
    requestRideService,
};
