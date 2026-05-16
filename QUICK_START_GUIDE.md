# Quick Start Guide - Phase 7 & 8

## Phase 7: Analytics & Reports - Quick Start

### Accessing Analytics Dashboard

1. **Start the application**:
```bash
npm start
```

2. **Login** (use any of the test credentials):
   - Username: `admin` / Password: `password`
   - Username: `manager` / Password: `password`

3. **Navigate to Analytics**:
   - Click "Analytics & Reports" button on home page
   - Or navigate to: `http://localhost:8080/index.html#/analytics`

### Using the Analytics Dashboard

#### Department Analytics Tab
- View department overview with KPI metrics
- See employee distribution by department in chart
- Review detailed department information in table
- Click on departments to get more details

#### Hiring Trends Tab
- Analyze monthly hiring patterns
- View hiring trends by department
- Monitor key metrics:
  - Total hires this year
  - Average time to hire
  - Retention rate
  - New positions

#### Distribution Tab
- Analyze employee status distribution
- See department-wise distribution
- View percentage breakdown
- Identify staffing patterns

### Exporting Reports

#### To Excel
1. In Analytics view, click "Export to Excel" button
2. File will download as `Analytics_Report_YYYY-MM-DD.xlsx`
3. Open in Excel, Google Sheets, or similar

#### To PDF
1. Click "Export to PDF" button
2. PDF document will download with:
   - Formatted report layout
   - KPI sections
   - Department data tables
   - Professional styling

### Features & Keyboard Shortcuts

| Feature | Action |
|---------|--------|
| Switch Tabs | Click on tab headers |
| Go Back | Click back button or press browser back |
| Export Excel | Click "Export to Excel" |
| Export PDF | Click "Export to PDF" |
| Refresh Data | Reload page (F5) |

---

## Phase 8: Backend Integration - Quick Start

### Using REST API Service

#### 1. Basic Setup in Your Controller

```javascript
sap.ui.define([
    "my/sample/app/controller/BaseController",
    "my/sample/app/service/APIService"
], function (BaseController, APIService) {
    return BaseController.extend("my.sample.app.controller.YourController", {
        onInit: function () {
            this._oAPIService = new APIService();
        }
    });
});
```

#### 2. Get Departments
```javascript
onLoadDepartments: function () {
    this._oAPIService.getDepartments()
        .then(function (aDepartments) {
            // aDepartments = [
            //   {id: "D01", name: "Engineering", employees: 55, ...},
            //   {id: "D02", name: "Sales", employees: 30, ...}
            // ]
            this.getModel().setData({departments: aDepartments});
        }.bind(this))
        .catch(function (oError) {
            this.showMessage("Error: " + oError.message, "error");
        }.bind(this));
}
```

#### 3. Create Department
```javascript
onCreateDepartment: function (sName, sManagerName, nBudget) {
    var oNewDept = {
        name: sName,
        managerName: sManagerName,
        budget: nBudget
    };
    
    this._oAPIService.createDepartment(oNewDept)
        .then(function (oCreatedDept) {
            this.showMessage("Department created!", "success");
            // Refresh list
            this.onLoadDepartments();
        }.bind(this))
        .catch(function (oError) {
            this.showMessage("Error: " + oError.message, "error");
        }.bind(this));
}
```

#### 4. Update Employee
```javascript
onUpdateEmployee: function (sEmployeeId, oUpdatedData) {
    this._oAPIService.updateEmployee(sEmployeeId, oUpdatedData)
        .then(function () {
            this.showMessage("Employee updated!", "success");
        }.bind(this))
        .catch(function (oError) {
            this.showMessage("Error: " + oError.message, "error");
        }.bind(this));
}
```

#### 5. Get Analytics Data
```javascript
onLoadAnalytics: function () {
    this._oAPIService.getAnalytics()
        .then(function (oAnalytics) {
            // oAnalytics = {
            //   totalEmployees: 142,
            //   activeEmployees: 138,
            //   hiringTrends: [...],
            //   departmentDistribution: [...]
            // }
            this.getModel().setData(oAnalytics);
        }.bind(this));
}
```

