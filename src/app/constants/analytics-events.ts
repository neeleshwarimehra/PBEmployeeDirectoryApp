export const ANALYTICS_EVENTS = {
  // App
  APP_OPEN: "app_open",
  SESSION_START: "session_start",
  // Authentication
  SPLASH: "splash_view",
  LOGIN: "login_view",
  SEND_OTP: "send_otp",
  SEND_OTP_API: "send_otp_api",
  VERIFY_OTP: "verify_otp",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAIL: "login_fail",
  LOGOUT: "logout",
  LOGOUT_SUCCESS: "logout_success",
  LOGOUT_FAIL: "logout_fail",
  SESSION_CLOSED: "session_close",

  SESSION_START_ANDROID: "session_start_android",
  SESSION_START_IOS: "session_start_ios",
  SESSION_START_WEB: "session_start_web",

  // Search
  SEARCH_EMPLOYEE: "search_employee",
  SEARCH_NO_RESULTS: "search_no_results",
  AUDIO_SEARCH: "voice_search",

  //reset
  RESET_EMPLOYEE: "reset_employee",
  RESET_FILTER: "reset_filter",
  APPLY_FILTER: "apply_filter",

  // Home
  HOME_VIEW: "home_view",
  EMPLOYEE_SHARE: "employee_share",
  APP_SHARE: "employee_share",

  // Communication
  CALL_EMPLOYEE: "call_employee",
  EMAIL_EMPLOYEE: "email_employee",
  WHATSAPP_EMPLOYEE: "whatsapp_emp",
  MESSAGE_EMPLOYEE: "whatsapp_emp",
  // Favourites
  ADD_FAVOURITE: "add_favourite",
  REMOVE_FAVOURITE: "remove_favourite",
  VIEW_FAVOURITES: "view_favourites",

  // Filters
  STATION_FILTER: "station_filter",
  DESIGNATION_FILTER: "designation_filter",
  LOCATION_FILTER: "location_filter",
  CLEAR_FILTERS: "clear_filters",

  // Screens
  VIEW_HOME: "view_home",
  VIEW_EMPLOYEE_LIST: "view_employee_list",
  VIEW_EMPLOYEE_DETAILS: "view_employee_details",
  VIEW_PROFILE: "view_profile",
  VIEW_CONTAACTDETAILS: "view_contact_details", //1

  // Data
  RESET_EMPLOYEE_LIST: "reset_employee_list",
  SHARE_EMPLOYEE_DETAILS: "share_employee_details", //2
  SHARE_APP_INFO: "share_app_info", //3

  // Errors
  API_ERROR: "api_error",
  APP_ERROR: "app_error",

  // Feedback
  FEEDBACK_SUBMITTED: "feedback_submitted",
} as const;
