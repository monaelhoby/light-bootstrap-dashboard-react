import React, {useRef,useEffect,useState } from "react";
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
  Modal,
  InputGroup, 
  FormControl ,
  Alert
} from "react-bootstrap";
import { Link } from "react-router-dom";

import app, { db } from "../firebase";
import {handleDeleteUser,handleDeleteUsers, handleUpdateUser} from './UsersAction'

import { useAuth } from "../components/contexts/AuthContext"
import Pagination from '../components/pagination'
import PlacehoderImg from '../assets/placeholder.svg'
import Loading from '../assets/img/Spin-1s-200px.gif'



function Dashboard() {
  const allRef = useRef();
  const emailRef = useRef("");
  const firstNameRef = useRef("");
  const lastNameRef = useRef("");
  // const userCode = useRef();
  const passwordRef = useRef("");
  const storeLinkRef = useRef();
  const [users,setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editableUser,setEditableUser] = useState({
    email:"",
    products:[]
  });
  const [modalAddAccountShow, setModalAddAccountShow] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [CommentVal, setCommentVal] = React.useState('');
  const [hideSearch, setHideSearch] = useState(true);
  const [searchedVal, setSearchedVal] = useState("");
  const [pageNum, setPageNum] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteSelectedAlert, setShowDeleteSelectedAlert] = useState(false)
  const [deleteUser, setDeleteUser] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState(0);
  const [currentUsers, setCurrentUsers] = useState([]) ;
  const [currentPage, setCurrentPage] = useState(null) ;
  const [totalPages, setTotalPages] = useState(null) ;
  const [showAlert, setShowAlert] = useState(false);
  const [theOffset, setTheOffset] = useState(null)
  const [thePageLimit, setThePageLimit] = useState(null)

  

  const closeEditPop = ()=>{
    setModalShow(false);
    setModalAddAccountShow(false);
    setShowDeleteSelectedAlert(false);
    setShowDeleteAlert(false)
  }

  const openDeletePopup = (id, i) => {
    // console.log("i", i)
    setDeleteUser(i)
    setDeleteUserId(id)
    setShowDeleteAlert(true)
  }

  const addNewUser = async(e,firstNameRef, lastNameRef,setUsers,callback,theOffset,thePageLimit,setCurrentUsers) => {
    e.preventDefault();
    const ac = new AbortController();
    setError("");
    // setLoading(true);
    await signup(emailRef.current.value, passwordRef.current.value)
    .then(function(cred){
      db.collection("products").get().then(snapshot=>{
      let theUser = {};
      theUser.email= cred.user.email;
      theUser.password= "";
      theUser.firstName= firstNameRef;
      theUser.lastName= lastNameRef;
      // theUser.userCode= codeRef;
      // theUser.storeLink= storeLinkRef;
      theUser.creationDate=cred.user.metadata.creationTime;
      theUser.lastLoginDate=cred.user.metadata.lastSignInTime;
      theUser.products = [];
    
      snapshot.docs.forEach(p=>{
        // console.log(p.id)
        let oneProduct = {};
        oneProduct.name = p.data().name;
        oneProduct.visibility = p.data().visibility;
        oneProduct.apps = [];
        oneProduct.features = [];
        oneProduct.purchased = false;
        oneProduct.purchasedUrl = p.data().purchasedUrl;
        oneProduct.unpurchasedUrl = p.data().unpurchasedUrl;
        oneProduct.productIcon = p.data().productIcon;
        oneProduct.description = p.data().description;
        oneProduct.id = p.id;
        oneProduct.datePurchased = "22/1/2021";
        p.data().apps ? p.data().apps.forEach(app=>{
          // console.log("app",app)
          oneProduct.apps.push({
            name:app.name,
            activeUrl:app.activeUrl ,
            inActiveUrl:app.inActiveUrl ,
            appIcon: app.appIcon,
            tag: app.tag ,
            active:false,
            purchased: false,
            credentials : false,
            expireDate: "30/3/2021",
            timesAppLaunchedLastLogin : "",
            timesAppLaunchedPurchased : "",
            lastLaunchDate : "",
            timesAppLaunched : 7,
            deviceId : "654321",
            activatedOn: "",
            codeUsed: "" ,
            DateofLastUse: "",
            LaunchesSinceActive: "",
            comments : ""
          })
          // console.log("the user is ", app.url)
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
              expireDate: "30/3/2021",
              activatedOn: '',
              codeUsed: '' ,
              comments : "",
          })
        }): null
        theUser.products.push(oneProduct);
      })
      return db.collection('users').doc(cred.user.uid).set(theUser) 
      }).then(() => {
        setShowAlert(true)
        setError("success")
        if(showAlert){
          setShowAlert(false)
        }
      db.collection("users").get()
      .then(snapshot=>{
        let users = [];
        snapshot.docs.forEach(user=>{
          user.checked = false;
          users.push(user);
        })
        setUsers([...users]);
        // setPageNum(pageNum)
        if(theOffset || thePageLimit){
          setCurrentUsers(users.slice(theOffset, theOffset + thePageLimit))
        }
        return {signal: ac.signal} 
      })
      callback();
      return {signal: ac.signal} 
      })
    }) 
    .catch(err=>{
      setError("Failed to create an account");
      return {signal: ac.signal} 
    })
    // setLoading(false);
    return () => ac.abort(); 
  }
 
  useEffect(() => {
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

 
  const onPageChanged = data => {
    setPageNum(0)
    const { currentPage, totalPages, pageLimit } = data;

    const offset = (currentPage - 1) * pageLimit;
    const currentUsers = users.slice(offset, offset + pageLimit);

    setCurrentPage(currentPage)
    setCurrentUsers(currentUsers)
    setTotalPages(totalPages)
    // console.log("offset", offset, "pageLimit", pageLimit)
  };
  // console.log("theOffset", theOffset, "thePageLimit", thePageLimit)
  const handleSelectUser = (e,i,id)=>{
    let newSelectedUsers = selectedUsers;
    let newUsersPage = currentUsers;
    if(e.target.checked){
      newUsersPage[i].checked = true
      newSelectedUsers.push(id);
    }else{
      newUsersPage[i].checked = false
      newSelectedUsers = newSelectedUsers.filter((uid)=>{
        return uid !== id
      })
    }
    setSelectedUsers([...newSelectedUsers])
    let newUsers = users;
    newUsers[i].checked = e.target.checked
    setUsers([...newUsers])
  }

  const toggleUsersSelection = (e)=>{
    let newSelectedUsers = [];
    let newUsers = users;
    newUsers.forEach(user=>{
      user.checked = e.target.checked;
      if(e.target.checked){
        newSelectedUsers.push(user.id);
      }
    })
    setSelectedUsers([...newSelectedUsers])
    setUsers([...newUsers])
  }

  const handleEditUser = (uid,i)=>{
    // console.log(users[i].data())
    let newEditableUser = {};
    newEditableUser.uid      = users[i].id;
    newEditableUser.email    = users[i].data().email;
    newEditableUser.password    = '';
    newEditableUser.firstName    = users[i].data().firstName;
    newEditableUser.lastName    = users[i].data().lastName;
    newEditableUser.creationDate = users[i].data().creationDate;
    // newEditableUser.userCode    = users[i].data().userCode;
    newEditableUser.products = users[i].data().products;
    setEditableUser({...newEditableUser});
    setModalShow(true)

  }

  const hanldeChangeEmailForEditableUser = (e)=>{
    let newEditableUser = editableUser;
    newEditableUser.email = e.target.value;
    setEditableUser({...newEditableUser})
  }

  const hanldeChangePassowrdForEditableUser = e => {
    let newEditableUser = editableUser;
    newEditableUser.password = e.target.value;
    // console.log(newEditableUser.password)
    setEditableUser({...newEditableUser})
  }

  const hanldeChangeLastNameForEditableUser = e => {
    let newEditableUser = editableUser;
    newEditableUser.lastName = e.target.value;
    // console.log(newEditableUser.userName)
    setEditableUser({...newEditableUser})
  }

  const hanldeChangeFirstNameForEditableUser = e => {
    let newEditableUser = editableUser;
    newEditableUser.firstName = e.target.value;
    // console.log(newEditableUser.userName)
    setEditableUser({...newEditableUser})
  }

  // const hanldeChangeCodeForEditableUser = e => {
  //   let newEditableUser = editableUser;
  //   newEditableUser.userCode = e.target.value;
  //   // console.log(newEditableUser.userCode )
  //   setEditableUser({...newEditableUser})
  // }

  const toggleCheckApp = (e,pIndex,appIndex)=>{
    // console.log("e.target.checked",e.target.checked)
    let newEditableUser = editableUser;
    newEditableUser.products[pIndex].apps[appIndex].active = e.target.checked;
    setEditableUser({...newEditableUser})
  }
  
  const toggleCheckFeatureActive= (e,pIndex,featureIndex)=>{
    // console.log("e.target.checked",e.target.checked)
    let newEditableUser = editableUser;
    newEditableUser.products[pIndex].features[featureIndex].active = e.target.checked;
    setEditableUser({...newEditableUser})
  }

  // toggle in purchased button
  const toggleCheckPurchasedApp = (e,pIndex,appIndex)=>{
  let newEditableUser = editableUser;
  editableUser.products[pIndex].apps[appIndex].purchased = e.target.checked;
  setEditableUser({...editableUser})
  }

  // toggle Credentials App
  const toggleCredentialsApp = (e,pIndex,appIndex)=>{
    let newEditableUser = editableUser;
    editableUser.products[pIndex].apps[appIndex].credentials = e.target.checked;
    setEditableUser({...editableUser})
  }

  // show search input
  const showSearchInput = (e) => {
    e.preventDefault()
    setHideSearch(!hideSearch)
  }

// add Comments
  const handleAppCommentChange = (e, pIndex,appIndex) => {
    e.persist();
    let newEditableUser = editableUser;
    newEditableUser.products[pIndex].apps[appIndex].comments = e.target.value;
    setEditableUser({...editableUser})
  }

  const handleFeatureCommentChange = (e, pIndex,featureIndex) => {
    e.persist();
    let newEditableUser = editableUser;
    newEditableUser.products[pIndex].features[featureIndex].comments = e.target.value;
    setEditableUser({...editableUser})
  }

  // change expire date
  const handleChangeExpireDate = (e, pIndex, appIndex) => {
    let newEditableUser = editableUser;
    editableUser.products[pIndex].apps[appIndex].expireDate = e.target.value;
    setEditableUser({...newEditableUser})
  }

  // change search value
  const handleChangeSearchVal = e =>{
    setSearchedVal(e.target.value)
  }

  // handleChangePage
  const handleChangePage = e => {
    setPageNum(Number(e.target.value))
  }

  //onClickBodyPopup
  const onClickBodyPopup= e => {
    // e.preventDefault();
    e.stopPropagation()
  }

  const addNewAccountPopup = (firstNameRefs, lastNameRefs,emailRefs, passwordRefs) => {
    setError(null)
    // console.log("refs",firstNameRef, lastNameRef,emailRef, passwordRef)
    firstNameRef.current.value = " "
    lastNameRef.current.value = " "
    emailRef.current.value = " "
    passwordRef.current.value = null
    setModalAddAccountShow(true);
    // console.log("refs",firstNameRef, lastNameRef,emailRef, passwordRef)

    // console.log(firstNameRef, lastNameRef,emailRef, passwordRef)
  }
        
  let renderProductsForUser = null;
  let PurchasedApp = null;
  renderProductsForUser = editableUser.products.map((p,j)=>{
    PurchasedApp = p.apps.filter(app => app.purchased === true);
      // const MailChaip = PurchasedApp.map((app, k) => (
      //     <h5 key={k}>MailChaip: {app.name},</h5>
      // ));
      return (<div className="pCategory" key={j} >
        <Row>
        <Col sm="12">
          <div style={{display: "flex"}}>
            <h4 style={{width:"100%"}} className="clearfix" style={{display: "flex"}}>
              <img src={p.productIcon? p.productIcon : PlacehoderImg} width="30px" height="30px"/>
              <span className="text-left" style={{marginLeft: "8px"}}>{p.name}</span>
              {/* <Button variant="danger" className="float-right" onClick={() => deleteProductFromUsers(p.name)}>Delete</Button> */}
            </h4>
            <div style={{paddingTop: 30, marginLeft: 20}}>
              {p.visibility? <i className="icon-eye-open fa-2x"></i> : <i className="icon-eye-close fa-2x"></i>}
            </div>
          </div>
        </Col>
        <br/>
        {/* <Col>   
        <span>Product Link :</span> 
        {
          p.purchasedUrl ? <a href="+{p.purchasedUrl}+">Instructions</a> : ''
        }
        {
          p.unpurchasedUrl ? <a href="+{p.unpurchasedUrl}+">Learn More</a> : ''
        }
        </Col> */}
        {/* <Col>
          <div>
            <p>products : <span>{p.purchased? "Purchased" : "Not Purchased"} </span></p>
            <p>Date purchased : <span>{p.purchased? p.datePurchased : ""}</span></p>
          </div>
        </Col> */}
        <Col sm="12">
          {/* {MailChaip} */}
        </Col>
        {p.apps.map((app,i)=>{
          return <Col md="6"  key={i}>
            <div className="oneProduct">
              <h6> 
                <img src={app.appIcon ? app.appIcon : PlacehoderImg} width="30px" height="30px"/> 
                <span style={{marginLeft: "8px"}}>{app.name}</span>
                </h6>
              <div>
              <span>Active : </span>
              <label className="switch">
                <input type="checkbox" checked={app.active} onChange={(e)=>{toggleCheckApp(e,j,i)}} />
                <span className="slider round"></span>
              </label>
              </div>
              {/* <div>
              <span>purchased : </span>
              <label className="switch">
                <input type="checkbox" checked={app.purchased} onChange={(e)=>{toggleCheckPurchasedApp(e,j,i)}} />
                <span className="slider round"></span>
              </label>
              </div> */}
            {
              app.purchased ? (<div><label >ExpireDate:</label><input type="date" id="expireDate" value={app.expireDate} name="expireDate" onChange={e => handleChangeExpireDate(e,j,i)}/></div>):""
            }
            <div>
            <h5><strong>Activated On : </strong><p>{app.activatedOn}</p></h5> 
            <h5><strong>Code Used : </strong><p>{app.codeUsed}</p></h5> 
            <h5><strong>Date of Last Use : </strong><p>{app.DateofLastUse}</p></h5> 
            <h5><strong>Launches since active : </strong><p>{app.LaunchesSinceActive}</p></h5> 
            </div>
            {/* <div>
            <span>Credentials : </span>
            <label className="switch">
              <input type="checkbox" checked={app.credentials} onChange={(e)=>{toggleCredentialsApp(e,j,i)}} />
              <span className="slider round"></span>
            </label>
            </div> */}
            <div>
            </div>
            {/* <div className="appDtail"> 
            {console.log(app)}
              <p><span># of times app launched since last login : </span><span>{app.timesAppLaunchedLastLogin}</span></p>
              <p><span># of times app launched since purchased : </span><span>{app.timesAppLaunchedPurchased}</span></p>
              <p><span>Date of last launch : </span><span>{app.lastLaunchDate}</span></p>
              <p><span># of times app launched : </span>{app.timesAppLaunched}<span></span></p>
              <p><span>DeviceId : </span>{app.active? app.deviceId : ""}<span></span></p>
            </div> */}

          <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Comments</Form.Label>
              <Form.Control as="textarea" rows={3} defaultValue={app.comments} onChange={(e) => handleAppCommentChange(e,j,i)}/>
            </Form.Group>
          </Col>
          </div>
          </Col>
          })}
          {p.features.map((feature,i)=>{
            return <Col md="6"  key={i}>
              <div className="oneProduct">
                <h6> 
                  <span>{feature.name}</span>
                  </h6>
                <div>
                <span>Active : </span>
                <label className="switch">
                  <input type="checkbox" checked={feature.active} onChange={(e)=>{toggleCheckFeatureActive(e,j,i)}} />
                  <span className="slider round"></span>
                </label>
                </div>
              <div>
              <h5><strong>Activated On : </strong><p>{feature.activatedOn}</p></h5> 
              <h5><strong>Code Used : </strong><p>{feature.codeUsed}</p></h5> 
              </div>
            <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" rows={3} defaultValue={feature.comments} onChange={(e) => handleFeatureCommentChange(e,j,i)}/>
              </Form.Group>
            </Col>
            </div>
            </Col>
            })}
        </Row> 
        </div>)
      
    
  })

  const savehandleUpdateUser = () => {
    handleUpdateUser(editableUser,setUsers,theOffset,thePageLimit,setCurrentUsers);
    setModalShow(false)
  }
  

  const LoadingSection = () => (
    <div className="loadingPage">
      <img src={Loading}/>
    </div>
  )
 
  if(loading){
    return <LoadingSection/>
  }

  const totalUsers = users.length;

  // Render all users
  let renderUsers = null;
  renderUsers = users.map((user,i)=>{
    
  if(!users.length){
    return;
  }
  if(i == pageNum){
    return ;
  }
   
  if(user.data().email.includes(searchedVal)){
      
    if(i < pageNum){
      return <tr key={user.id}>
      <td>
        <Form.Check className="mb-1 pl-0">
        <Form.Check.Label>
          <Form.Check.Input
            onChange={(e)=>{handleSelectUser(e,i,user.id)}}
            checked={user.checked}
              defaultValue=""
              type="checkbox"
            ></Form.Check.Input>
            <span className="form-check-sign"></span>
          </Form.Check.Label>
        </Form.Check>
      </td>
      {/* <td>{user.data().password}</td> */}
      <td>{user.data().firstName}</td>
      <td>{user.data().lastName}</td>
      <td>{user.data().email}</td>
      {/* <td>{user.data().userCode}</td> */}
      <td>{user.data().creationDate}</td>
      {/* <td>{user.data().lastLoginDate}</td> */}
      <td>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-422471719">
            Edit Task..
          </Tooltip>
        }
      >
        <Button
          onClick={()=>{handleEditUser(user.id,i)}}
          className="btn-simple btn-link p-1"
          type="button"
          variant="info"
        >
          <i className="fas fa-edit"></i>
        </Button>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-829164576">Remove..</Tooltip>
        }
      >
      <Button
        onClick={()=> openDeletePopup(user.id, i)}
        className="btn-simple btn-link p-1"
        type="button"
        variant="danger"
      >
        <i className="fas fa-times"></i>
      </Button>
      </OverlayTrigger>
      <Modal 
      show={showDeleteAlert} 
      onHide={() => setShowDeleteAlert(false)}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAlert(false)}>
            No
          </Button>
          <Button variant="primary" onClick={()=>handleDeleteUser(deleteUserId,users,deleteUser,setUsers, closeEditPop,theOffset,thePageLimit,setCurrentUsers,setLoading)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      </td>
      </tr>
      }else{
        return;
      }
  }
  }) 
  
  let renderPageUser = null ;
  renderPageUser = currentUsers.length > 0 ? currentUsers.map((currentUser, i) =>  {
    // console.log(currentUsers.length , pageNum)
    if(!currentUsers.length){
      return;
    }
    if(i == pageNum){
      return ;
    }
  if(currentUser.data().email.includes(searchedVal)){
    // if(i < pageNum){
    return (<tr key={currentUser.id}>
    <td>
      <Form.Check className="mb-1 pl-0">
      <Form.Check.Label>
        <Form.Check.Input
          onChange={(e)=>{handleSelectUser(e,i,currentUser.id)}}
          checked={currentUser.checked}
          defaultValue={currentUser.checked}
          type="checkbox"
          ></Form.Check.Input>
          <span className="form-check-sign"></span>
        </Form.Check.Label>
      </Form.Check>
    </td>
    {/* <td>{user.data().password}</td> */}
    <td>{currentUser.data().firstName}</td>
    <td>{currentUser.data().lastName}</td>
    <td>{currentUser.data().email}</td>
    {/* <td>{user.data().userCode}</td> */}
    <td>{currentUser.data().creationDate}</td>
    {/* <td>{user.data().lastLoginDate}</td> */}
    <td>
    <OverlayTrigger
      overlay={
        <Tooltip id="tooltip-422471719">
          Edit Task..
        </Tooltip>
      }
    >
      <Button
        onClick={()=>{handleEditUser(currentUser.id,i)}}
        className="btn-simple btn-link p-1"
        type="button"
        variant="info"
      >
        <i className="fas fa-edit"></i>
      </Button>
    </OverlayTrigger>
    <OverlayTrigger
      overlay={
        <Tooltip id="tooltip-829164576">Remove..</Tooltip>
      }
    >
    <Button
      onClick={()=> openDeletePopup(currentUser.id, i)}
      className="btn-simple btn-link p-1"
      type="button"
      variant="danger"
    >
      <i className="fas fa-times"></i>
    </Button>
    </OverlayTrigger>
    <Modal 
    show={showDeleteAlert} 
    onHide={() => setShowDeleteAlert(false)}
    aria-labelledby="contained-modal-title-vcenter"
    centered
    >
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteAlert(false)}>
          No
        </Button>
        <Button variant="primary" onClick={()=>handleDeleteUser(deleteUserId,users,deleteUser,setUsers, closeEditPop,theOffset,thePageLimit,setCurrentUsers,setLoading)}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
    </td>
    </tr>)
    // }
  }
    }) : null

  if (totalUsers === 0){
    return (
      <>
      <Row> 
          <Col>
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Users</Card.Title>
              </Card.Header>
              
              <Card.Body>
                
                <div className="searchContainer">
                  <InputGroup className="mb-3 inputSearch" >
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1" autoComplete="on" ><i className="nc-icon nc-zoom-split"></i></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder="Search"
                      aria-label="Search"
                      aria-describedby="basic-addon1"
                      value={searchedVal}
                      onChange={handleChangeSearchVal}
                    />
                  </InputGroup>
                </div>
                <div className="pagination">
                  <span>User Per Page : </span>
                  <select onChange={e => handleChangePage(e)}>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="50">25</option>
                    <option value="100">30</option>
                  </select>
                </div>
                <div>
                {error == "success" ?  (<Alert
                  // style={{display : showAlert ? "block" : "none"}}
                  className={`alertOpacity ${showAlert ? 'alertAnimate' : ' '}`}
                  variant='success'
                  onClick={() => setShowAlert(false)}
                ><i className="icon-ok" style={{color: "#FFF"}}></i> User Account Added successfully</Alert>) : null}
                </div>
              <Table className="table-hover table-striped table-bordered ">
                  <thead>
                    <tr>
                      <th className="border-0">
                         <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                            <Form.Check.Label>
                              <Form.Check.Input
                                onChange={toggleUsersSelection}
                                ref={allRef}
                                defaultValue="x"
                                type="checkbox"
                              ></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                          <span>all</span>
                        </th>
                      {/* <th className="border-0">Password</th> */}
                      <th className="border-0">First Name</th>
                      <th className="border-0">Last Name</th>
                      <th className="border-0">Email</th>
                      {/* <th className="border-0">User Code</th> */}
                      <th className="border-0">Date Added</th>
                      {/* <th className="border-0">Last Login Date</th> */}
                      <th className="border-0">
                        <button onClick={()=>{addNewAccountPopup(firstNameRef.current.value, lastNameRef.current.value,emailRef.current.value, passwordRef.current.value)}}>Add New Account</button>
                        <button onClick={()=>{setShowDeleteSelectedAlert(true)}}>delete multiple user</button>
                        <Modal 
                          show={showDeleteSelectedAlert} 
                          onHide={() => setShowDeleteSelectedAlert(false)}
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                          >
                            <Modal.Header closeButton>
                              {/* <Modal.Title>Confirm</Modal.Title> */}
                            </Modal.Header>
                            <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary" onClick={() => setShowDeleteSelectedAlert(false)}>
                                No
                              </Button>
                              <Button variant="primary" onClick={()=> handleDeleteUsers(selectedUsers,setUsers, closeEditPop,theOffset,thePageLimit,setCurrentUsers,setLoading) }>
                                Yes
                              </Button>
                            </Modal.Footer>
                          </Modal>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {pageNum > 0 ? renderUsers : renderPageUser}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>           
          </Col>      
      </Row>
      <div className={"thePopUp " + (modalAddAccountShow ? "active" : "")} onClick={closeEditPop}>
        <div className="thePopUpBody" onClick={onClickBodyPopup}>
          <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
            <i className="nc-icon nc-simple-remove"></i>
        </div>
          <h4 className="card-title">Add New User</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={()=> console.log("work")}>
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
          <Button onClick={closeEditPop}>Close</Button>
          <Button 
          onClick={(e)=>{addNewUser(e,firstNameRef.current.value,lastNameRef.current.value, setUsers,closeEditPop,theOffset,thePageLimit,setCurrentUsers)}}>Save</Button>
        </Form>
        </div>
    </div><div className={"thePopUp " + (modalAddAccountShow ? "active" : "")} onClick={closeEditPop}>
        <div className="thePopUpBody" onClick={onClickBodyPopup}>
          <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
            <i className="nc-icon nc-simple-remove"></i>
        </div>
          <h4 className="card-title">Add New User</h4>
        {error==="Failed to create an account" ? <Alert variant="danger">{error}</Alert> : null}
        
        <Form onSubmit={()=> console.log("work")}>
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
          <Button onClick={closeEditPop}>Close</Button>
          <Button onClick={(e)=>{addNewUser(e,firstNameRef.current.value,lastNameRef.current.value,setUsers,closeEditPop,theOffset,thePageLimit,setCurrentUsers)}}>Save</Button>
        </Form>
        </div>
    </div>
      </>
    ) ;
  } else{
  return (
    <>
      <Container fluid>
        {/* <div className="text-right mt-15">
        <Button className="mr-2" variant="secondary">Users</Button> 
        <Button className="mr-2" variant="secondary">Codes</Button> 
        <Button className="mr-2" variant="secondary">Used Codes</Button> 
        <Button variant="secondary">Settings</Button>
        </div> */}
      <Row> 
          <Col>
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Users</Card.Title>
                {/* <p className="card-category">List of userse where you can manage them</p> */}
              </Card.Header>
              
              <Card.Body>
                
                <div className="searchContainer">
                  {/* <Nav.Link
                    className="m-0 staticIcon"
                    href="#pablo"
                    onClick={showSearchInput}
                    style={{opacity : hideSearch ? 1 : 0}}
                  >
                    <i className="nc-icon nc-zoom-split"></i>
                    <span> Search</span>
                  </Nav.Link> */}
                  <InputGroup className="mb-3 inputSearch" >
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1" autoComplete="on" ><i className="nc-icon nc-zoom-split"></i></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder="Search"
                      aria-label="Search"
                      aria-describedby="basic-addon1"
                      value={searchedVal}
                      onChange={handleChangeSearchVal}
                    />
                  </InputGroup>
                </div>
                <div className="pagination">
                  <span>User Per Page : </span>
                  <select onChange={e => handleChangePage(e)}>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="50">25</option>
                    <option value="100">30</option>
                  </select>
                </div>
                <div>
                {
                  // error == "success" ? (<Alert variant="success">User Account Added</Alert>): null
                }
                {error == "success" ?  (<Alert
                  // style={{display : showAlert ? "block" : "none"}}
                  className={`alertOpacity ${showAlert ? 'alertAnimate' : ' '}`}
                  variant='success'
                  onClick={() => setShowAlert(false)}
                ><i className="icon-ok" style={{color: "#FFF"}}></i> User Account Added successfully</Alert>) : null}
                </div>
              <Table className="table-hover table-striped table-bordered ">
                  <thead>
                    <tr>
                      <th className="border-0">
                         <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                            <Form.Check.Label>
                              <Form.Check.Input
                                onChange={toggleUsersSelection}
                                ref={allRef}
                                defaultValue="x"
                                type="checkbox"
                              ></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                          <span>all</span>
                        </th>
                      {/* <th className="border-0">Password</th> */}
                      <th className="border-0">First Name</th>
                      <th className="border-0">Last Name</th>
                      <th className="border-0">Email</th>
                      {/* <th className="border-0">User Code</th> */}
                      <th className="border-0">Date Added</th>
                      {/* <th className="border-0">Last Login Date</th> */}
                      <th className="border-0">
                        <button 
                        onClick={()=>{addNewAccountPopup(firstNameRef.current.value, lastNameRef.current.value,emailRef.current.value, passwordRef.current.value)}}>Add New Account</button>
                        <button onClick={()=>{setShowDeleteSelectedAlert(true)}}>delete multiple user</button>
                        <Modal 
                          show={showDeleteSelectedAlert} 
                          onHide={() => setShowDeleteSelectedAlert(false)}
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                          >
                            <Modal.Header closeButton>
                              {/* <Modal.Title>Confirm</Modal.Title> */}
                            </Modal.Header>
                            <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary" onClick={() => setShowDeleteSelectedAlert(false)}>
                                No
                              </Button>
                              <Button variant="primary" onClick={()=> handleDeleteUsers(selectedUsers,setUsers, closeEditPop,theOffset,thePageLimit,setCurrentUsers,setLoading) }>
                                Yes
                              </Button>
                            </Modal.Footer>
                          </Modal>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {pageNum > 0 ? renderUsers : renderPageUser}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>           
          </Col>      
      </Row>
      <div className={"thePopUp " + (modalShow ? "active" : "")} onClick={closeEditPop}>
          <div className="thePopUpBody" onClick={onClickBodyPopup}>
            <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
              <i className="nc-icon nc-simple-remove"></i>
            </div>
            <h4 className="card-title">Edit User</h4>
        
          <div className="userDetails">
            {/* <h6>User Details</h6> */}
                <Form.Group>
                  <label>Email</label>
                  <Form.Control
                      defaultValue={editableUser.email}
                      placeholder="Add Product Apps Separated by Comma"
                      type="text"
                      onChange={hanldeChangeEmailForEditableUser}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <label>Password</label>
                  <Form.Control
                      defaultValue={editableUser.password}
                      placeholder="Password"
                      type="text"
                      onChange={hanldeChangePassowrdForEditableUser}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <label>First Name</label>
                  <Form.Control
                      defaultValue={editableUser.firstName}
                      placeholder="Add Product Apps Separated by Comma"
                      type="text"
                      onChange={hanldeChangeFirstNameForEditableUser}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                    <label>Last Name</label>
                    <Form.Control
                        defaultValue={editableUser.lastName}
                        type="text"
                        onChange={hanldeChangeLastNameForEditableUser}
                    ></Form.Control>
                </Form.Group>
                <h5><strong>Account Created :</strong>  {editableUser.creationDate}</h5>
                <Button><Link to="/resetPassword">Forgot Password?</Link></Button>
                {/* <Form.Group>
                    <label>User Code</label>
                    <Form.Control
                        defaultValue={editableUser.userCode}
                        type="text"
                        onChange={hanldeChangeCodeForEditableUser}
                    ></Form.Control>
                </Form.Group> */}
              <h4>Manage Users Products</h4>
              {renderProductsForUser}
          </div>
        <Row>
          <Button onClick={() => setModalShow(false)}>Close</Button>
          <Button
            className="btn-fill pull-right"
            type="submit"
            variant="info"
            onClick={savehandleUpdateUser}
          >
            Save Change
          </Button>
        </Row>
        </div>
      </div>
      <div className={"thePopUp " + (modalAddAccountShow ? "active" : "")} onClick={closeEditPop}>
        <div className="thePopUpBody" onClick={onClickBodyPopup}>
          <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
            <i className="nc-icon nc-simple-remove"></i>
        </div>
          <h4 className="card-title">Add New User</h4>
        {error==="Failed to create an account" ? <Alert variant="danger">{error}</Alert> : null}
        
        <Form onSubmit={()=> console.log("work")}>
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
          <Button onClick={closeEditPop}>Close</Button>
          <Button onClick={(e)=>{addNewUser(e,firstNameRef.current.value,lastNameRef.current.value, setUsers,closeEditPop,theOffset,thePageLimit,setCurrentUsers)}}>Save</Button>
        </Form>
        </div>
    </div>
      
    <div className="w-100 px-4 py-5 d-flex flex-row flex-wrap align-items-center justify-content-between">
      <div className="d-flex flex-row align-items-center">
        {currentPage && (
          <span className="current-page d-inline-block h-100 pl-4 text-secondary">
            Page <span className="font-weight-bold">{currentPage}</span> /{" "}
            <span className="font-weight-bold">{totalPages}</span>
          </span>
        )}
      </div>
      <div className="d-flex flex-row py-4 align-items-center">
        <Pagination
          totalRecords={totalUsers}
          pageLimit={pageNum}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
        />
      </div>
    </div>
      </Container>
    </>
  ); 
  }
}

export default Dashboard;
