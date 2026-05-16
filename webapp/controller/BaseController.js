sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	/**
	 * Base controller for all application controllers
	 * Provides common functionality and utilities
	 */
	return Controller.extend("my.sample.app.controller.BaseController", {

		/**
		 * Get the application component
		 */
		getAppComponent: function () {
			return this.getOwnerComponent();
		},

		/**
		 * Get router instance
		 */
		getRouter: function () {
			return this.getAppComponent().getRouter();
		},

		/**
		 * Navigate to a route by name
		 */
		navTo: function (sRouteName, oParameters, bReplace) {
			this.getRouter().navTo(sRouteName, oParameters, bReplace || false);
		},

		/**
		 * Get model by name
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName) || this.getAppComponent().getModel(sName);
		},

		/**
		 * Set model
		 */
		setModel: function (oModel, sName) {
			this.getView().setModel(oModel, sName);
		},

		/**
		 * Get i18n bundle
		 */
		getResourceBundle: function () {
			return this.getAppComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Get translated text
		 */
		getText: function (sKey, aParams) {
			var oBundle = this.getResourceBundle();
			if (aParams) {
				return oBundle.getText(sKey, aParams);
			}
			return oBundle.getText(sKey);
		},

		/**
		 * Navigate back in history
		 */
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.navTo("home", {}, true);
			}
		},

		/**
		 * Show info message
		 */
		showMessage: function (sMessage, sType) {
			var sIcon = "sap-icon://message-information";
			var sDuration = 3000;
			
			switch (sType) {
				case "success":
					sIcon = "sap-icon://message-success";
					sDuration = 3000;
					break;
				case "error":
					sIcon = "sap-icon://message-error";
					sDuration = 5000;
					break;
				case "warning":
					sIcon = "sap-icon://message-warning";
					sDuration = 4000;
					break;
				default:
					sDuration = 3000;
			}
			
			sap.m.MessageToast.show(sMessage, {
				duration: sDuration,
				icon: sIcon
			});
		},

		/**
		 * Format date to readable string
		 */
		formatDate: function (oDate) {
			if (!oDate) return "";
			if (typeof oDate === "string") {
				oDate = new Date(oDate);
			}
			return oDate.toLocaleDateString();
		},

		/**
		 * Format currency
		 */
		formatCurrency: function (nValue, sCurrency) {
			if (!nValue) return "";
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: sCurrency || 'USD'
			}).format(nValue);
		},

		/**
		 * Get current user from session
		 */
		getCurrentUser: function () {
			var oSessionModel = this.getModel("session");
			if (oSessionModel) {
				return oSessionModel.getProperty("/user");
			}
			return null;
		},

		/**
		 * Check if user has a specific role
		 */
		hasRole: function (sRole) {
			var oUser = this.getCurrentUser();
			if (!oUser) return false;
			return oUser.role === sRole;
		},

		/**
		 * Log message to console
		 */
		log: function (sMessage, oData) {
			console.log("[" + this.getMetadata().getName() + "] " + sMessage, oData || "");
		},

		/**
		 * Log error to console
		 */
		logError: function (sMessage, oError) {
			console.error("[" + this.getMetadata().getName() + "] " + sMessage, oError || "");
		}
	});
});
