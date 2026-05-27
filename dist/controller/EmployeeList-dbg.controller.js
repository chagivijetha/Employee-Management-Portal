sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (Controller, Filter, FilterOperator, History, Fragment, Spreadsheet, exportLibrary) {
    "use strict";
    
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("my.sample.app.controller.EmployeeList", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("employeeList").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function() {
            // Rebind or refresh table if necessary
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("home", {}, true);
            }
        },

        onSearch: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter1 = new Filter("firstName", FilterOperator.Contains, sQuery);
                var filter2 = new Filter("lastName", FilterOperator.Contains, sQuery);
                var filter3 = new Filter("department", FilterOperator.Contains, sQuery);
                aFilters = new Filter({
                    filters: [filter1, filter2, filter3],
                    and: false
                });
            }

            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onEmployeePress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sPath = oBindingContext.getPath();
            // Path is usually like /employees/0, we want the employee ID
            var oEmployee = oBindingContext.getObject();

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("employeeDetail", {
                employeeId: oEmployee.id
            });
        },

        onAddEmployee: function () {
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "my.sample.app.fragment.EmployeeDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this.oDialog.then(function (oDialog) {
                // Create a temporary model for the new employee
                var oNewEmp = {
                    id: "EMP" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    firstName: "",
                    lastName: "",
                    department: "",
                    position: "",
                    email: "",
                    status: "Active",
                    hireDate: new Date().toISOString().split('T')[0]
                };
                
                var oDialogModel = new sap.ui.model.json.JSONModel(oNewEmp);
                oDialog.setModel(oDialogModel, "dialog");
                oDialog.setTitle("Add Employee");
                oDialog.open();
            });
        },

        onSaveEmployee: function () {
            this.oDialog.then(function (oDialog) {
                var oNewEmp = oDialog.getModel("dialog").getData();
                var oMainModel = this.getView().getModel();
                var aEmployees = oMainModel.getProperty("/employees");
                
                // For editing (if implemented here), check if it exists. For now it's always Add from list view.
                aEmployees.push(oNewEmp);
                oMainModel.setProperty("/employees", aEmployees);
                oMainModel.refresh();

                oDialog.close();
            }.bind(this));
        },

        onCancelDialog: function () {
            this.oDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        createColumnConfig: function() {
            return [
                {
                    label: 'Employee ID',
                    property: 'id',
                    type: EdmType.String
                },
                {
                    label: 'First Name',
                    property: 'firstName',
                    type: EdmType.String
                },
                {
                    label: 'Last Name',
                    property: 'lastName',
                    type: EdmType.String
                },
                {
                    label: 'Department',
                    property: 'department',
                    type: EdmType.String
                },
                {
                    label: 'Position',
                    property: 'position',
                    type: EdmType.String
                },
                {
                    label: 'Email',
                    property: 'email',
                    type: EdmType.String
                },
                {
                    label: 'Status',
                    property: 'status',
                    type: EdmType.String
                },
                {
                    label: 'Hire Date',
                    property: 'hireDate',
                    type: EdmType.Date
                }
            ];
        },

        onExport: function() {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('employeeTable');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Employee_List.xlsx',
                worker: false // We need to disable worker for mock JSON data to work cleanly
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        }
    });
});
