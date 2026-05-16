sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("my.sample.app.controller.Home", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("home").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // Check if user is logged in
            var oSessionModel = this.getOwnerComponent().getModel("session");
            var oSessionData = oSessionModel.getData();
            
            // Try restoring from sessionStorage if model is empty (e.g. on page refresh)
            if (!oSessionData || !oSessionData.isLoggedIn) {
                var sSessionString = sessionStorage.getItem("userSession");
                if (sSessionString) {
                    var oUser = JSON.parse(sSessionString);
                    oSessionModel.setData({
                        user: oUser,
                        isLoggedIn: true
                    });
                } else {
                    // Not logged in, redirect to login
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("login", {}, true); // true = replace history
                }
            }
        },

        onLogoutPress: function () {
            // Clear session model
            var oSessionModel = this.getOwnerComponent().getModel("session");
            oSessionModel.setData({
                user: null,
                isLoggedIn: false
            });

            // Clear session storage
            sessionStorage.removeItem("userSession");

            // Navigate back to login
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("login", {}, true); // Replace history so user can't click back to home
        },

        onQuickAction: function (oEvent) {
            var sActionText = oEvent.getSource().getText();
            MessageToast.show(sActionText + " clicked! This feature will be available in the upcoming phases.");
        },

        onManageEmployees: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("employeeList");
        },

        onManageDepartments: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("departmentList");
        },

        onMyLeaves: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("myLeaves");
        },

        onApproveLeaves: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("approveLeaves");
        }
    });
});
