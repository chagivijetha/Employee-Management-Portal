sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, History, Filter, FilterOperator, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("my.sample.app.controller.MyLeaves", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("myLeaves").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function() {
            // Filter the leaves table to only show current employee's leaves
            // Since we don't have real login, we hardcode to EMP001
            var oTable = this.byId("myLeavesTable");
            var oBinding = oTable.getBinding("items");
            var oFilter = new Filter("employeeId", FilterOperator.EQ, "EMP001");
            oBinding.filter([oFilter]);
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

        onApplyLeave: function () {
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "my.sample.app.fragment.ApplyLeaveDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this.oDialog.then(function (oDialog) {
                var oNewLeave = {
                    id: "L" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    employeeId: "EMP001",
                    employeeName: "John Doe",
                    type: "Annual Leave",
                    startDate: "",
                    endDate: "",
                    reason: "",
                    status: "Pending"
                };
                
                var oDialogModel = new sap.ui.model.json.JSONModel(oNewLeave);
                oDialog.setModel(oDialogModel, "dialog");
                oDialog.open();
            });
        },

        onSubmitLeave: function () {
            this.oDialog.then(function (oDialog) {
                var oNewLeave = oDialog.getModel("dialog").getData();
                var oMainModel = this.getView().getModel();
                var aLeaves = oMainModel.getProperty("/leaves");
                
                aLeaves.push(oNewLeave);
                oMainModel.setProperty("/leaves", aLeaves);
                
                // Update Balance visually
                var iUsed = oMainModel.getProperty("/leaveBalance/used") + 1;
                var iAvailable = oMainModel.getProperty("/leaveBalance/available") - 1;
                oMainModel.setProperty("/leaveBalance/used", iUsed);
                oMainModel.setProperty("/leaveBalance/available", iAvailable);

                oMainModel.refresh();

                MessageToast.show("Leave request submitted successfully");
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
