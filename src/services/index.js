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
    addCarImageService, addCarService, getCarListService,
    removeCarService,
} from './car.js';
import {
    createRideService, getMyRidesListService, getRidesListService,
    getRideService, bookRideService, requestRideService,
    getRideRequestsListService, getMyRideRequestsListService,
    getMyBookingsListService, getRideRequestService,
    rideComplainService, rideDeleteService, bookingCancelService,
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
    addCarImageService,
    addCarService,
    getCarListService,
    removeCarService,
    createRideService,
    getMyRidesListService,
    getMyRideRequestsListService,
    getMyBookingsListService,
    getRidesListService,
    getRideRequestsListService,
    getRideService,
    getRideRequestService,
    bookRideService,
    requestRideService,
    rideComplainService,
    rideDeleteService,
    bookingCancelService,
};