### Using OData Service

#### 1. Basic Setup

```javascript
sap.ui.define([
    "my/sample/app/service/ODataService"
], function (ODataService) {
    // In Component.js or Controller
    var oODataService = new ODataService("/odata/v2/myservice");
    var oModel = oODataService.getModel();
    
    // Set model on view
    this.setModel(oModel);
});
```

#### 2. Read Departments
```javascript
var oODataService = new ODataService("/odata/v2/myservice");

oODataService.readDepartments()
    .then(function (aDepts) {
        // Handle departments
        console.log(aDepts);
    })
    .catch(function (oError) {
        console.error("Error:", oError);
    });
```

#### 3. Batch Operations
```javascript
oODataService.batchRead([
    "/DepartmentSet",
    "/EmployeeSet",
    "/LeaveSet"
])
.then(function (aResults) {
    // All three entity sets loaded
    var aDepts = aResults[0];
    var aEmpls = aResults[1];
    var aLeaves = aResults[2];
});
```

#### 4. Call Function Import
```javascript
oODataService.callFunctionImport("GetDepartmentAnalytics", "GET", {
    departmentId: "D01",
    year: 2024
})
.then(function (oResult) {
    // Handle result
});
```

### Using Export Service

#### Excel Export
```javascript
var oExportService = new ExportService();
var aData = [
    {name: "Engineering", employees: 55, budget: 1500000},
    {name: "Sales", employees: 30, budget: 800000}
];

var aColumns = [
    {label: "Department Name", property: "name"},
    {label: "Employee Count", property: "employees"},
    {label: "Budget", property: "budget"}
];

var oExcel = new Spreadsheet({
    columns: aColumns,
    dataSource: aData,
    fileName: "departments.xlsx"
});

oExcel.build()
    .then(function () {
        this.showMessage("Exported successfully!", "success");
    }.bind(this));
```

#### PDF Export
```javascript
var oExportService = new ExportService();
var oPdfData = {
    title: "Department Report",
    date: new Date().toLocaleDateString(),
    departments: aData
};

oExportService.exportToPDF(oPdfData)
    .then(function () {
        this.showMessage("PDF exported!", "success");
    }.bind(this));
```

### API Endpoints Reference

#### REST API
```
Base URL: /api

Departments:
  GET    /api/departments              → Get all
  GET    /api/departments/{id}         → Get by ID
  POST   /api/departments              → Create
  PUT    /api/departments/{id}         → Update
  DELETE /api/departments/{id}         → Delete

Employees:
  GET    /api/employees                → Get all
  GET    /api/employees/{id}           → Get by ID
  POST   /api/employees                → Create
  PUT    /api/employees/{id}           → Update
  DELETE /api/employees/{id}           → Delete

Analytics:
  GET    /api/analytics                → Get all
  GET    /api/analytics/departments    → Department analytics
  GET    /api/analytics/hiring-trends  → Hiring trends
  GET    /api/analytics/distribution   → Distribution

Leaves:
  GET    /api/leaves                   → Get all
  PUT    /api/leaves/{id}/approve      → Approve
  PUT    /api/leaves/{id}/reject       → Reject
```

#### OData
```
Base URL: /odata/v2/service

Entity Sets:
  /DepartmentSet                        → Departments
  /EmployeeSet                          → Employees
  /LeaveSet                             → Leaves

Query Options:
  $filter=name eq 'Engineering'        → Filter
  $top=10&$skip=0                       → Pagination
  $orderby=name asc                     → Sorting
  $select=id,name                       → Select columns
```

### Mock Data Location

Test data available in: `webapp/service/mockData.json`

Contains:
- 6 departments with employee counts
- 5 sample employees
- Analytics data with hiring trends
- Department distribution

### Configuration

