sap.ui.define([
	"my/sample/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, Spreadsheet, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("my.sample.app.controller.Analytics", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("analytics").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function () {
			var self = this;
			// Small delay to ensure model data is fully loaded
			setTimeout(function() {
				self._ensureHiringTrendsData();
				self._enrichDepartmentData();
			}, 100);
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
			if (!oData.hiringTrends) {
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
		 * Export analytics data to Excel
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
				
				var oExcel = new Spreadsheet({
					columns: aColumns,
					dataSource: aDepartments,
					fileName: "Analytics_Report_" + new Date().toISOString().split("T")[0] + ".xlsx"
				});
				
				oExcel.build().then(function () {
					MessageToast.show("Excel export completed successfully!");
				}).catch(function (error) {
					MessageBox.error("Error exporting to Excel: " + (error.message || error));
				});
			} catch (e) {
				MessageBox.error("Error during export: " + e.message);
			}
		},

		/**
		 * Export analytics data to PDF
		 */
		onExportPDF: function () {
			try {
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				
				var sHtml = this._generatePDFContent(oData);
				var oBlob = new Blob([sHtml], { type: "text/html" });
				var sUrl = URL.createObjectURL(oBlob);
				
				// Create a hidden iframe to print to PDF
				var oIframe = document.createElement("iframe");
				oIframe.style.display = "none";
				oIframe.src = sUrl;
				document.body.appendChild(oIframe);
				
				oIframe.onload = function () {
					setTimeout(function () {
						oIframe.contentWindow.print();
						setTimeout(function () {
							document.body.removeChild(oIframe);
							URL.revokeObjectURL(sUrl);
						}, 500);
					}, 500);
				};
				
				MessageToast.show("PDF export ready. Use print dialog to save as PDF.");
			} catch (e) {
				MessageBox.error("Error generating PDF: " + e.message);
			}
		},

		/**
		 * Generate HTML content for PDF export
		 */
		_generatePDFContent: function (oData) {
			var sHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
			sHtml += 'body { font-family: Arial, sans-serif; margin: 20px; color: #333; }';
			sHtml += 'h1 { color: #0066CC; border-bottom: 3px solid #0066CC; padding-bottom: 10px; margin-bottom: 20px; }';
			sHtml += 'h2 { color: #333; margin-top: 25px; border-left: 5px solid #0066CC; padding-left: 15px; margin-bottom: 15px; }';
			sHtml += 'table { width: 100%; border-collapse: collapse; margin: 15px 0; }';
			sHtml += 'th { background-color: #0066CC; color: white; padding: 12px; text-align: left; font-weight: bold; }';
			sHtml += 'td { border: 1px solid #ddd; padding: 10px; }';
			sHtml += 'tr:nth-child(even) { background-color: #f9f9f9; }';
			sHtml += '.kpi { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #0066CC; }';
			sHtml += '.kpi-label { font-size: 12px; color: #666; margin-bottom: 5px; }';
			sHtml += '.kpi-value { font-size: 24px; font-weight: bold; color: #0066CC; }';
			sHtml += '.footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }';
			sHtml += '.page-break { page-break-after: always; }';
			sHtml += '</style></head><body>';

			sHtml += '<h1>Analytics & Reports</h1>';
			sHtml += '<p><strong>Generated on:</strong> ' + new Date().toLocaleString() + '</p>';

			// KPIs Section
			if (oData.kpis) {
				sHtml += '<h2>Key Performance Indicators</h2>';
				sHtml += '<div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Total Employees</div><div class="kpi-value">' + oData.kpis.totalEmployees + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Total Departments</div><div class="kpi-value">' + oData.kpis.totalDepartments + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Active Employees</div><div class="kpi-value">' + oData.kpis.activeEmployees + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Inactive Employees</div><div class="kpi-value">' + oData.kpis.inactiveEmployees + '</div></div>';
				sHtml += '</div>';
			}

			// Departments Table
			if (oData.departments && oData.departments.length > 0) {
				sHtml += '<div class="page-break"></div>';
				sHtml += '<h2>Department Details</h2>';
				sHtml += '<table>';
				sHtml += '<tr><th>Department</th><th>Employees</th><th>Manager</th><th>Budget</th><th>Description</th></tr>';
				oData.departments.forEach(function (dept) {
					sHtml += '<tr><td>' + dept.name + '</td><td>' + dept.employees + '</td><td>' + dept.managerName + '</td><td>' + dept.budget + '</td><td>' + dept.description + '</td></tr>';
				});
				sHtml += '</table>';
			}

			// Employee Status
			if (oData.employeeStatus && oData.employeeStatus.length > 0) {
				sHtml += '<h2>Employee Status Distribution</h2>';
				sHtml += '<table>';
				sHtml += '<tr><th>Status</th><th>Count</th><th>Percentage</th></tr>';
				var nTotal = 0;
				oData.employeeStatus.forEach(function (s) { nTotal += s.count; });
				oData.employeeStatus.forEach(function (status) {
					var nPercent = ((status.count / nTotal) * 100).toFixed(1);
					sHtml += '<tr><td>' + status.status + '</td><td>' + status.count + '</td><td>' + nPercent + '%</td></tr>';
				});
				sHtml += '</table>';
			}

			sHtml += '<div class="footer"><p>This report was automatically generated by the Analytics & Reports module.</p></div>';
			sHtml += '</body></html>';
			return sHtml;
		},

		/**
		 * Navigate back
		 */
		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		}
	});
});
