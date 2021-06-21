import React,{useState, useEffect} from 'react'
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory, Route } from "react-router-dom";
import { 
  Navbar, 
  Container, 
  Row, 
  Col, 
  InputGroup, 
  Button, 
  FormControl,
  Alert,
  Card,
  Tabs,
  Tab,
  Modal
} from "react-bootstrap";
import PlacehoderImg from '../../assets/placeholder.svg'


import { db } from "../../firebase";
import {handleDeactiveApp, handleDeactiveAllApps, handleInactiveCode} from './appAction'


export default function UserPortal() {

  const [theUser, setTheUser] = useState({
    products:[]
  });
  const [showDeactiveAlert, setShowDeactiveAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showDeactiveAppAlert, setShowDeactiveAppAlert] = useState(false);
  const [showDeactiveAppsAlert, setShowDeactiveAppsAlert] = useState(false);
  const [products, setProducts] = useState([]);
  const [activateCode, setActivateCode] = useState("");
  const [inactivateCodes, setInactivateCodes] = useState([]);
  const [activateCodes, setActivateCodes] = useState([]);
  const [showActivateCodeAlert, setShowActivateCodeAlert] = useState(false)
  const [theCodeObject, setTheCodeObject] = useState({})
  const [appName, setAppName] = useState("")
  const [productName, setProductName] = useState("")
  const [theObject, setTheObject] = useState({
    productActivated: []
  })
  const [prefixCode , setPrefixCode] = useState("")

  useEffect(() => {
    const ac = new AbortController();
    db.collection("users").doc(currentUser.uid).get()
    .then(snapshot=>{
      setTheUser({...snapshot.data(),id:currentUser.uid});
      if(snapshot.data().products){
        setProducts(snapshot.data().products)
      }
      return {signal: ac.signal} 
    })
    // console.log(currentUser.uid);
      return () => ac.abort(); 
  }, [])

  useEffect (() => {
    const ac = new AbortController();
    setProducts(theUser.products)
    db.collection("inactiveCodes").get()
    .then(snapshot => {
      let allCodes = []
      snapshot.docs.forEach(code => {
        allCodes.push(code.data())
      })
      setInactivateCodes([...allCodes])
      return {signal: ac.signal} 
    })
    return () => ac.abort(); 
  },[])

  useEffect (() => {
    const ac = new AbortController();
    db.collection("codes").get()
    .then(snapshot => {
      let allCodes = []
      snapshot.docs.forEach(code => {
        allCodes.push(code)
      })
      setActivateCodes([...allCodes])
      return {signal: ac.signal} 
    })
    return () => ac.abort(); 
  },[])

  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const [error, setError] = useState("");

  async function handleLogout() {
      setError("");
  
      try {
        await logout();
        history.push("/login");
      } catch {
        setError("Failed to log out");
      }
    }
    
  const handleOpenActivateCodeAlert = (activateCode) => {
    const exist = inactivateCodes.filter(code => code.inactiveCode == activateCode);
    if(exist.length == 0){
      const notExist = activateCodes.filter(code => code.data().code == activateCode);
      if(notExist.length == 0){
          setShowAlert(true)
      }else{
          setPrefixCode(notExist[0].data().prefixCode)
          setShowActivateCodeAlert(true)
      }
    }else{
      setShowAlert(true)
    }
  }
  
  const openPopup = () => {
    setShowDeactiveAlert(true)
  }

  const closePopup = () => {
    setShowDeactiveAlert(false)
    setShowActivateCodeAlert(false)
    setProducts(theUser.products)
  }

  const handleCodeInput = e => {
    setActivateCode(e.target.value)
    let codeObject =activateCodes.find(code => e.target.value == code.data().code)
    if(codeObject){
      setTheObject(codeObject.data());
      setTheCodeObject(codeObject)
    }
  }
  const handleTheDeactiveApp = (theUser,p,app,setTheUser) => {
    // console.log(name)
    handleDeactiveApp(theUser,p,app,setTheUser)
    setAppName(app.name)
    setShowDeactiveAppAlert(true)
    if(showDeactiveAppAlert){
      setShowDeactiveAppAlert(false)
    }
  }
  const handleTheDeactiveApps = (theUser,p,setTheUser,closePopup) => {
    // console.log(name)
    handleDeactiveAllApps(theUser,p,setTheUser,closePopup)
    setProductName(p.name)
    setShowDeactiveAppsAlert(true)
    if(showDeactiveAppsAlert){
      setShowDeactiveAppsAlert(false)
    }
  }

  let renderUserProducts = null;
  
  renderUserProducts = products ? products.map((p,j)=>{
    return  <Tab eventKey={`tab${j}`} title={p.visibility?p.name:null} key={j} style={{opacity: p.visibility? 1 : 0}}>
      <div className="productUser">
        <Row>
          <Col xs="auto">
            <img src={p.productIcon ? p.productIcon : PlacehoderImg} height="auto" width="50"/>
          </Col>
        <Col xs="auto">
        
          <h4>{p.name}</h4>
          <p>{p.description}</p>
          <Button variant="secondary">
            <a href={p.purchasedUrl ? "https://"+p.purchasedUrl : "https://"+p.unpurchasedUrl} target="_blank" >Learn More About {p.name}</a>
            </Button>
        </Col>
          <Col xs="auto">
            <Button style={{height:50, fontSize: 12}} variant="danger" onClick={openPopup}>Deactive all apps</Button>
            </Col>
            <Modal 
            show={showDeactiveAlert} 
            onHide={closePopup}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
              <Modal.Header closeButton>
              </Modal.Header>
              <Modal.Body style={{marginBottom: 30}}>Are You Sure Deactivate All Apps ?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closePopup}>
                  No
                </Button>
                <Button variant="primary" onClick={()=>handleTheDeactiveApps(theUser,p,setTheUser,closePopup)}>
                  Yes
                </Button>
              </Modal.Footer>
            </Modal>
        </Row>
        <Row>
          {p.apps.map((app,i) => {
            return <Col md="6" key={i}><div className="apps"  style={{borderColor: app.purchased ? "#87CB16" : "#AAA",borderStyle:app.purchased ? "solid" : "dashed"}}>
                <div style={{display: "flex", justifyContent: "space-around", marginBottom: 20}}>
                <img src={app.appIcon ? app.appIcon : PlacehoderImg} height="auto" width="50"/>
                  <h6 style={{marginLeft: 10, marginTop: 10}}>{app.name}</h6>
                <Button className="ml-auto" style={{padding:5, fontSize: 12}} variant="danger" 
                onClick={(e) => handleTheDeactiveApp(theUser,p,app,setTheUser)}>Deactive app</Button></div>
                
                {/* <p><strong>Expired Date : </strong>{app.expireDate}</p>
                <p><strong>Last Launched Date : </strong>{app.lastLaunchDate}</p>
                <p><strong>Times App Launched : </strong>{app.timesAppLaunched}</p>
                <p><strong>Times App Launched LastLogin: </strong>{app.timesAppLaunchedLastLogin}</p>
                <p><strong>Times App Launched Purchased : </strong>{app.timesAppLaunchedPurchased}</p> */}
                <div>{app.active ? <p><i className="icon-ok-sign"></i> Active</p> : <p><i className="icon-remove"></i> Not Active</p>}</div>
                {/* <div><Button variant="secondary"><a href={app.purchased ? app.activeUrl : app.inActiveUrl}>{!app.purchased ? "Purchase" : "Instruction"}</a></Button></div> */}
                <div>{app.purchased ? <Button variant="secondary"><a href={"https://"+app.activeUrl}>Instruction</a></Button>: <Button variant="secondary"><a href={"https://"+app.inActiveUrl}>Instruction</a></Button>}</div>
            </div></Col>
          })}
        </Row>
        <Row>
          {p.features.map((feature,i) => {
            return <Col md="6" key={i}><div className="apps"  style={{borderColor: feature.purchased ? "#87CB16" : "#AAA",borderStyle:feature.purchased ? "solid" : "dashed"}}>
                <div style={{textAlign: "left", marginBottom: 20}}>
                  <h6 style={{marginLeft: 10, marginTop: 10}}>{feature.name}</h6>
                </div>
                <div>{feature.active ? <p><i className="icon-ok-sign"></i> Active</p> : <p><i className="icon-remove"></i> Not Active</p>}</div>
                <div><Button variant="secondary"><a href={feature.purchased ? "https://"+feature.activeUrl: "https://"+feature.inActiveUrl}>{!feature.purchased ? "Purchase" : "Instruction"}</a></Button></div>
                <div>{feature.purchased ? <Button variant="secondary"><a href={"https://"+feature.activeUrl}>Instruction</a></Button>:null}</div>
            </div></Col>
          })}
        </Row>
      </div>
    </Tab>
    }) : null  

  return (
    <div>
      <Container>
      <Navbar>
        <Navbar.Brand href="#home"></Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
          <button onClick={handleLogout}>logout</button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
      <Alert
          // style={{opacity : showDeactiveAppAlert ? 1 : 0}}
          className={`alertOpacity ${showDeactiveAppsAlert ? 'alertAnimate' : ' '}`}
          variant='primary'
          onAnimationEnd={() => setShowDeactiveAppAlert(false)}
        >All <strong>{productName}</strong> apps have been deactivated !!</Alert> 
      <Alert
          // style={{opacity : showDeactiveAppAlert ? 1 : 0}}
          className={`alertOpacity ${showDeactiveAppAlert ? 'alertAnimate' : ' '}`}
          variant='primary'
          onAnimationEnd={() => setShowDeactiveAppAlert(false)}
        ><strong>{appName}</strong> has been deactivated !!</Alert> 
      <div style={{paddingTop : 30, paddingBottom: 30}}>
        <h2 style={{marginBottom: 50}}>User Portal</h2>
        <div style={{display: "flex"}}>
          <strong style={{marginRight:10}}>Welcome </strong>
          <p> {theUser.firstName} {theUser.lastName} - </p>
          <p> {theUser.email}</p>
        </div>
        <div style={{marginTop: 25}}>
        <Button variant="secondary" ><Link to="/resetPassword">Reset Password</Link></Button> 
        {/* <Button variant="secondary" ><a href={theUser.storeLink}>Store</a></Button>  */}
        </div>
          <hr style={{borderTop: "2px solid #555"}} />
        <div className="user_card">
          <strong className="mr-auto mb-3">Activate a Code: </strong>
          {/* <form onSubmit=""> */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Your Code"
              aria-label="Your Code"
              aria-describedby="Your Code"
              defaultValue={activateCode}
              value={activateCode}
              onChange={handleCodeInput}
            />
            <InputGroup.Append>
                <Button variant="secondary" type="submit" onClick={()=>handleOpenActivateCodeAlert(activateCode)}>Activate Code</Button>  
            </InputGroup.Append>
            </InputGroup>
              <Modal show={showAlert} 
                onHide={() => setShowAlert(false)}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                  <Modal.Header closeButton>
                  </Modal.Header>
                <Modal.Body style={{marginBottom: 30}}>Sorry this is invalid code</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowAlert(false)}>
                    ok
                  </Button>
              </Modal.Footer>
              </Modal>
              <Modal show={showActivateCodeAlert} 
                  onHide={() => setShowActivateCodeAlert(false)}
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  >
                    <Modal.Header closeButton>
                    </Modal.Header>
                  <Modal.Body style={{marginBottom: 30}}> <strong>{activateCode}</strong> will activate the following :
                    <div>
                    {
                      theObject.productActivated.length>0 ? theObject.productActivated.map((p,i) => {
                      return <div key={i}>
                      <strong>{p.name} => </strong>
                      <span>
                        {
                          p.apps ? p.apps.map((app, j) => {
                            return <span key={j}>{app}, </span>
                          }) : null
                        }
                      </span>
                      <span>
                        {
                          p.features ? p.features.map((feature, k) => {
                            return <span key={k}>{feature}, </span>
                          }) : null
                        }
                      </span><br/>
                      </div>
                      }) : null
                    }
                    {/* {console.log("theCodeObject",theCodeObject.productActivated)} */}
                    </div>
                    Press Yes to confirm, No to cancel</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowActivateCodeAlert(false)}>
                      No
                    </Button>
                    <Button variant="primary" onClick={()=>handleInactiveCode(activateCode,prefixCode, theUser,theCodeObject,closePopup,setActivateCode,setProducts)}>
                      Yes
                    </Button>
                </Modal.Footer>
                </Modal>
          {/* </form> */}
        </div>
          <hr style={{borderTop: "2px solid #555"}} />
        <Row>
          <Col xs="12">
            <Tabs
            id="uncontrolled-tab-example"
            // activeKey={key}
            // onSelect={(k) => setKey(k)}
            defaultActiveKey="tab0"
            >
              {renderUserProducts}
            </Tabs> 
          </Col>
        </Row>
      </div>
      
      </Container>
    </div>
  )
}
