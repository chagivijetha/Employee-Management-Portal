sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel"
], function (Object, ODataModel, ODataModelV2) {
	"use strict";

	return Object.extend("my.sample.app.service.ODataService", {
		constructor: function (sServiceUrl) {
			this._sServiceUrl = sServiceUrl || "/odata/v2/service";
			this._oModel = null;
			this._initODataModel();
		},

		/**
		 * Initialize OData Model
		 * @private
		 */
		_initODataModel: function () {
			this._oModel = new ODataModelV2(this._sServiceUrl, {
				annotationURI: [
					this._sServiceUrl + "/$metadata"
				],
				json: true,
				useBatch: true,
				defaultCountMode: "Inlinecount",
				tokenHandling: true,
				withCredentials: false
			});

			// Attach request/response handlers
			this._oModel.attachRequestCompleted(function () {
				// Handle completion
			});

			this._oModel.attachRequestFailed(function (oEvent) {
				var oError = oEvent.getParameter("response");
				sap.m.MessageBox.error("OData Request Failed: " + (oError.statusText || "Unknown Error"));
			});
		},

		/**
		 * Get OData Model instance
		 */
		getModel: function () {
			return this._oModel;
		},

		/**
		 * Read entity set (Departments)
		 */
		readDepartments: function () {
			return new Promise(function (resolve, reject) {
				this._oModel.read("/DepartmentSet", {
					success: function (oData) {
						resolve(oData.results || []);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Read department by ID
		 */
		readDepartmentById: function (sDepartmentId) {
			return new Promise(function (resolve, reject) {
				this._oModel.read("/DepartmentSet('" + sDepartmentId + "')", {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Create department entity
		 */
		createDepartment: function (oData) {
			return new Promise(function (resolve, reject) {
				this._oModel.create("/DepartmentSet", oData, {
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Update department entity
		 */
		updateDepartment: function (sDepartmentId, oData) {
			return new Promise(function (resolve, reject) {
				this._oModel.update("/DepartmentSet('" + sDepartmentId + "')", oData, {
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Delete department entity
		 */
		deleteDepartment: function (sDepartmentId) {
			return new Promise(function (resolve, reject) {
				this._oModel.remove("/DepartmentSet('" + sDepartmentId + "')", {
					success: function () {
						resolve();
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Read employees
		 */
		readEmployees: function () {
			return new Promise(function (resolve, reject) {
				this._oModel.read("/EmployeeSet", {
					success: function (oData) {
						resolve(oData.results || []);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Read employee by ID
		 */
		readEmployeeById: function (sEmployeeId) {
			return new Promise(function (resolve, reject) {
				this._oModel.read("/EmployeeSet('" + sEmployeeId + "')", {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Create employee
		 */
		createEmployee: function (oData) {
			return new Promise(function (resolve, reject) {
				this._oModel.create("/EmployeeSet", oData, {
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Update employee
		 */
		updateEmployee: function (sEmployeeId, oData) {
			return new Promise(function (resolve, reject) {
				this._oModel.update("/EmployeeSet('" + sEmployeeId + "')", oData, {
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Delete employee
		 */
		deleteEmployee: function (sEmployeeId) {
			return new Promise(function (resolve, reject) {
				this._oModel.remove("/EmployeeSet('" + sEmployeeId + "')", {
					success: function () {
						resolve();
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Read leaves
		 */
		readLeaves: function () {
			return new Promise(function (resolve, reject) {
				this._oModel.read("/LeaveSet", {
					success: function (oData) {
						resolve(oData.results || []);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Batch read multiple entities
		 */
		batchRead: function (aRequests) {
			return new Promise(function (resolve, reject) {
				var aBatchRequests = [];
				
				aRequests.forEach(function (sPath) {
					aBatchRequests.push(this._oModel.createBatchOperation(sPath, "GET"));
				}.bind(this));
				
				this._oModel.addBatchReadOperations(aBatchRequests);
				
				this._oModel.submitBatch(function (oData, oResponse, bSuccess) {
					if (bSuccess) {
						resolve(oData.__batchResponses);
					} else {
						reject(oResponse);
					}
				}, function (oError) {
					reject(oError);
				});
			}.bind(this));
		},

		/**
		 * Submit batch changes
		 */
		submitBatchChanges: function () {
			return new Promise(function (resolve, reject) {
				this._oModel.submitBatch(function (oData, oResponse, bSuccess) {
					if (bSuccess) {
						resolve(oData);
					} else {
						reject(oResponse);
					}
				}, function (oError) {
					reject(oError);
				});
			}.bind(this));
		},

		/**
		 * Execute function import
		 */
		callFunctionImport: function (sFunctionName, sMethod, oUrlParams) {
			return new Promise(function (resolve, reject) {
				this._oModel.callFunction("/" + sFunctionName, {
					method: sMethod || "GET",
					urlParameters: oUrlParams,
					success: function (oResult) {
						resolve(oResult);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Get metadata
		 */
		getMetadata: function () {
			return new Promise(function (resolve, reject) {
				if (this._oModel.getServiceMetadata()) {
					resolve(this._oModel.getServiceMetadata());
				} else {
					this._oModel.metadataLoaded().then(function () {
						resolve(this._oModel.getServiceMetadata());
					}.bind(this)).catch(function (oError) {
						reject(oError);
					});
				}
			}.bind(this));
		}
	});
});
