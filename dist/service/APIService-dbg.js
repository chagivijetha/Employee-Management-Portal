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
		 * Make HTTP request with automatic local mock-fallback
		 * @private
		 */
		_makeRequest: function (sMethod, sPath, oData) {
			var self = this;
			return new Promise(function (resolve, reject) {
				var sUrl = self._sBaseUrl + sPath;
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
							// If endpoint is not found (404), fall back to local mock data
							if (oResponse.status === 404) {
								return self._loadMockDataFallback(sPath, sMethod, oData);
							}
							throw new Error("HTTP error, status = " + oResponse.status);
						}
						return oResponse.json();
					})
					.then(function (oResult) {
						resolve(oResult);
					})
					.catch(function (oError) {
						// Network error or fetch failed (e.g. server offline) - try mock fallback
						self._loadMockDataFallback(sPath, sMethod, oData)
							.then(resolve)
							.catch(function () {
								reject({
									status: "error",
									message: oError.message || "REST request failed",
									details: oError
								});
							});
					});
			});
		},

		/**
		 * Fallback mock data handler when backend is unavailable
		 * @private
		 */
		_loadMockDataFallback: function (sPath, sMethod, oData) {
			return new Promise(function (resolve, reject) {
				try {
					var sMockUrl = sap.ui.require.toUrl("my/sample/app/service/mockData.json");
					fetch(sMockUrl)
						.then(function (response) {
							if (!response.ok) {
								throw new Error("Mock file not found");
							}
							return response.json();
						})
						.then(function (oMockData) {
							// Parse path to route requests
							var aParts = sPath.split("/").filter(Boolean);
							var sCollection = aParts[0];
							var sId = aParts[1];
							
							if (sCollection === "departments") {
								if (sId) {
									var oDept = oMockData.departments.find(function (d) { return d.id === sId; });
									if (oDept) {
										resolve(oDept);
									} else {
										reject(new Error("Department not found"));
									}
								} else {
									resolve(oMockData.departments);
								}
							} else if (sCollection === "employees") {
								if (sId) {
									var oEmp = oMockData.employees.find(function (e) { return e.id === sId; });
									if (oEmp) {
										resolve(oEmp);
									} else {
										reject(new Error("Employee not found"));
									}
								} else {
									resolve(oMockData.employees);
								}
							} else if (sCollection === "analytics") {
								var sSub = aParts[1];
								if (sSub === "departments") {
									resolve(oMockData.analytics.departmentDistribution);
								} else if (sSub === "hiring-trends") {
									resolve(oMockData.analytics.hiringTrends);
								} else if (sSub === "distribution") {
									resolve({
										activeEmployees: oMockData.analytics.activeEmployees,
										inactiveEmployees: oMockData.analytics.inactiveEmployees
									});
								} else {
									// Return comprehensive analytics block compatible with Analytics dashboard
									resolve(oMockData.analytics);
								}
							} else if (sCollection === "leaves") {
								resolve(oMockData.leaves || []);
							} else {
								resolve(oMockData);
							}
						})
						.catch(function (error) {
							reject(error);
						});
				} catch (e) {
					reject(e);
				}
			});
		}
	});
});