#### Change API Base URL
Edit `webapp/service/APIService.js` line 7:
```javascript
this._sBaseUrl = "https://api.example.com/api";
```

#### Change OData Service URL
When creating ODataService:
```javascript
var oService = new ODataService("https://sap-server.com/odata/v2/service");
```

#### Switch to Mock Data
Edit `webapp/Component.js`:
```javascript
var oModel = new JSONModel("service/mockData.json");
this.setModel(oModel);
```

### Common Use Cases

#### Load and Display Department List
```javascript
_loadDepartments: function () {
    var oModel = this.getModel();
    this._oAPIService.getDepartments()
        .then(function (aDepts) {
            oModel.setProperty("/departments", aDepts);
        }.bind(this));
}
```

#### Create New Record with Dialog
```javascript
onAddPress: function () {
    var oDialog = new sap.m.Dialog({
        title: "Add Department",
        buttons: [
            new sap.m.Button({
                text: "Add",
                press: this._onAdd.bind(this)
            })
        ]
    });
    oDialog.open();
}

_onAdd: function () {
    // Get form data and create
    this._oAPIService.createDepartment(oFormData)
        .then(() => {
            this.onAddPress._oDialog.close();
            this._loadDepartments();
        });
}
```

#### Edit and Update Record
```javascript
onEditPress: function (oEvent) {
    var sId = oEvent.getSource().getBindingContext().getProperty("id");
    var oData = {...updatedData...};
    
    this._oAPIService.updateDepartment(sId, oData)
        .then(() => this._loadDepartments());
}
```

#### Delete Record
```javascript
onDeletePress: function (sId) {
    sap.m.MessageBox.confirm(
        "Delete this department?",
        {
            onClose: function(sAction) {
                if (sAction === "OK") {
                    this._oAPIService.deleteDepartment(sId)
                        .then(() => this._loadDepartments());
                }
            }.bind(this)
        }
    );
}
```

### Debugging Tips

#### Enable Logging
```javascript
// In your service
_makeRequest: function (sMethod, sPath, oData) {
    console.log("API Call:", sMethod, this._sBaseUrl + sPath, oData);
    return fetch(...)
        .then(response => {
            console.log("Response:", response);
            return response.json();
        });
}
```

#### Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Make API call
4. Inspect request/response

#### Verify Model Data
```javascript
var oModel = this.getModel();
console.log(oModel.getData());  // View all model data
```

### Error Handling Pattern

```javascript
_handleRequest: function (oPromise) {
    return oPromise
        .then(function (oResult) {
            this.log("Success:", oResult);
            return oResult;
        }.bind(this))
        .catch(function (oError) {
            this.logError("Failed:", oError);
            this.showMessage(
                "Operation failed: " + (oError.message || "Unknown error"),
                "error"
            );
            throw oError;
        }.bind(this));
}

// Usage
this._handleRequest(
    this._oAPIService.getDepartments()
);
```

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `Analytics.view.xml` | Analytics dashboard UI |
| `Analytics.controller.js` | Analytics logic & chart handling |
| `APIService.js` | REST API integration |
| `ODataService.js` | OData v2 integration |
| `ExportService.js` | Export to Excel/PDF |
| `mockData.json` | Sample data for development |
| `BaseController.js` | Reusable base class |
| `PHASE_7_8_IMPLEMENTATION.md` | Detailed documentation |
| `BACKEND_INTEGRATION_GUIDE.md` | Backend setup guide |
| `README.md` | Project overview |

---

## Getting Help

1. **Review documentation**:
   - Check `PHASE_7_8_IMPLEMENTATION.md` for detailed info
   - Check `BACKEND_INTEGRATION_GUIDE.md` for backend setup

2. **Check code comments**: All methods have JSDoc comments

3. **Use browser console**: Check for error messages and logs

4. **Debug network calls**: Use browser Developer Tools F12

5. **Test with mock data**: Use `mockData.json` during development

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Ready to Use
