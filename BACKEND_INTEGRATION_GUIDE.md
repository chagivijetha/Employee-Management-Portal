# Backend Integration Configuration Guide

## Overview
This document provides configuration options and setup instructions for integrating your SAPUI5 application with backend services.

## Configuration Options

### 1. REST API Integration

#### Using APIService

**Setup**:
```javascript
// In your controller
sap.ui.define([
    "my/sample/app/service/APIService"
], function(APIService) {
    return Controller.extend("my.sample.app.controller.YourController", {
        onInit: function() {
            this._oAPIService = new APIService();
        },
        
        onLoadData: function() {
            this._oAPIService.getDepartments()
                .then(function(aDepartments) {
                    // Process departments
                })
                .catch(function(oError) {
                    sap.m.MessageBox.error(oError.message);
                });
        }
    });
});
```

**Base URL Configuration**:
- Default: `/api`
- Update in `service/APIService.js` line 7:
  ```javascript
  this._sBaseUrl = "https://your-api-server.com/api";
  ```

#### API Endpoints

**Standard Endpoints Pattern**:
```
GET    /api/departments              - List all departments
GET    /api/departments/{id}         - Get department details
POST   /api/departments              - Create department
PUT    /api/departments/{id}         - Update department
DELETE /api/departments/{id}         - Delete department

GET    /api/employees                - List all employees
GET    /api/employees/{id}           - Get employee details
POST   /api/employees                - Create employee
PUT    /api/employees/{id}           - Update employee
DELETE /api/employees/{id}           - Delete employee

GET    /api/analytics                - Get all analytics
GET    /api/analytics/departments    - Department analytics
GET    /api/analytics/hiring-trends  - Hiring trends
GET    /api/analytics/distribution   - Distribution data

GET    /api/leaves                   - List leaves
PUT    /api/leaves/{id}/approve      - Approve leave
PUT    /api/leaves/{id}/reject       - Reject leave
```

**Request/Response Format**:
```json
// Request
POST /api/departments
Content-Type: application/json
{
    "name": "IT Operations",
    "managerName": "John Smith",
    "budget": 1000000,
    "description": "IT Infrastructure and Support"
}

// Response (200 OK)
{
    "id": "D07",
    "name": "IT Operations",
    "managerName": "John Smith",
    "budget": 1000000,
    "description": "IT Infrastructure and Support",
    "employees": 0
}

// Error Response (400)
{
    "status": 400,
    "message": "Invalid input",
    "details": "Department name is required"
}
```

### 2. OData Integration

#### Using ODataService

**Setup**:
```javascript
// In Component.js or Controller
sap.ui.define([
    "my/sample/app/service/ODataService"
], function(ODataService) {
    var oODataService = new ODataService("/odata/v2/myservice");
    var oModel = oODataService.getModel();
    this.setModel(oModel, "odata");
});
```

**Configuration**:
```javascript
// In ODataService constructor (line 16)
this._sServiceUrl = sServiceUrl || "/odata/v2/service";

// Optional: Add authentication
this._oModel = new ODataModelV2(this._sServiceUrl, {
    annotationURI: [...],
    headers: {
        "Authorization": "Bearer " + sToken
    },
    withCredentials: true
});
```

#### OData Service Structure

**Expected Entity Sets** (in OData metadata):
- `DepartmentSet`: Department entity collection
- `EmployeeSet`: Employee entity collection
- `LeaveSet`: Leave entity collection

**OData URL Pattern**:
```
GET    /odata/v2/service/DepartmentSet           - List departments
GET    /odata/v2/service/DepartmentSet('D01')    - Get department
POST   /odata/v2/service/DepartmentSet           - Create
PUT    /odata/v2/service/DepartmentSet('D01')    - Update
DELETE /odata/v2/service/DepartmentSet('D01')    - Delete
```

#### Advanced OData Features

**Batch Processing**:
```javascript
oODataService.batchRead([
    "/DepartmentSet",
    "/EmployeeSet",
    "/LeaveSet"
]).then(function(aResults) {
    // Process batch response
});
```

**Function Import**:
```javascript
oODataService.callFunctionImport("GetAnalytics", "GET", {
    year: 2024,
    department: "D01"
}).then(function(oResult) {
    // Handle analytics result
});
```

### 3. Mock Data Setup

For development without a backend:

**Using Mock Data**:
```javascript
// In Component.js
var oModel = new sap.ui.model.json.JSONModel("service/mockData.json");
this.setModel(oModel);
```

**Or In-Memory Mock**:
```javascript
var oMockData = {
    departments: [...],
    employees: [...],
    analytics: {...}
};
var oModel = new sap.ui.model.json.JSONModel(oMockData);
this.setModel(oModel);
```

### 4. Authentication Setup

#### Token-Based Authentication (JWT)

```javascript
// In APIService or ODataService
_makeRequest: function(sMethod, sPath, oData) {
    var sToken = localStorage.getItem("authToken");
    var oSettings = {
        method: sMethod,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sToken
        }
    };
    
    return fetch(this._sBaseUrl + sPath, oSettings)
        .then(function(response) {
            if (response.status === 401) {
                // Token expired, redirect to login
                window.location.href = "/login";
            }
            return response.json();
        });
}
```

