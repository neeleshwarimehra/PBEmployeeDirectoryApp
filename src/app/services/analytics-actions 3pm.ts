import { trackEvent } from "./analytics";
import { ANALYTICS_EVENTS } from "../constants/analytics-events";

export const logGoogleAnalytics = {
  logoutSuccess() {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT_SUCCESS);
  },

  logoutFail(error?: string) {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT_FAIL, {
      error,
    });
  },

  //dynamic
  login(method: string) {
    return trackEvent(ANALYTICS_EVENTS.LOGIN, { method });
  },

  logout() {
    return trackEvent(ANALYTICS_EVENTS.LOGOUT);
  },

  searchEmployee(keyword: string) {
    return trackEvent(ANALYTICS_EVENTS.SEARCH_EMPLOYEE, { keyword });
  },

  searchNoResults(keyword: string) {
    return trackEvent(ANALYTICS_EVENTS.SEARCH_NO_RESULTS, { keyword });
  },

  employeeView(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.EMPLOYEE_VIEW, {
      employee_id: employeeId,
    });
  },

  employeeShare(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.EMPLOYEE_SHARE, {
      employee_id: employeeId,
    });
  },

  callEmployee(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.CALL_EMPLOYEE, {
      employee_id: employeeId,
    });
  },

  emailEmployee(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.EMAIL_EMPLOYEE, {
      employee_id: employeeId,
    });
  },

  addFavourite(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.ADD_FAVOURITE, {
      employee_id: employeeId,
    });
  },

  removeFavourite(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.REMOVE_FAVOURITE, {
      employee_id: employeeId,
    });
  },

  viewFavourites() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_FAVOURITES);
  },

  departmentFilter(department: string) {
    return trackEvent(ANALYTICS_EVENTS.DEPARTMENT_FILTER, {
      department,
    });
  },

  viewHome() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_HOME);
  },

  viewEmployeeList() {
    return trackEvent(ANALYTICS_EVENTS.VIEW_EMPLOYEE_LIST);
  },

  viewEmployeeDetails(employeeId: string) {
    return trackEvent(ANALYTICS_EVENTS.VIEW_EMPLOYEE_DETAILS, {
      employee_id: employeeId,
    });
  },

  apiError(endpoint: string, error: string) {
    return trackEvent(ANALYTICS_EVENTS.API_ERROR, {
      endpoint,
      error,
    });
  },

  appError(error: string) {
    return trackEvent(ANALYTICS_EVENTS.APP_ERROR, {
      error,
    });
  },
};
