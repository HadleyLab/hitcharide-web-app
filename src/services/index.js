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
    getMyRidesListService, getRidesListService,
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
    createRideService,
    addCarService,
    getCarListService,
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
