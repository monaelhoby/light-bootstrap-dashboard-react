import React from "react"
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ component: Component, ...rest }) {
    // console.log("useAuth is",useAuth())
  const { currentUser } = useAuth()
  return (
      
    <Route
      {...rest}
      render={props => {
        if(currentUser){
          if(currentUser.admin){
            return<Redirect to="/admin/Accounts"></Redirect>
          }
          else{
            return <Component {...props} />
          }
        }else{
          return <Redirect to="/login" />
        }
      }}
    ></Route>
    
  )
}
