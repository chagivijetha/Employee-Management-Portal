sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment"
], function (Controller, History, Fragment) {
    "use strict";

    return Controller.extend("my.sample.app.controller.DepartmentList", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("departmentList").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function() {
            // Rebind or refresh if necessary
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

        onDepartmentPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var oDepartment = oBindingContext.getObject();

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("departmentDetail", {
                deptId: oDepartment.id
            });
        },

        onAddDepartment: function () {
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
                var oNewDept = {
                    id: "D0" + Math.floor(Math.random() * 100).toString(),
                    name: "",
                    managerName: "",
                    managerId: "",
                    budget: "0",
                    description: ""
                };
                
                var oDialogModel = new sap.ui.model.json.JSONModel(oNewDept);
                oDialog.setModel(oDialogModel, "dialog");
                oDialog.setTitle("Create Department");
                oDialog.open();
            });
        },

        onSaveDepartment: function () {
            this.oDialog.then(function (oDialog) {
                var oNewDept = oDialog.getModel("dialog").getData();
                var oMainModel = this.getView().getModel();
                var aDepartments = oMainModel.getProperty("/departments");
                
                aDepartments.push(oNewDept);
                oMainModel.setProperty("/departments", aDepartments);
                oMainModel.refresh();

                oDialog.close();
            }.bind(this));
        },

        onCancelDialog: function () {
            this.oDialog.then(function (oDialog) {
                oDialog.close();
            });
        }
    });
});
