"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Dashboard = _interopRequireDefault(require("views/Dashboard.js"));

var _UserProfile = _interopRequireDefault(require("views/UserProfile.js"));

var _addCodes = _interopRequireDefault(require("views/addCodes"));

var _Typography = _interopRequireDefault(require("views/Typography.js"));

var _Icons = _interopRequireDefault(require("views/Icons.js"));

var _addProduct = _interopRequireDefault(require("views/addProduct.js"));

var _Notifications = _interopRequireDefault(require("views/Notifications.js"));

var _Upgrade = _interopRequireDefault(require("views/Upgrade.js"));

var _createAdmin = _interopRequireDefault(require("./views/createAdmin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
var dashboardRoutes = [{
  upgrade: true,
  path: "/upgrade",
  name: "Upgrade to PRO",
  icon: "nc-icon nc-alien-33",
  component: _Upgrade["default"],
  layout: "/admin"
}, {
  path: "/Accounts",
  name: "Accounts",
  icon: "nc-icon nc-chart-pie-35",
  component: _Dashboard["default"],
  layout: "/admin"
}, {
  path: "/adminAccounts",
  name: "Admin Account",
  icon: "nc-icon nc-circle-09",
  component: _createAdmin["default"],
  layout: "/admin"
}, {
  path: "/user",
  name: "User Profile",
  icon: "nc-icon nc-android",
  component: _UserProfile["default"],
  layout: "/admin"
}, {
  path: "/codes",
  name: "Codes",
  icon: "nc-icon nc-compass-05",
  component: _addCodes["default"],
  layout: "/admin"
}, // {
//   path: "/table",
//   name: "Table List",
//   icon: "nc-icon nc-notes",
//   component: TableList,
//   layout: "/admin",
// },
// {
//   path: "/typography",
//   name: "Typography",
//   icon: "nc-icon nc-paper-2",
//   component: Typography,
//   layout: "/admin",
// },
// {
//   path: "/icons",
//   name: "Icons",
//   icon: "nc-icon nc-atom",
//   component: Icons,
//   layout: "/admin",
// },
{
  path: "/addProduct",
  name: "Product",
  icon: "nc-icon nc-planet",
  component: _addProduct["default"],
  layout: "/admin"
}, {
  path: "/settings",
  name: "Settings",
  icon: "nc-icon nc-settings-gear-64",
  component: _Icons["default"],
  layout: "/admin"
} // {
//   path: "/notifications",
//   name: "Notifications",
//   icon: "nc-icon nc-bell-55",
//   component: Notifications,
//   layout: "/admin",
// },
];
var _default = dashboardRoutes;
exports["default"] = _default;