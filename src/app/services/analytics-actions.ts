import { trackEvent } from "./analytics";
import { ANALYTICS_EVENTS } from "../constants/analytics-events";

export const logGoogleAnalytics = {
  // App
  appOpen() {
    return trackEvent(ANALYTICS_EVENTS.APP_OPEN);
  },

  sessionStart() {
    return trackEvent(ANALYTICS_EVENTS.SESSION_START);
  },

  sessionClosed() {
    return trackEvent(ANALYTICS_EVENTS.SESSION_CLOSED);
  },

  sessionStartAndroid() {
    return trackEvent(ANALYTICS_EVENTS.SESSION_START_ANDROID);
  },
  sessionStartIOS() {
    return trackEvent(ANALYTICS_EVENTS.SESSION_START_IOS);
  },
  sessionStartWEB() {
    return trackEvent(ANALYTICS_EVENTS.SESSION_START_WEB);
  },

  // Authentication
  splashView() {
    return trackEvent(ANALYTICS_EVENTS.SPLASH);
  },

  loginView() {
    return trackEvent(ANALYTICS_EVENTS.LOGIN);
  },

  sendOtp() {
    return trackEvent(ANALYTICS_EVENTS.SEND_OTP);
  },

  sendOtpAPI() {
    return trackEvent(ANALYTICS_EVENTS.SEND_OTP);
  },

  verifyOtp() {
    return trackEvent(ANALYTICS_EVENTS.VERIFY_OTP);
  },

  loginSuccess() {
    return trackEvent(ANALYTICS_EVENTS.LOGIN_SUCCESS);
  },

  loginFail() {
    return trackEvent(ANALYTICS_EVENTS.LOGIN_FAIL);
  },

  logout() {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT);
  },

  logoutSuccess() {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT_SUCCESS);
  },

  logoutFail() {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT_FAIL);
  },

  // Search
  searchEmployee() {
    return trackEvent(ANALYTICS_EVENTS.SEARCH_EMPLOYEE);
  },

  searchResult() {
    return trackEvent(ANALYTICS_EVENTS.SEARCH_RESULT);
  },

  audioSearch() {
    return trackEvent(ANALYTICS_EVENTS.AUDIO_SEARCH);
  },

  // Employee
  homeView() {
    return trackEvent(ANALYTICS_EVENTS.HOME_VIEW);
  },

  employeeShare() {
    return trackEvent(ANALYTICS_EVENTS.EMPLOYEE_SHARE);
  },

  resetButton() {
    return trackEvent(ANALYTICS_EVENTS.RESET_EMPLOYEE);
  },

  resetFilter() {
    return trackEvent(ANALYTICS_EVENTS.RESET_FILTER);
  },
  applyFilter() {
    return trackEvent(ANALYTICS_EVENTS.APPLY_FILTER);
  },
  appPBShare() {
    return trackEvent(ANALYTICS_EVENTS.APP_SHARE);
  },

  // Communication
  callEmployee() {
    return trackEvent(ANALYTICS_EVENTS.CALL_EMPLOYEE);
  },

  emailEmployee() {
    return trackEvent(ANALYTICS_EVENTS.EMAIL_EMPLOYEE);
  },

  whatsAppEmployee() {
    return trackEvent(ANALYTICS_EVENTS.WHATSAPP_EMPLOYEE);
  },

  messageMobile() {
    return trackEvent(ANALYTICS_EVENTS.MESSAGE_EMPLOYEE);
  },

  // Favourites
  addFavourite() {
    return trackEvent(ANALYTICS_EVENTS.ADD_FAVOURITE);
  },

  removeFavourite() {
    return trackEvent(ANALYTICS_EVENTS.REMOVE_FAVOURITE);
  },

  viewFavourites() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_FAVOURITES);
  },

  // Filters
  departmentFilter() {
    return trackEvent(ANALYTICS_EVENTS.STATION_FILTER);
  },

  designationFilter() {
    return trackEvent(ANALYTICS_EVENTS.DESIGNATION_FILTER);
  },

  // Screens
  viewHome() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_HOME);
  },

  viewEmployeeList() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_EMPLOYEE_LIST);
  },

  viewEmployeeDetails() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_EMPLOYEE_DETAILS);
  },

  viewProfile() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_PROFILE);
  },

  viewContactDetails() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_CONTAACTDETAILS);
  },

  // Data
  resetEmployeeList() {
    return trackEvent(ANALYTICS_EVENTS.RESET_EMPLOYEE_LIST);
  },

  shareEmployeeDetails() {
    return trackEvent(ANALYTICS_EVENTS.SHARE_EMPLOYEE_DETAILS);
  },

  shareAppInfo() {
    return trackEvent(ANALYTICS_EVENTS.SHARE_APP_INFO);
  },

  // Errors
  apiError() {
    return trackEvent(ANALYTICS_EVENTS.API_ERROR);
  },
  //APP ERROR

  // appError() {
  //   return trackEvent(ANALYTICS_EVENTS.APP_ERROR);
  // },
  appError(error: string) {
    return trackEvent(ANALYTICS_EVENTS.APP_ERROR, {
      error,
    });
  },

  // Feedback
  feedbackSubmitted() {
    return trackEvent(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED);
  },

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //DYNAMIC

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
};
