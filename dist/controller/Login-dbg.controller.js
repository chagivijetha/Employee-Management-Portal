sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("my.sample.app.controller.Login", {
        onInit: function () {
        },

        onLoginPress: function () {
            var sUsername = this.byId("usernameInput").getValue();
            var sPassword = this.byId("passwordInput").getValue();

            // Mock Authentication Logic
            var oUser = null;

            if (sUsername === "admin" && sPassword === "admin") {
                oUser = { username: "admin", role: "Admin", name: "System Admin" };
            } else if (sUsername === "hr" && sPassword === "hr") {
                oUser = { username: "hr", role: "HR Manager", name: "HR Manager" };
            } else if (sUsername === "emp" && sPassword === "emp") {
                oUser = { username: "emp", role: "Employee", name: "John Doe" };
            }

            if (oUser) {
                // Set session data
                var oSessionModel = this.getOwnerComponent().getModel("session");
                oSessionModel.setData({
                    user: oUser,
                    isLoggedIn: true
                });

                // Optional: Store in sessionStorage to persist across refreshes
                sessionStorage.setItem("userSession", JSON.stringify(oUser));

                MessageToast.show("Login Successful!");
                
                // Navigate to home
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("home");
            } else {
                MessageToast.show("Invalid credentials. Use admin/admin, hr/hr, or emp/emp");
            }
        }
    });
});
