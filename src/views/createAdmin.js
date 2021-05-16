import { Callbacks } from 'jquery';
import React, {useState, useEffect, useRef} from 'react';
import {
    Card,
    Table,
    Container,
    Row,
    Col,
    Form,
    Button ,
    InputGroup, 
    FormControl,
    OverlayTrigger,
    Tooltip,
    Accordion,
    Modal,
    Alert
  } from "react-bootstrap";
  import { db, functions } from "../firebase";
  import {handleEditAdmin, handleDeleteAdmin, handleDeleteAdmins} from './adminAction'
  import Pagination from '../components/pagination'

const CreateAdmin = () => {

  const allRef = useRef();
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [userAdmin, setUserAdmin] = useState("");
  const [editableAdmin, setEditableAdmin] = useState({email:"", firstName:"", lastName: ""});
  const [modalShow, setModalShow] = useState(false);
  const [searchedVal, setSearchedVal] = useState("");
  const [adminId, setAdminId] = useState(0);
  const [pageNum, setPageNum] = useState(10);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteSelectAlert, setShowDeleteSelectAlert] = useState(false)
  const [currentAdmins, setCurrentAdmins] = useState([]) ;
  const [currentPage, setCurrentPage] = useState(null) ;
  const [totalPages, setTotalPages] = useState(null) ;
  const [theOffset, setTheOffset] = useState(null)
  const [thePageLimit, setThePageLimit] = useState(null)
  
const addAdminRole = functions.httpsCallable("addAdminRole");

  useEffect(() => {
    db.collection("users").get()
    .then(snapshot=>{
      let users = [];
      snapshot.docs.forEach(user=>{
        users.push(user);
      })
      setUsers([...users]);
  })
  }, [])

  const handleOpenDeletePopUp = (id) => {
    setShowDeleteAlert(true)
    setAdminId(id)
    // console.log("id: ",id)
  }

  const handleChangeAddNewAdmin = e => {
    setUserAdmin(e.target.value)
  }

  const openAlertConfirmtion = () => {
    // console.log(userAdmin)
    setShowAlert(true)
  }

  const closePopUp = () => {
    setUserAdmin(" ")
    setShowAlert(false);
    setShowDeleteAlert(false)
    setShowDeleteSelectAlert(false)
    // console.log("userAdmin", userAdmin)
  }

  const handleAddNewAdmin = (setAdmins,callback,setUserAdmin,theOffset,thePageLimit,setCurrentAdmins) => {
    
    const adminUser = users.find((user) =>  user.data().email == userAdmin);
    // console.log(adminUser.data().email,userAdmin)
     addAdminRole({email : adminUser.data().email})
    .then(() => {
      db.collection("admins").add({
        firstName : adminUser.data().firstName,
        lastName : adminUser.data().lastName,
        email : adminUser.data().email,
        dateAdded : new Date().toLocaleString()
      })
      .then(() => {
        db.collection("admins").get()
        .then(snapshot=>{
          let theAdmins = [];
          snapshot.docs.forEach(admin=>{
            theAdmins.push(admin);
          })
          setAdmins([...theAdmins]);
          setUserAdmin("")
          callback()
          if(theOffset || thePageLimit){
            setCurrentAdmins(theAdmins.slice(theOffset, theOffset + thePageLimit))
          }else{
            setCurrentAdmins([...theAdmins])
          }
        })
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
    });
    })
  }

  //get admins

  useEffect(() => {
    db.collection("admins").get()
    .then(snapshot=>{
      let theAdmins = [];
      snapshot.docs.forEach(admin=>{
        theAdmins.push(admin);
      })
      setAdmins([...theAdmins]);
    })
  },[])

 //onClickBodyPopup
 const onClickBodyPopup= e => {
  e.preventDefault();
  e.stopPropagation()
  }

  const closeEditPop = ()=>{
    setModalShow(false);
  }

  const handleOpenEditAdmin = (Uid,i)=>{
    let newEditableAdmin = {};
    newEditableAdmin.Uid    = admins[i].id;
    newEditableAdmin.email    = admins[i].data().email;
    newEditableAdmin.firstName    = admins[i].data().firstName;
    newEditableAdmin.lastName    = admins[i].data().lastName;
    setEditableAdmin({...newEditableAdmin});
    setModalShow(true)
  }

  const hanldeChangeEmailForeditableAdmin = (e)=>{
    let newEditableAdmin = editableAdmin;
    newEditableAdmin.email = e.target.value;
    setEditableAdmin({...newEditableAdmin})
  }

  const hanldeChangeFirstNameForEditableAdmin = (e)=>{
    let newEditableAdmin = editableAdmin;
    newEditableAdmin.firstName = e.target.value;
    setEditableAdmin({...newEditableAdmin})
  }

  const hanldeChangeLastNameForEditableAdmin = (e)=>{
    let newEditableAdmin = editableAdmin;
    newEditableAdmin.lastName = e.target.value;
    setEditableAdmin({...newEditableAdmin})
  }

  // change search value
  const handleChangeSearchVal = e =>{
    setSearchedVal(e.target.value)
  }

    // handleChangePage
  const handleChangePage = e => {
    setPageNum(Number(e.target.value))
  }

