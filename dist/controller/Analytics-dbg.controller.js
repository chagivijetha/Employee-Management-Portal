sap.ui.define([
	"my/sample/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"my/sample/app/service/ExportService",
	"my/sample/app/service/APIService",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, ExportService, APIService, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("my.sample.app.controller.Analytics", {
		onInit: function () {
			// Instantiate Services
			this._oExportService = new ExportService();
			this._oAPIService = new APIService();

			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("analytics").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function () {
			// Initialize premium VizFrame properties
			this._initCharts();
			
			// Load data from Backend/Mock service
			this._loadAnalyticsData();
		},

		/**
		 * Initialize all VizFrame chart configurations for premium look and feel
		 */
		_initCharts: function () {
			var oVizFrameDept = this.getView().byId("departmentChart");
			var oVizFrameHiring = this.getView().byId("hiringTrendChart");
			var oVizFrameDeptHiring = this.getView().byId("departmentHiringChart");
			var oVizFrameStatus = this.getView().byId("statusChart");
			var oVizFrameDeptDist = this.getView().byId("deptDistributionChart");

			var oCommonProperties = {
				plotArea: {
					dataLabel: {
						visible: true,
						showZero: false
					},
					colorPalette: ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22"]
				},
				title: {
					visible: false
				},
				legend: {
					visible: true
				},
				interaction: {
					behavior: "TypeNonExclusive"
				}
			};

			if (oVizFrameDept) {
				oVizFrameDept.setVizProperties(oCommonProperties);
			}

			if (oVizFrameHiring) {
				oVizFrameHiring.setVizProperties({
					plotArea: {
						dataLabel: { visible: true },
						colorPalette: ["#2ecc71"] // Clean hiring green
					},
					title: { visible: false },
					legend: { visible: false }
				});
			}

			if (oVizFrameDeptHiring) {
				oVizFrameDeptHiring.setVizProperties({
					plotArea: {
						dataLabel: { visible: true },
						colorPalette: ["#e67e22"] // Modern orange
					},
					title: { visible: false },
					legend: { visible: false }
				});
			}

			if (oVizFrameStatus) {
				oVizFrameStatus.setVizProperties({
					plotArea: {
						dataLabel: { visible: true },
						colorPalette: ["#2ecc71", "#e74c3c"] // Green = Active, Red = Inactive
					},
					title: { visible: false },
					legend: { visible: true }
				});
			}

			if (oVizFrameDeptDist) {
				oVizFrameDeptDist.setVizProperties({
					plotArea: {
						dataLabel: { visible: true },
						colorPalette: ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c"]
					},
					title: { visible: false },
					legend: { visible: true }
				});
			}
		},

		/**
		 * Load analytics data asynchronously from APIService (REST service with local mock fallbacks)
		 */
		_loadAnalyticsData: function () {
			var self = this;
			var oView = this.getView();
			oView.setBusy(true);

			// Load analytics data and departments in parallel
			Promise.all([
				this._oAPIService.getAnalytics(),
				this._oAPIService.getDepartments()
			]).then(function (aResults) {
				var oAnalytics = aResults[0];
				var aDepartments = aResults[1];

				var oModel = oView.getModel();
				if (!oModel) {
					oModel = new JSONModel();
					oView.setModel(oModel);
				}

				var oData = oModel.getData();
				
				// Bind KPIs
				oData.kpis = {
					totalEmployees: oAnalytics.totalEmployees || 0,
					totalDepartments: oAnalytics.totalDepartments || 0,
					activeEmployees: oAnalytics.activeEmployees || 0,
					inactiveEmployees: oAnalytics.inactiveEmployees || 0
				};

				// Bind Hiring Trends
				oData.hiringTrends = oAnalytics.hiringTrends || [];

				// Bind Departments
				oData.departments = aDepartments || [];

				// Bind Employee Status Distribution
				oData.employeeStatus = [
					{ status: "Active", count: oAnalytics.activeEmployees || 0 },
					{ status: "Inactive", count: oAnalytics.inactiveEmployees || 0 }
				];

				oModel.setData(oData);
				self._ensureHiringTrendsData();
				self._enrichDepartmentData(); // Add simulated hires data to departments if not present
				oView.setBusy(false);
			}).catch(function (error) {
				oView.setBusy(false);
				MessageBox.error("Failed to load analytics data: " + (error.message || error));
			});
		},

		/**
		 * Ensure hiring trends data exists in the model
		 */
		_ensureHiringTrendsData: function () {
			var oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}
			
			var oData = oModel.getData();
			
			// Add hiring trends if not present
			if (!oData.hiringTrends || oData.hiringTrends.length === 0) {
				oData.hiringTrends = [
					{ month: "January", hires: 5 },
					{ month: "February", hires: 3 },
					{ month: "March", hires: 6 },
					{ month: "April", hires: 4 },
					{ month: "May", hires: 7 },
					{ month: "June", hires: 3 }
				];
			}
			
			oModel.setData(oData, true);
		},

		/**
		 * Add hires field to departments for the hiring chart
		 */
		_enrichDepartmentData: function () {
			var oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}
			
			var oData = oModel.getData();
			
			// Add hires to departments if not present
			if (oData.departments && Array.isArray(oData.departments)) {
				oData.departments.forEach(function (dept) {
					if (!dept.hires) {
						// Simulate hires data
						var hiringMap = {
							"Engineering": 8,
							"Sales": 5,
							"Marketing": 3,
							"HR": 2,
							"Finance": 4,
							"Operations": 6
						};
						dept.hires = hiringMap[dept.name] || Math.floor(Math.random() * 10);
					}
				});
			}
			
			oModel.setData(oData, true);
		},

		/**
		 * Export analytics data to Excel using ExportService
		 */
		onExportExcel: function () {
			try {
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				var aDepartments = oData.departments || [];
				
				if (!aDepartments || aDepartments.length === 0) {
					MessageBox.warning("No department data available to export");
					return;
				}
				
				var aColumns = [
					{
						label: "Department Name",
						property: "name"
					},
					{
						label: "Employee Count",
						property: "employees"
					},
					{
						label: "Manager",
						property: "managerName"
					},
					{
						label: "Budget",
						property: "budget"
					},
					{
						label: "Description",
						property: "description"
					}
				];
				
				var sFileName = "Analytics_Report_" + new Date().toISOString().split("T")[0] + ".xlsx";
				
				this._oExportService.exportToExcel(aDepartments, aColumns, sFileName)
					.then(function () {
						MessageToast.show("Excel export completed successfully!");
					})
					.catch(function (error) {
						MessageBox.error("Error exporting to Excel: " + (error.message || error));
					});
			} catch (e) {
				MessageBox.error("Error during export: " + e.message);
			}
		},

		/**
		 * Export analytics data to PDF using ExportService
		 */
		onExportPDF: function () {
			try {
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				
				var oExportData = {
					title: "Analytics & Reports Dashboard Summary",
					kpis: oData.kpis,
					departments: oData.departments,
					employeeStatus: oData.employeeStatus
				};

				this._oExportService.exportToPDF(oExportData)
					.then(function () {
						MessageToast.show("PDF export print job initiated successfully!");
					})
					.catch(function (error) {
						MessageBox.error("Error exporting to PDF: " + (error.message || error));
					});
			} catch (e) {
				MessageBox.error("Error generating PDF: " + e.message);
			}
		},

		/**
		 * Navigate back
		 */
		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		}
	});
});
