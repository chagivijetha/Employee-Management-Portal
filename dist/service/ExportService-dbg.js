sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	return Object.extend("my.sample.app.service.ExportService", {
		/**
		 * Exports data to Excel format using sap.ui.export.Spreadsheet
		 * @param {Array} aData - Data array to export
		 * @param {Array} aColumns - Columns configuration
		 * @param {string} sFileName - Target filename
		 * @returns {Promise} Promise resolving when export is done
		 */
		exportToExcel: function (aData, aColumns, sFileName) {
			return new Promise(function (resolve, reject) {
				try {
					sap.ui.require(["sap/ui/export/Spreadsheet"], function (Spreadsheet) {
						var oSettings = {
							workbook: {
								columns: aColumns
							},
							dataSource: aData,
							fileName: sFileName || "Analytics_Report_" + new Date().toISOString().split("T")[0] + ".xlsx",
							worker: false // Disable web worker for local client-side array data compatibility
						};

						var oSheet = new Spreadsheet(oSettings);
						oSheet.build()
							.then(function () {
								resolve();
							})
							.catch(function (error) {
								reject(error);
							})
							.finally(function () {
								oSheet.destroy();
							});
					}, function (error) {
						reject(error);
					});
				} catch (e) {
					reject(e);
				}
			});
		},

		/**
		 * Exports data to PDF format using iframe printing
		 * @param {Object} oData - Data to export
		 * @returns {Promise} Export result
		 */
		exportToPDF: function (oData) {
			return new Promise(function (resolve, reject) {
				try {
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
							try {
								oIframe.contentWindow.focus();
								oIframe.contentWindow.print();
								setTimeout(function () {
									document.body.removeChild(oIframe);
									URL.revokeObjectURL(sUrl);
									resolve();
								}, 1000);
							} catch (err) {
								reject(err);
							}
						}, 500);
					};
				} catch (e) {
					reject(e);
				}
			}.bind(this));
		},

		/**
		 * Generates HTML content for PDF export
		 */
		_generatePDFContent: function (oData) {
			var sHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
			sHtml += 'body { font-family: "Segoe UI", Arial, sans-serif; margin: 30px; color: #333; line-height: 1.5; }';
			sHtml += 'h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 12px; margin-bottom: 25px; font-size: 28px; }';
			sHtml += 'h2 { color: #2c5282; margin-top: 30px; border-left: 5px solid #3182ce; padding-left: 15px; margin-bottom: 15px; font-size: 20px; }';
			sHtml += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }';
			sHtml += 'th { background-color: #2b6cb0; color: white; padding: 12px 15px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }';
			sHtml += 'td { border: 1px solid #e2e8f0; padding: 12px 15px; color: #4a5568; }';
			sHtml += 'tr:nth-child(even) { background-color: #f7fafc; }';
			sHtml += '.kpis-container { display: flex; flex-wrap: wrap; margin-bottom: 30px; gap: 20px; }';
			sHtml += '.kpi { flex: 1; min-width: 150px; padding: 20px; background: #ebf8ff; border-radius: 8px; border-left: 5px solid #3182ce; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }';
			sHtml += '.kpi-label { font-size: 11px; color: #4a5568; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }';
			sHtml += '.kpi-value { font-size: 28px; font-weight: bold; color: #2b6cb0; }';
			sHtml += '.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #a0aec0; text-align: center; }';
			sHtml += '.page-break { page-break-after: always; }';
			sHtml += '</style></head><body>';

			sHtml += '<h1>' + (oData.title || "Analytics & Reports Dashboard") + '</h1>';
			sHtml += '<p style="color: #718096; font-size: 14px;"><strong>Generated on:</strong> ' + new Date().toLocaleString() + '</p>';

			// KPIs Section
			if (oData.kpis) {
				sHtml += '<h2>Key Performance Indicators</h2>';
				sHtml += '<div class="kpis-container">';
				sHtml += '<div class="kpi"><div class="kpi-label">Total Employees</div><div class="kpi-value">' + (oData.kpis.totalEmployees || 0) + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Total Departments</div><div class="kpi-value">' + (oData.kpis.totalDepartments || 0) + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Active Employees</div><div class="kpi-value">' + (oData.kpis.activeEmployees || 0) + '</div></div>';
				sHtml += '<div class="kpi"><div class="kpi-label">Inactive Employees</div><div class="kpi-value">' + (oData.kpis.inactiveEmployees || 0) + '</div></div>';
				sHtml += '</div>';
			}

			// Departments Table
			if (oData.departments && oData.departments.length > 0) {
				sHtml += '<div class="page-break"></div>';
				sHtml += '<h2>Department Details</h2>';
				sHtml += '<table>';
				sHtml += '<tr><th>Department Name</th><th>Employee Count</th><th>Manager</th><th>Budget (USD)</th><th>Description</th></tr>';
				oData.departments.forEach(function (dept) {
					sHtml += '<tr>';
					sHtml += '<td><strong>' + (dept.name || "") + '</strong></td>';
					sHtml += '<td>' + (dept.employees || 0) + '</td>';
					sHtml += '<td>' + (dept.managerName || "N/A") + '</td>';
					sHtml += '<td>$' + (dept.budget || "0") + '</td>';
					sHtml += '<td>' + (dept.description || "") + '</td>';
					sHtml += '</tr>';
				});
				sHtml += '</table>';
			}

			// Employee Status Distribution
			if (oData.employeeStatus && oData.employeeStatus.length > 0) {
				sHtml += '<h2>Employee Status Distribution</h2>';
				sHtml += '<table>';
				sHtml += '<tr><th>Status</th><th>Count</th><th>Percentage</th></tr>';
				var nTotal = 0;
				oData.employeeStatus.forEach(function (s) { nTotal += (s.count || 0); });
				oData.employeeStatus.forEach(function (status) {
					var count = status.count || 0;
					var nPercent = nTotal > 0 ? ((count / nTotal) * 100).toFixed(1) : "0.0";
					sHtml += '<tr><td><strong>' + (status.status || "") + '</strong></td><td>' + count + '</td><td>' + nPercent + '%</td></tr>';
				});
				sHtml += '</table>';
			}

			sHtml += '<div class="footer"><p>This professional report was automatically generated by the Employee Management Portal Analytics module.</p></div>';
			sHtml += '</body></html>';
			return sHtml;
		},

		/**
		 * Exports data as CSV
		 */
		exportToCSV: function (aData, sFileName) {
			return new Promise(function (resolve, reject) {
				try {
					var sCsv = this._generateCSV(aData);
					var oBlob = new Blob([sCsv], { type: "text/csv;charset=utf-8;" });
					var sUrl = URL.createObjectURL(oBlob);
					var oLink = document.createElement("a");
					oLink.href = sUrl;
					oLink.download = sFileName || "export_" + new Date().toISOString().split("T")[0] + ".csv";
					document.body.appendChild(oLink);
					oLink.click();
					document.body.removeChild(oLink);
					URL.revokeObjectURL(sUrl);
					resolve();
				} catch (e) {
					reject(e);
				}
			}.bind(this));
		},

		/**
		 * Generates CSV content
		 */
		_generateCSV: function (aData) {
			if (!aData || aData.length === 0) return "";
			
			var sCsv = "";
			var oFirstRow = aData[0];
			
			// Header row
			sCsv += Object.keys(oFirstRow).join(",") + "\n";
			
			// Data rows
			aData.forEach(function (row) {
				var aValues = [];
				for (var key in row) {
					var val = row[key];
					if (val === null || val === undefined) {
						val = "";
					}
					aValues.push('"' + val.toString().replace(/"/g, '""') + '"');
				}
				sCsv += aValues.join(",") + "\n";
			});
			
			return sCsv;
		}
	});
});
