import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Modal } from "react-bootstrap";
import { useAuth } from "./contexts/AuthContext"
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase";

export default function Signup() {
  const emailRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const userCode = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const storeLinkRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e,firstNameRef, lastNameRef) {
    e.preventDefault();
    const ac = new AbortController();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    setError("");
    setLoading(true);
    await signup(emailRef.current.value, passwordRef.current.value)
    .then(function(cred){
      db.collection("products").get().then(snapshot=>{
      let theUser = {};
      theUser.email= cred.user.email;
      // theUser.password= '';
      theUser.firstName= firstNameRef;
      theUser.lastName= lastNameRef;
      // theUser.userCode= codeRef;
      // theUser.storeLink= storeLinkRef;
      theUser.creationDate=cred.user.metadata.creationTime;
      theUser.lastLoginDate=cred.user.metadata.lastSignInTime;
      theUser.products = [];
      snapshot.docs.forEach(p=>{
        let oneProduct = {};
        oneProduct.name = p.data().name;
        oneProduct.visibility = p.data().visibility;
        oneProduct.apps = [];
        oneProduct.features = [];
        oneProduct.comments = "comment";
        oneProduct.purchased = false;
        oneProduct.purchasedUrl = p.data().purchasedUrl;
        oneProduct.unpurchasedUrl = p.data().unpurchasedUrl;
        oneProduct.productIcon = p.data().productIcon;
        oneProduct.description = p.data().description;
        oneProduct.id = p.id;
        oneProduct.datePurchased = "22/1/2021";
        p.data().apps ? p.data().apps.forEach(app=>{
          oneProduct.apps.push({
            name:app.name,
            tag:app.tag,
            activeUrl:app.activeUrl,
            inActiveUrl:app.inActiveUrl,
            active:false,
            appIcon: app.appIcon,
            purchased: false,
            credentials : false,
            expireDate: "30/3/2021",
            timesAppLaunchedLastLogin : 3,
            timesAppLaunchedPurchased : 4,
            lastLaunchDate : "23-12-2020",
            timesAppLaunched : 7,
            deviceId : "1.23.456.5",
            activatedOn: '12/28/2020 @ 5:45pm : "1.23.456.5"',
            codeUsed: '123456789' ,
            DateofLastUse: '12/29/2020 @ 3:43pm',
            LaunchesSinceActive: 23
          })
        }) : null
        p.data().features ? p.data().features.forEach(feature => {
          // console.log("feature",feature)
          oneProduct.features.push({
              name:feature.name,
              activeUrl:feature.activeUrl,
              inActiveUrl:feature.inActiveUrl,
              tag:feature.tag,
              active:false,
              purchased: false,
              credentials : false,
              expireDate: "30/3/2021",
              activatedOn: '12/28/2020 @ 5:45pm : "1.23.456.5"',
              codeUsed: '123456789' ,
          })
        }) : null
        theUser.products.push(oneProduct);
        // console.log("the user is ", theUser.products)
      })
      // setError("Account has been created")
      return db.collection('users').doc(cred.user.uid).set(theUser) 
      },{signal: ac.signal})
    }).then(()=>{
      setModalShow(true)
      // history.push("/");
      return {signal: ac.signal} 
    }) 
    .catch(err=>{
      setError("Failed to create an account");
      return {signal: ac.signal} 
    })
    setLoading(false);
    return () => ac.abort(); 
  }

  const MyVerticallyCenteredModal = (props) => {
    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          {/* <Modal.Title id="contained-modal-title-vcenter">
            Modal heading
          </Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          {/* <h4>Centered Modal</h4> */}
          <h5 className="text-center" style={{lineHeight: 2}}>
          <strong >Congratulations!! </strong> your account has been created successfully.<br/> you can now 
          <Link className="w-100 text-center mt-2" to="/login"> Log In</Link>
          </h5>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer> */}
      </Modal>
    );
  }

  return (
    <>
    <div className="w-100" style={{ maxWidth: "400px",margin:"50px auto" }}>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={(e)=>handleSubmit(e,firstNameRef.current.value,lastNameRef.current.value)}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="first-name">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" ref={firstNameRef} required />
            </Form.Group>
            <Form.Group id="last-name">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" ref={lastNameRef} required />
            </Form.Group>
            {/* <Form.Group id="user-code">
              <Form.Label>User Code</Form.Label>
              <Form.Control type="text" ref={userCode} required />
            </Form.Group> */}
            {/* <Form.Group id="StoreLink">
              <Form.Label>Store Link</Form.Label>
              <Form.Control type="StoreLink" ref={storeLinkRef} required />
            </Form.Group> */}
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
        <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        />
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
      </div>
    </>
  );
}