#### CSRF Token Protection

```javascript
// For POST/PUT/DELETE requests
headers: {
    "X-CSRF-Token": this._getCsrfToken(),
    "Content-Type": "application/json"
}

_getCsrfToken: function() {
    return document.querySelector("meta[name='csrf-token']")?.content || "";
}
```

#### Basic Authentication

```javascript
var sUsername = "user";
var sPassword = "password";
var sBase64 = btoa(sUsername + ":" + sPassword);

headers: {
    "Authorization": "Basic " + sBase64
}
```

## Performance Optimization

### 1. Data Caching

```javascript
// Implement caching in APIService
var aCache = {};

getDepartments: function() {
    if (aCache.departments) {
        return Promise.resolve(aCache.departments);
    }
    
    return this._makeRequest("GET", "/departments")
        .then(function(aDepts) {
            aCache.departments = aDepts;
            return aDepts;
        });
}

// Clear cache on updates
updateDepartment: function(id, oData) {
    delete aCache.departments;
    return this._makeRequest("PUT", "/departments/" + id, oData);
}
```

### 2. Pagination

```javascript
// In API endpoint
getEmployees: function(iPage, iPageSize) {
    return this._makeRequest("GET", 
        "/employees?page=" + iPage + "&pageSize=" + iPageSize);
}

// In OData
readEmployees: function(iTop, iSkip) {
    this._oModel.read("/EmployeeSet", {
        urlParameters: {
            $top: iTop,
            $skip: iSkip
        }
    });
}
```

### 3. Data Filtering

```javascript
// REST API
searchDepartments: function(sSearch) {
    return this._makeRequest("GET", 
        "/departments?search=" + encodeURIComponent(sSearch));
}

// OData
readDepartmentsByName: function(sName) {
    this._oModel.read("/DepartmentSet", {
        filters: [
            new sap.ui.model.Filter("name", "Contains", sName)
        ]
    });
}
```

## Proxy Configuration

### Local Development (SAPUI5 Tools)

**ui5.yaml**:
```yaml
server:
  customMiddleware:
    - name: custom-middleware
      mountPath: /api
      afterMiddleware: compression
```

### Apache Reverse Proxy

```apache
ProxyPass /api http://backend-server:3000/api
ProxyPassReverse /api http://backend-server:3000/api

# CORS Headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### NGINX

```nginx
location /api {
    proxy_pass http://backend-server:3000;
    proxy_set_header Authorization $http_authorization;
    proxy_pass_header Authorization;
    
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
}
```

## Error Handling

### Global Error Handler

```javascript
// In Component.js
sap.ui.require(["sap/ui/core/ErrorHandler"], function(ErrorHandler) {
    new ErrorHandler(this);
});

// Custom error handling
_makeRequest: function(sMethod, sPath, oData) {
    return fetch(...)
        .catch(function(oError) {
            sap.m.MessageBox.error("Request failed: " + oError.message);
            throw oError;
        });
}
```

### Response Error Handling

```javascript
_handleError: function(oError) {
    var sMessage = "An error occurred";
    
    if (oError.status === 404) {
        sMessage = "Resource not found";
    } else if (oError.status === 400) {
        sMessage = oError.message || "Invalid request";
    } else if (oError.status === 500) {
        sMessage = "Server error. Please try again.";
    }
    
    sap.m.MessageBox.error(sMessage);
}
```

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate all inputs** on both client and server
3. **Implement CORS** properly
4. **Use secure session tokens**
5. **Implement rate limiting** on backend
6. **Never store sensitive data** in localStorage
7. **Validate responses** on client side
8. **Implement CSP headers** on server

## Testing

### Unit Testing REST API

```javascript
// Test REST API Service
QUnit.test("APIService.getDepartments", function(assert) {
    var oService = new APIService();
    
    return oService.getDepartments().then(function(aDepts) {
        assert.ok(Array.isArray(aDepts), "Should return array");
        assert.ok(aDepts.length > 0, "Should have departments");
    });
});
```

### Integration Testing

```javascript
// Test controller with API
QUnit.test("Controller loads departments", function(assert) {
    var oController = new YourController();
    
    return oController.onLoadData().then(function() {
        var aItems = oController.getView()
            .byId("departmentList").getItems();
        assert.ok(aItems.length > 0, "List should have items");
    });
});
```

## Deployment

### Production Checklist

- [ ] Configure production API endpoints
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS headers
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable caching headers
- [ ] Compress responses (gzip)
- [ ] Test error handling
- [ ] Implement request timeouts
- [ ] Set up backup/recovery

### Environment Configuration

```javascript
// In manifest.json or config
"sap.app": {
    "baseUrl": {
        "dev": "http://localhost:3000/api",
        "test": "https://test-api.example.com/api",
        "prod": "https://api.example.com/api"
    }
}
```

## Additional Resources

- [SAPUI5 Model Integration](https://sapui5.hana.ondemand.com/#/topic/e1b625940c104b4b9735e0b6a6d4f280)
- [OData v2 Specification](https://www.odata.org/documentation/)
- [RESTful API Design](https://restfulapi.net/)
- [Security Best Practices](https://cheatsheetseries.owasp.org/)

---

**Last Updated**: January 2024  
**Version**: 1.0
