sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
	"use strict";

	return Object.extend("my.sample.app.service.APIService", {
		constructor: function () {
			this._sBaseUrl = "/api"; // Base URL for REST API
		},

		/**
		 * Get all departments
		 * @returns {Promise} Promise with departments data
		 */
		getDepartments: function () {
			return this._makeRequest("GET", "/departments");
		},

		/**
		 * Get department by ID
		 * @param {string} sDepartmentId - Department ID
		 * @returns {Promise} Promise with department data
		 */
		getDepartmentById: function (sDepartmentId) {
			return this._makeRequest("GET", "/departments/" + sDepartmentId);
		},

		/**
		 * Create new department
		 * @param {Object} oData - Department data
		 * @returns {Promise} Promise with response
		 */
		createDepartment: function (oData) {
			return this._makeRequest("POST", "/departments", oData);
		},

		/**
		 * Update department
		 * @param {string} sDepartmentId - Department ID
		 * @param {Object} oData - Updated data
		 * @returns {Promise} Promise with response
		 */
		updateDepartment: function (sDepartmentId, oData) {
			return this._makeRequest("PUT", "/departments/" + sDepartmentId, oData);
		},

		/**
		 * Delete department
		 * @param {string} sDepartmentId - Department ID
		 * @returns {Promise} Promise with response
		 */
		deleteDepartment: function (sDepartmentId) {
			return this._makeRequest("DELETE", "/departments/" + sDepartmentId);
		},

		/**
		 * Get all employees
		 * @returns {Promise} Promise with employees data
		 */
		getEmployees: function () {
			return this._makeRequest("GET", "/employees");
		},

		/**
		 * Get employee by ID
		 * @param {string} sEmployeeId - Employee ID
		 * @returns {Promise} Promise with employee data
		 */
		getEmployeeById: function (sEmployeeId) {
			return this._makeRequest("GET", "/employees/" + sEmployeeId);
		},

		/**
		 * Create new employee
		 * @param {Object} oData - Employee data
		 * @returns {Promise} Promise with response
		 */
		createEmployee: function (oData) {
			return this._makeRequest("POST", "/employees", oData);
		},

		/**
		 * Update employee
		 * @param {string} sEmployeeId - Employee ID
		 * @param {Object} oData - Updated data
		 * @returns {Promise} Promise with response
		 */
		updateEmployee: function (sEmployeeId, oData) {
			return this._makeRequest("PUT", "/employees/" + sEmployeeId, oData);
		},

		/**
		 * Delete employee
		 * @param {string} sEmployeeId - Employee ID
		 * @returns {Promise} Promise with response
		 */
		deleteEmployee: function (sEmployeeId) {
			return this._makeRequest("DELETE", "/employees/" + sEmployeeId);
		},

		/**
		 * Get analytics data
		 * @returns {Promise} Promise with analytics data
		 */
		getAnalytics: function () {
			return this._makeRequest("GET", "/analytics");
		},

		/**
		 * Get department analytics
		 * @returns {Promise} Promise with department analytics
		 */
		getDepartmentAnalytics: function () {
			return this._makeRequest("GET", "/analytics/departments");
		},

		/**
		 * Get hiring trends
		 * @returns {Promise} Promise with hiring trends data
		 */
		getHiringTrends: function () {
			return this._makeRequest("GET", "/analytics/hiring-trends");
		},

		/**
		 * Get employee distribution
		 * @returns {Promise} Promise with distribution data
		 */
		getEmployeeDistribution: function () {
			return this._makeRequest("GET", "/analytics/distribution");
		},

		/**
		 * Get all leaves
		 * @returns {Promise} Promise with leaves data
		 */
		getLeaves: function () {
			return this._makeRequest("GET", "/leaves");
		},

		/**
		 * Approve leave
		 * @param {string} sLeaveId - Leave ID
		 * @returns {Promise} Promise with response
		 */
		approveLeave: function (sLeaveId) {
			return this._makeRequest("PUT", "/leaves/" + sLeaveId + "/approve");
		},

		/**
		 * Reject leave
		 * @param {string} sLeaveId - Leave ID
		 * @returns {Promise} Promise with response
		 */
		rejectLeave: function (sLeaveId) {
			return this._makeRequest("PUT", "/leaves/" + sLeaveId + "/reject");
		},

		/**
		 * Make HTTP request
		 * @private
		 */
		_makeRequest: function (sMethod, sPath, oData) {
			return new Promise(function (resolve, reject) {
				var sUrl = this._sBaseUrl + sPath;
				var oSettings = {
					method: sMethod,
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					}
				};

				if (oData && (sMethod === "POST" || sMethod === "PUT" || sMethod === "PATCH")) {
					oSettings.body = JSON.stringify(oData);
				}

				fetch(sUrl, oSettings)
					.then(function (oResponse) {
						if (!oResponse.ok) {
							throw new Error("HTTP error, status = " + oResponse.status);
						}
						return oResponse.json();
					})
					.then(function (oResult) {
						resolve(oResult);
					})
					.catch(function (oError) {
						reject({
							status: "error",
							message: oError.message,
							details: oError
						});
					});
			}.bind(this));
		}
	});
});
