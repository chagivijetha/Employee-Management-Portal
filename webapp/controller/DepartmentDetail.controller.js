sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageToast, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("my.sample.app.controller.DepartmentDetail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("departmentDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.sDeptId = oEvent.getParameter("arguments").deptId;
            
            var oModel = this.getOwnerComponent().getModel();
            var aDepartments = oModel.getProperty("/departments");
            var sPath = "";
            var sDeptName = "";
            
            if (aDepartments) {
                for (var i = 0; i < aDepartments.length; i++) {
                    if (aDepartments[i].id === this.sDeptId) {
                        sPath = "/departments/" + i;
                        sDeptName = aDepartments[i].name;
                        break;
                    }
                }
            }

            if (sPath) {
                this.getView().bindElement({
                    path: sPath
                });
                this.sCurrentPath = sPath;

                // Filter the employees table
                var oTable = this.byId("departmentEmployeesTable");
                var oBinding = oTable.getBinding("items");
                // The relationship is mapped by Department Name string in our mock data
                var oFilter = new Filter("department", FilterOperator.EQ, sDeptName);
                oBinding.filter([oFilter]);

            } else {
                MessageToast.show("Department not found");
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
                oRouter.navTo("departmentList", {}, true);
            }
        },

        onEditDepartment: function () {
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "my.sample.app.fragment.DepartmentDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this.oDialog.then(function (oDialog) {
                var oCurrentData = this.getView().getBindingContext().getObject();
                var oEditData = JSON.parse(JSON.stringify(oCurrentData));
                
                var oDialogModel = new sap.ui.model.json.JSONModel(oEditData);
                oDialog.setModel(oDialogModel, "dialog");
                oDialog.setTitle("Edit Department");
                oDialog.open();
            }.bind(this));
        },

        onSaveDepartment: function () {
            this.oDialog.then(function (oDialog) {
                var oUpdatedDept = oDialog.getModel("dialog").getData();
                var oMainModel = this.getView().getModel();
                
                oMainModel.setProperty(this.sCurrentPath, oUpdatedDept);
                oMainModel.refresh();

                MessageToast.show("Department updated successfully");
                oDialog.close();
            }.bind(this));
        },

        onCancelDialog: function () {
            this.oDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onEmployeePress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var oEmployee = oBindingContext.getObject();

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("employeeDetail", {
                employeeId: oEmployee.id
            });
        }
    });
});
