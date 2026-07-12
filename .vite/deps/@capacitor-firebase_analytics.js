import { registerPlugin } from "./@capacitor_core.js";
//#region node_modules/@capacitor-firebase/analytics/dist/esm/definitions.js
/**
* @since 6.0.0
*/
var ConsentType;
(function(ConsentType) {
	/**
	* @since 6.0.0
	*/
	ConsentType["AdPersonalization"] = "AD_PERSONALIZATION";
	/**
	* @since 6.0.0
	*/
	ConsentType["AdStorage"] = "AD_STORAGE";
	/**
	* @since 6.0.0
	*/
	ConsentType["AdUserData"] = "AD_USER_DATA";
	/**
	* @since 6.0.0
	*/
	ConsentType["AnalyticsStorage"] = "ANALYTICS_STORAGE";
	/**
	* @since 6.0.0
	*/
	ConsentType["FunctionalityStorage"] = "FUNCTIONALITY_STORAGE";
	/**
	* @since 6.0.0
	*/
	ConsentType["PersonalizationStorage"] = "PERSONALIZATION_STORAGE";
})(ConsentType || (ConsentType = {}));
/**
* @since 6.0.0
*/
var ConsentStatus;
(function(ConsentStatus) {
	/**
	* @since 6.0.0
	*/
	ConsentStatus["Granted"] = "GRANTED";
	/**
	* @since 6.0.0
	*/
	ConsentStatus["Denied"] = "DENIED";
})(ConsentStatus || (ConsentStatus = {}));
//#endregion
//#region node_modules/@capacitor-firebase/analytics/dist/esm/index.js
var FirebaseAnalytics = registerPlugin("FirebaseAnalytics", { web: () => import("./web-aIGiui9i.js").then((m) => new m.FirebaseAnalyticsWeb()) });
//#endregion
export { ConsentStatus, ConsentType, FirebaseAnalytics };

//# sourceMappingURL=@capacitor-firebase_analytics.js.map