import React from "react";
import ReactDOM from "react-dom";
import Login from './components/Login';
import SignUp from './components/SignUp';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import PrivateRoute from './components/protectRoutes/PrivateRoutes';
import PrivateDashBoard from './components/protectRoutes/PrivateDashBoard';
// import UserPortal from './components/UserPortal';
import UserPortal from './components/userPortal/index';
import Dashboard from './layouts/Admin';
import { AuthProvider } from "./components/contexts/AuthContext";
import ResetPassword from "./views/resetPassword"

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";

ReactDOM.render(
  <Router>
    <AuthProvider>
    <Switch>
      {/* <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
      <Redirect from="/" to="/admin/dashboard" /> */}

      <PrivateRoute exact path="/" component={UserPortal} />
      <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
      {/* <PrivateDashBoard exact path="/admin/dashboard" component={Dashboard} /> */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/resetPassword" component={ResetPassword} />
    </Switch>
    </AuthProvider>
  </Router>,
  document.getElementById("root")
);
