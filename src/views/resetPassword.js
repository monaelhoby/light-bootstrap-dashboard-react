import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Modal } from "react-bootstrap";
import { useAuth } from "../components/contexts/AuthContext";
import { Link } from "react-router-dom";

import app, { db } from "../firebase";

export default function forgetPassword() {
  // console.log("useAuth",useAuth())
  const emailRef = useRef()
  const passwordRef = useRef()
  const { handleResetPassword } = useAuth()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showFailedResetPassword, setShowFailedResetPassword] = useState(false)

  React.useEffect(() => {
    db.collection("users").get()
    .then(snapshot=>{
      let users = [];
      snapshot.docs.forEach(user=>{
        user.checked = false;
        users.push(user);
      })
      setUsers([...users]);
    })
  },[]);

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setMessage("")
      setError("")
      setLoading(true)
      await handleResetPassword(emailRef.current.value)
      setMessage("Check your inbox")
    } catch(err) {
        console.log(err)
      setError("Failed to Reset Password")
    }

    setLoading(false)
  }


  const handleClick = () =>{
    let check = false
    let failedCheck = false
    users.forEach(user => {
      if(emailRef.current.value === user.data().email){
          check = true
      }
      if(emailRef.current.value !== user.data().email){
        failedCheck = true
      }
    })
    if(check){
      setShowResetPassword(true)
    }
    if(failedCheck && !check){
      setShowFailedResetPassword(true)
    }
  }
  

  return (
    <>
    <div className="w-100" style={{ maxWidth: "400px",margin:"50px auto" }}>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {/* <Form onSubmit={handleClick}> */}
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit" onClick={handleClick}>
              Reset Password
            </Button>
          {/* </Form> */}
          <div className="w-100 text-center mt-3">
            <Link to="/login">Login</Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
      
      <div className={"thePopUp " + (showResetPassword ? "active" : "")} onClick={() => setShowResetPassword(false)}>
        <div className="thePopUpBody">
          <div className="font-icon-detail closePopUp" onClick={() => setShowResetPassword(false)}>
            <i className="nc-icon nc-simple-remove"></i>
          </div>
          <Modal.Body style={{marginBottom: 30}}>Password Reset sent to your email successfully</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Ok
          </Button>
        </Modal.Footer>
        </div>
      </div>
      <div className={"thePopUp " + (showFailedResetPassword && !showResetPassword ? "active" : "")} onClick={() => setShowFailedResetPassword(false)}>
        <div className="thePopUpBody">
          <div className="font-icon-detail closePopUp" onClick={() => setShowFailedResetPassword(false)}>
            <i className="nc-icon nc-simple-remove"></i>
          </div>
          <div>
          Account Not Found
          </div>
        </div>
      </div>
      </div>
    </>
  )
}



