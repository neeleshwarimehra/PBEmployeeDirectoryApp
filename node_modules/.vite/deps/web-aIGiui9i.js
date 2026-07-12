import { WebPlugin } from "./@capacitor_core.js";
import { ConsentStatus, ConsentType } from "./@capacitor-firebase_analytics.js";
import { a as logEvent, d as setUserProperties, o as setAnalyticsCollectionEnabled, s as setConsent, t as getAnalytics, u as setUserId } from "./index.esm-BV6S3lGZ.js";
//#region node_modules/@capacitor-firebase/analytics/dist/esm/web.js
var FirebaseAnalyticsWeb = class extends WebPlugin {
	async getAppInstanceId() {
		throw this.unimplemented("Not implemented on web.");
	}
	async setConsent(options) {
		const status = options.status === ConsentStatus.Granted ? "granted" : "denied";
		const consentSettings = {};
		switch (options.type) {
			case ConsentType.AdPersonalization:
				consentSettings.ad_personalization = status;
				break;
			case ConsentType.AdStorage:
				consentSettings.ad_storage = status;
				break;
			case ConsentType.AdUserData:
				consentSettings.ad_user_data = status;
				break;
			case ConsentType.AnalyticsStorage:
				consentSettings.analytics_storage = status;
				break;
			case ConsentType.FunctionalityStorage:
				consentSettings.functionality_storage = status;
				break;
			case ConsentType.PersonalizationStorage:
				consentSettings.personalization_storage = status;
				break;
		}
		setConsent(consentSettings);
	}
	async setUserId(options) {
		setUserId(getAnalytics(), options.userId);
	}
	async setUserProperty(options) {
		setUserProperties(getAnalytics(), { [options.key]: options.value });
	}
	async setCurrentScreen(options) {
		logEvent(getAnalytics(), "screen_view", {
			firebase_screen: options.screenName || void 0,
			firebase_screen_class: options.screenClassOverride || void 0
		});
	}
	async logEvent(options) {
		logEvent(getAnalytics(), options.name, options.params);
	}
	async logTransaction(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
	async setSessionTimeoutDuration(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
	async setEnabled(_options) {
		setAnalyticsCollectionEnabled(getAnalytics(), _options.enabled);
	}
	async isEnabled() {
		return { enabled: window["ga-disable-analyticsId"] === true };
	}
	async resetAnalyticsData() {
		throw this.unimplemented("Not implemented on web.");
	}
	async initiateOnDeviceConversionMeasurementWithEmailAddress(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
	async initiateOnDeviceConversionMeasurementWithPhoneNumber(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
	async initiateOnDeviceConversionMeasurementWithHashedEmailAddress(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
	async initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(_options) {
		throw this.unimplemented("Not implemented on web.");
	}
};
//#endregion
export { FirebaseAnalyticsWeb };

//# sourceMappingURL=web-aIGiui9i.js.map