const toggleAdminsSelection = (e)=>{
  let newSelectedAdmins = [];
  let newAdmins = admins;
  newAdmins.forEach(admin=>{
    admin.checked = e.target.checked;
    if(e.target.checked){
      newSelectedAdmins.push(admin.id);
    }
  })
  setSelectedAdmins([...newSelectedAdmins])
  setAdmins([...newAdmins])
}

const handleSelectAdmin = (e,i,id)=>{
  let newSelectedAdmins = selectedAdmins;
  if(e.target.checked){
    newSelectedAdmins.push(id);
  }else{
    newSelectedAdmins = newSelectedAdmins.filter((uid)=>{
      return uid !== id
    })
  }
  setSelectedAdmins([...newSelectedAdmins])
  let newAdmins = admins;
  newAdmins[i].checked = e.target.checked
  setAdmins([...newAdmins])
}

const onPageChanged = data => {
  setPageNum(0)
  const { currentPage, totalPages, pageLimit } = data;

  const offset = (currentPage - 1) * pageLimit;
  const currentAdmins = admins.slice(offset, offset + pageLimit);

  setCurrentPage(currentPage)
  setCurrentAdmins(currentAdmins)
  setTotalPages(totalPages)
};
 
const totalAdmins = admins.length;

  let renderAllAdmins = null;
  renderAllAdmins = admins.map((admin, i) => {
      
  if(!admins.length){
    return;
  }
  if(i == pageNum){
    return ;
  }
   
  if(admin.data().email.includes(searchedVal)){
    if(i < pageNum){
    return <tbody key={i}>
    <tr>
    <td>
        <Form.Check className="mb-1 pl-0">
        <Form.Check.Label>
          <Form.Check.Input
            onChange={(e)=>{handleSelectAdmin(e,i,admin.id)}}
            checked={admin.checked}
              // defaultValue=""
              value={admin.checked}
              type="checkbox"
            ></Form.Check.Input>
            <span className="form-check-sign"></span>
          </Form.Check.Label>
        </Form.Check>
      </td>
    <td>{admin.data().firstName}</td>
    <td>{admin.data().lastName}</td>
    <td>{admin.data().email}</td>
    <td>{admin.data().dateAdded}</td>
    <td>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-422471719">
            Edit Task..
          </Tooltip>
        }
      >
        <Button
          onClick={()=>{handleOpenEditAdmin(admin.id,i)}}
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
        onClick={() => handleOpenDeletePopUp(admin.id)}
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
          {/* <Modal.Title>Confirm</Modal.Title> */}
        </Modal.Header>
        <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAlert(false)}>
            No
          </Button>
          <Button variant="primary" onClick={()=>handleDeleteAdmin(adminId,setAdmins, closePopUp,theOffset,thePageLimit,setCurrentAdmins)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </td>
    </tr>
    </tbody>
    }
  }
  })

  let renderAllPageAdmins = null;
  renderAllPageAdmins = currentAdmins.map((admin, i) => {
      
  if(!admins.length){
    return;
  }

  if(admin.data().email.includes(searchedVal)){
    return <tbody key={i}>
    <tr>
    <td>
        <Form.Check className="mb-1 pl-0">
        <Form.Check.Label>
          <Form.Check.Input
            onChange={(e)=>{handleSelectAdmin(e,i,admin.id)}}
            checked={admin.checked}
              // defaultValue=""
              value={admin.checked}
              type="checkbox"
            ></Form.Check.Input>
            <span className="form-check-sign"></span>
          </Form.Check.Label>
        </Form.Check>
      </td>
    <td>{admin.data().firstName}</td>
    <td>{admin.data().lastName}</td>
    <td>{admin.data().email}</td>
    <td>{admin.data().dateAdded}</td>
    <td>
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-422471719">
            Edit Task..
          </Tooltip>
        }
      >
        <Button
          onClick={()=>{handleOpenEditAdmin(admin.id,i)}}
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
        onClick={() => handleOpenDeletePopUp(admin.id)}
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
          {/* <Modal.Title>Confirm</Modal.Title> */}
        </Modal.Header>
        <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAlert(false)}>
            No
          </Button>
          <Button variant="primary" onClick={()=>handleDeleteAdmin(adminId,setAdmins, closePopUp,theOffset,thePageLimit,setCurrentAdmins)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </td>
    </tr>
    </tbody>
  }
  });

    if (totalAdmins === 0) {
      return (
        
        <Container fluid>
        <Row> 
          <Col>
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4" style={{marginBottom: 30}}>Admin Accounts</Card.Title>
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
                  <span>Admin Per Page : </span>
                  <select  onChange={e => handleChangePage(e)}>
                    <option vlaue="10">10</option>
                    <option vlaue="15">15</option>
                    <option vlaue="25">25</option>
                  </select>
                </div>
                  <Accordion defaultActiveKey="0">
                    <Card>
                      <Card.Header>
                        <Accordion.Toggle as={Button} variant="link" eventKey="1">
                          Add New Admin
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey="1">
                        <Card.Body>
                        {/* <div className="pagination">
                          <span>Admin User : </span>
                          <select onChange={e => handleAddNewAdmin(e,setAdmins)}>
                            {
                              users.map((user, i) => (
                                <option key={i} value={user.data().email}>{user.data().email}</option>
                              ))
                            }
                          </select>
                        </div> */}
                        <Form.Group>
                          <label>Email</label>
                          <Form.Control
                              // defaultValue={userAdmin}
                              value={userAdmin}
                              placeholder="Admin Email"
                              type="text"
                              onChange={handleChangeAddNewAdmin}
                          ></Form.Control>
                        </Form.Group>
                        <Button onClick={openAlertConfirmtion}>Add Admin</Button>
                        <Modal 
                        show={showAlert} 
                        onHide={() => setShowAlert(false)}
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        >
                          <Modal.Header closeButton>
                            {/* <Modal.Title>Confirm</Modal.Title> */}
                          </Modal.Header>
                          <Modal.Body style={{marginBottom: 30}}>Do you want to add Email ?</Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowAlert(false)}>
                              No
                            </Button>
                            <Button variant="primary" onClick={() => handleAddNewAdmin(setAdmins,closePopUp,setUserAdmin,theOffset,thePageLimit,setCurrentAdmins)}>
                              Yes
                            </Button>
                          </Modal.Footer>
                        </Modal>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
              <Table className="table-hover table-striped table-bordered">
                  <thead>
                    <tr>
                    <th className="border-0">
                      <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                        <Form.Check.Label>
                          <Form.Check.Input
                            onChange={toggleAdminsSelection}
                            ref={allRef}
                            // defaultValue="x"
                            value={false}
                            type="checkbox"
                          ></Form.Check.Input>
                          <span className="form-check-sign"></span>
                        </Form.Check.Label>
                      </Form.Check>
                      <span>all</span>
                      </th>
                      <th className="border-0">First Name</th>
                      <th className="border-0">Last Name</th>
                      <th className="border-0">Email</th>
                      <th className="border-0">Date Added</th>

                      <th className="border-0">
                        <button onClick={()=> setShowDeleteSelectAlert(true)}>Delete Selected Accounts</button>
                       <Modal 
                        show={showDeleteSelectAlert} 
                        onHide={() => setShowDeleteSelectAlert(false)}
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        >
                          <Modal.Header closeButton>
                            {/* <Modal.Title>Confirm</Modal.Title> */}
                          </Modal.Header>
                          <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteSelectAlert(false)}>
                              No
                            </Button>
                            <Button variant="primary" onClick={() => handleDeleteAdmins(selectedAdmins, setAdmins, closePopUp,theOffset,thePageLimit,setCurrentAdmins)}>
                              Yes
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      </th>
                    </tr>
                  </thead>
                    {
                      pageNum > 0 ?  renderAllAdmins : renderAllPageAdmins
                    }
                </Table>
              </Card.Body>
              <Card.Footer>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        </Container>
      )
    }else{
      return (
        <div>
          <Container fluid>
            <Row> 
              <Col>
                <Card className="card-tasks">
                  <Card.Header>
                    <Card.Title as="h4" style={{marginBottom: 30}}>Admin Accounts</Card.Title>
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
                      <span>Admin Per Page : </span>
                      <select  onChange={e => handleChangePage(e)}>
                        <option vlaue="10">10</option>
                        <option vlaue="15">15</option>
                        <option vlaue="25">25</option>
                      </select>
                    </div>
                      <Accordion defaultActiveKey="0">
                        <Card>
                          <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="1">
                              Add New Admin
                            </Accordion.Toggle>
                          </Card.Header>
                          <Accordion.Collapse eventKey="1">
                            <Card.Body>
                            {/* <div className="pagination">
                              <span>Admin User : </span>
                              <select onChange={e => handleAddNewAdmin(e,setAdmins)}>
                                {
                                  users.map((user, i) => (
                                    <option key={i} value={user.data().email}>{user.data().email}</option>
                                  ))
                                }
                              </select>
                            </div> */}
                            <Form.Group>
                              <label>Email</label>
                              <Form.Control
                                  // defaultValue={userAdmin}
                                  value={userAdmin}
                                  placeholder="Admin Email"
                                  type="text"
                                  onChange={handleChangeAddNewAdmin}
                              ></Form.Control>
                            </Form.Group>
                            <Button onClick={openAlertConfirmtion}>Add Admin</Button>
                            <Modal 
                            show={showAlert} 
                            onHide={() => setShowAlert(false)}
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            >
                              <Modal.Header closeButton>
                                {/* <Modal.Title>Confirm</Modal.Title> */}
                              </Modal.Header>
                              <Modal.Body style={{marginBottom: 30}}>Do you want to add Email ?</Modal.Body>
                              <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowAlert(false)}>
                                  No
                                </Button>
                                <Button variant="primary" onClick={() => handleAddNewAdmin(setAdmins,closePopUp,setUserAdmin,theOffset,thePageLimit,setCurrentAdmins)}>
                                  Yes
                                </Button>
                              </Modal.Footer>
                            </Modal>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      </Accordion>
                  <Table className="table-hover table-striped table-bordered">
                      <thead>
                        <tr>
                        <th className="border-0">
                          <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                            <Form.Check.Label>
                              <Form.Check.Input
                                onChange={toggleAdminsSelection}
                                ref={allRef}
                                // defaultValue={false}
                                value={false}
                                type="checkbox"
                              ></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                          <span>all</span>
                          </th>
                          <th className="border-0">First Name</th>
                          <th className="border-0">Last Name</th>
                          <th className="border-0">Email</th>
                          <th className="border-0">Date Added</th>
    
                          <th className="border-0">
                            <button onClick={()=> setShowDeleteSelectAlert(true)}>Delete Selected Accounts</button>
                           <Modal 
                            show={showDeleteSelectAlert} 
                            onHide={() => setShowDeleteSelectAlert(false)}
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            >
                              <Modal.Header closeButton>
                                {/* <Modal.Title>Confirm</Modal.Title> */}
                              </Modal.Header>
                              <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
                              <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowDeleteSelectAlert(false)}>
                                  No
                                </Button>
                                <Button variant="primary" onClick={() => handleDeleteAdmins(selectedAdmins, setAdmins, closePopUp,theOffset,thePageLimit,setCurrentAdmins)}>
                                  Yes
                                </Button>
                              </Modal.Footer>
                            </Modal>
                          </th>
                        </tr>
                      </thead>
                        {
                          pageNum > 0 ?  renderAllAdmins : renderAllPageAdmins
                        }
                    </Table>
                  </Card.Body>
                  <Card.Footer>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
            <div className={"thePopUp " + (modalShow ? "active" : "")} >
              <div className="thePopUpBody" onClick={onClickBodyPopup}>
              <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
                  <i className="nc-icon nc-simple-remove"></i>
              </div>
              <h2 style={{marginBottom:50}}>Edit Admin</h2>
                <Form.Group>
                  <label>Email</label>
                  <Form.Control
                    // defaultValue={editableAdmin.email}
                    value={editableAdmin.email}
                    placeholder="Email"
                    type="text"
                    onChange={hanldeChangeEmailForeditableAdmin}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <label>First Name</label>
                  <Form.Control
                    // defaultValue={editableAdmin.firstName}
                    value={editableAdmin.firstName}
                    placeholder="First Name"
                    type="text"
                    onChange={hanldeChangeFirstNameForEditableAdmin}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                    <label>Last Name</label>
                    <Form.Control
                        // defaultValue={editableAdmin.lastName}
                        value={editableAdmin.lastName}
                        placeholder="Last Name"
                        type="text"
                        onChange={hanldeChangeLastNameForEditableAdmin}
                    ></Form.Control>
                </Form.Group>
                <Row>
                    <Col>
                    <Button
                        className="btn-fill pull-right"
                        type="submit"
                        variant="info"
                        onClick={()=>{handleEditAdmin(editableAdmin, setAdmins,closeEditPop,theOffset,thePageLimit,setCurrentAdmins)}}
                      >
                        Save Changes
                      </Button>
                    </Col>
                </Row>
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
              totalRecords={totalAdmins}
              pageLimit={10}
              pageNeighbours={1}
              onPageChanged={onPageChanged}
            />
          </div>
        </div>
          </Container>
        </div>
      )
    }
}

export default CreateAdmin
