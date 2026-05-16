sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("my.sample.app.controller.ApproveLeaves", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("approveLeaves").attachPatternMatched(this._onObjectMatched, this);
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
                aFilters.push(new Filter("employeeName", FilterOperator.Contains, sQuery));
            }

            var oTable = this.byId("approveLeavesTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onApprove: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var sPath = oContext.getPath();
            
            var oModel = this.getView().getModel();
            oModel.setProperty(sPath + "/status", "Approved");
            
            MessageToast.show("Leave Approved");
        },

        onReject: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var sPath = oContext.getPath();
            
            var oModel = this.getView().getModel();
            oModel.setProperty(sPath + "/status", "Rejected");
            
            MessageToast.show("Leave Rejected");
        }
    });
});
