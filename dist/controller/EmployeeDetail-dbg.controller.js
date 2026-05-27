sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, History, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("my.sample.app.controller.EmployeeDetail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("employeeDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.sEmployeeId = oEvent.getParameter("arguments").employeeId;
            
            // Need to bind the view to the correct employee in the array
            var oModel = this.getOwnerComponent().getModel();
            
            // Important: wait for model to load if it's async, but JSONModel is sync.
            // However, we need to find the correct path
            var aEmployees = oModel.getProperty("/employees");
            var sPath = "";
            if (aEmployees) {
                for (var i = 0; i < aEmployees.length; i++) {
                    if (aEmployees[i].id === this.sEmployeeId) {
                        sPath = "/employees/" + i;
                        break;
                    }
                }
            }

            if (sPath) {
                this.getView().bindElement({
                    path: sPath
                });
                this.sCurrentPath = sPath;
            } else {
                // Not found
                MessageToast.show("Employee not found");
                this.onNavBack();
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("employeeList", {}, true);
            }
        },

        onEditEmployee: function () {
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
                // Get current employee data and clone it to avoid live editing
                var oCurrentData = this.getView().getBindingContext().getObject();
                var oEditData = JSON.parse(JSON.stringify(oCurrentData));
                
                var oDialogModel = new sap.ui.model.json.JSONModel(oEditData);
                oDialog.setModel(oDialogModel, "dialog");
                oDialog.setTitle("Edit Employee");
                oDialog.open();
            }.bind(this));
        },

        onSaveEmployee: function () {
            this.oDialog.then(function (oDialog) {
                var oUpdatedEmp = oDialog.getModel("dialog").getData();
                var oMainModel = this.getView().getModel();
                
                // Update the main model at the bound path
                oMainModel.setProperty(this.sCurrentPath, oUpdatedEmp);
                oMainModel.refresh();

                MessageToast.show("Employee updated successfully");
                oDialog.close();
            }.bind(this));
        },

        onCancelDialog: function () {
            this.oDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onDeleteEmployee: function () {
            MessageBox.confirm("Are you sure you want to delete this employee?", {
                title: "Confirm Deletion",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oMainModel = this.getView().getModel();
                        var aEmployees = oMainModel.getProperty("/employees");
                        
                        // Find and remove the employee
                        var aNewEmployees = aEmployees.filter(function(emp) {
                            return emp.id !== this.sEmployeeId;
                        }.bind(this));
                        
                        oMainModel.setProperty("/employees", aNewEmployees);
                        MessageToast.show("Employee deleted");
                        this.onNavBack();
                    }
                }.bind(this)
            });
        },

        handleUploadPress: function () {
            var oFileUploader = this.byId("fileUploader");
            if (!oFileUploader.getValue()) {
                MessageToast.show("Choose a file first");
                return;
            }
            // Mocking the upload
            MessageToast.show("File uploaded successfully (Mock)");
            oFileUploader.clear();
        }
    });
});
