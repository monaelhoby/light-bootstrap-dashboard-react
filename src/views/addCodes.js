import React, {useState, useRef, useEffect} from "react";
import {
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
  Modal,
  Tabs,
  Tab,
  InputGroup,
  FormControl
} from "react-bootstrap";
import { CSVLink } from "react-csv";


import {db} from '../firebase';
import {handleAddCode, 
        handleDeleteCode, 
        handleDeleteCodes, 
        handleAddCodes, 
        handleEditCode,
        handleEditCodes,
        handleDeleteInactiveCodes,
        handleReactiveCode
      } from './codeActions'
import Pagination from '../components/pagination'
import Loading from '../assets/img/Spin-1s-200px.gif'

function AddCodes() {
    const [showCodePopup, setShowCodePopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEditCodePopup, setShowEditCodePopup] = useState(false);
    const [products, setProducts] = useState([]);
    const [addingNewCode, setAddingNewCode] = useState({});
    const [editingCode, setEditingCode] = useState({});
    const [viewInactiveCode, setViewInactiveCode] = useState({});
    const [codes, setCodes] = useState([]);
    const [searchedVal, setSearchedVal] = useState("");
    const [pageNum, setPageNum] = useState(10);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [selectedInactiveCodes, setSelectedInactiveCodes] = useState([]);
    const [inactiveCodes, setInactiveCodes] = useState([]);
    const [showInactiveCode, setshowInactiveCode] = useState(false);
    const [showDeleteActiveCode, setShowDeleteActiveCode] = useState(false);
    const [deleteCode, setDeleteCode] = useState({})
    const [showDeleteSelectedCodesAlert, setShowDeleteSelectedCodesAlert] = useState(false)
    const [showDeleteSelectedInactiveCodesAlert, setShowDeleteSelectedInactiveCodesAlert] = useState(false)
    const [currentActiveCodes, setCurrentActiveCodes] = useState([]) ;
    const [currentInactiveCodes, setCurrentInactiveCodes] = useState([]) ;
    const [currentPage, setCurrentPage] = useState(null) ;
    const [currentInactivePage, setCurrentInactivePage] = useState(null) ;
    const [totalPages, setTotalPages] = useState(null) ;
    const [totalInactivePages, setTotalInactivePages] = useState(null) ;
    const [inactiveCodesCSV, setInactiveCodesCSV] = useState([]);
    const [activeCodesCSV, setActiveCodesCSV] = useState([]);
    const allRef = useRef()
    const [theOffsetActiveCode, setTheOffsetActiveCode] = useState(null)
    const [thePageLimitActiveCode, setThePageLimitActiveCode] = useState(null)
    const [theOffsetInactiveCode, setTheOffsetInactiveCode] = useState(null)
    const [thePageLimitInactiveCode, setThePageLimitInactiveCode] = useState(null)

    const inactiveHeaders = [
      {label : "Code", key: "code"},
      {label : "Activated By", key: "activated_by"},
      {label : "Date Activated", key: "date_activated"},
      {label : "Place Of Purchase", key: "place_of_purchase"},
    ]

    const activeHeaders = [
      {label : "Code", key: "code"},
      {label : "Product Activated", key: "product_activated"},
      {label : "Date Added", key: "date_added"},
      {label : "Place Of Purchase", key: "place_of_purchase"},
    ]

    useEffect(() => {
      db.collection("products").get().then(snapshot => {
        let allProducts =[];
        snapshot.docs.forEach(product => {
          let productApps = []
          product.data().apps ? product.data().apps.forEach((app) => {
            productApps.push({name : app.name, checked: false})
          }) : null ;
          let featureApps = []
          product.data().features ? product.data().features.forEach((feature) => {
            featureApps.push({name : feature.name, checked: false})
          }) : null ;
          allProducts.push({
            productName : product.data().name,
            checked : false,
            productId : product.id,
            apps : productApps,
            features : featureApps
          })
          // console.log(allProducts)
        })
        setProducts([...allProducts])
    })
    }, [])

    useEffect(() => {
        db.collection("codes").get().then(snapshot => {
            let allCodes =[];
            let theCodes = [];
            snapshot.docs.forEach(code => {
              let Activatedproducts = []
                code.checked=false;
                allCodes.push(code);
                code.data().productActivated.forEach(product => {
                  Activatedproducts.push(">> " + product.name + " => " )
                  Activatedproducts.push( product.features)
                  Activatedproducts.push( product.apps )
                })
                Activatedproducts = Activatedproducts.join(' ')
                theCodes.push({
                  code : code.data().code,
                  product_activated : Activatedproducts,
                  date_added : code.data().dateAdded,
                  place_of_purchase : code.data().purchasedLocation
                })
            })
            setCodes([...allCodes])
            setActiveCodesCSV([...theCodes])
        })
    },[])

     useEffect(() => {
        db.collection("inactiveCodes").get().then(snapshot => {
            let allCodes =[];
            let theCodes = []
            snapshot.docs.forEach(code => {
                code.checked=false;
                allCodes.push(code)
                theCodes.push({
                  code : code.data().inactiveCode,
                  activated_by : code.data().activatedBy,
                  date_activated : code.data().dataAdded,
                  place_of_purchase : code.data().placeOfPurchase
                })
            })
            setInactiveCodes([...allCodes])
            setInactiveCodesCSV([...theCodes])
        })
    },[])

    const csvReportActiveCodes = {
      data: activeCodesCSV,
      headers: activeHeaders,
      filename: 'Active_Codes_Report.csv'
    };

    const csvReportInactiveCodes = {
      data: inactiveCodesCSV,
      headers: inactiveHeaders,
      filename: 'Inactive_Codes_Report.csv'
    };
 
    // change search value
    const handleChangeSearchVal = e =>{
        setSearchedVal(e.target.value)
    }

    const closePopUp = ()=>{
      setShowDeleteActiveCode(false)
      setShowDeleteSelectedCodesAlert(false)
      setShowDeleteSelectedInactiveCodesAlert(false)
    }

  const openDeleteActiveCodeAlert = (code) => {
    setDeleteCode(code)
    setShowDeleteActiveCode(true)
  }

    // handleChangePage
    const handleChangePage = e => {
    setPageNum(Number(e.target.value))
    }

    const toggleCodesSelection = (e)=>{
    let newSelectedCodes = [];
    let newCodes = codes;
    newCodes.forEach(code=>{
        code.checked = e.target.checked;
        if(e.target.checked){
          newSelectedCodes.push(code.id);
        }
    })
    setSelectedCodes([...newSelectedCodes])
    setCodes([...newCodes])
    }

    const toggleInactiveCodeSelection = e => {
      // console.log("wok")
      let newSelectedInactiveCodes = [];
      let newCodes = inactiveCodes;
      newCodes.forEach(code=>{
          code.checked = e.target.checked;
          if(e.target.checked){
            newSelectedInactiveCodes.push(code.id);
          }
      })
      setSelectedInactiveCodes([...newSelectedInactiveCodes])
      setInactiveCodes([...newCodes])
    }

    const handleSelectCode = (e,i,id)=>{
        let newSelectedCodes = selectedCodes;
        let newCodesPage = currentActiveCodes;
        if(e.target.checked){
          newSelectedCodes.push(id);
          newCodesPage[i].checked = true
        }else{
          newCodesPage[i].checked = false
          newSelectedCodes = newSelectedCodes.filter((uid)=>{
            return uid !== id
          })
        }
        setSelectedCodes([...newSelectedCodes])
        let newCodes = codes;
        newCodes[i].checked = e.target.checked
        setCodes([...newCodes])
      }

    const showTheAddPop = ()=>{
        setShowCodePopup(true);
        let addingNewCode = {};
        addingNewCode.prefixCode  = "";
        addingNewCode.lengthCode  = 8;
        addingNewCode.purchasedLocation  = "thoughtcastmagic.com";
        addingNewCode.apps  = [];
        addingNewCode.features = [];
        addingNewCode.products = products;
        addingNewCode.notes  = "";
        setAddingNewCode({...addingNewCode});
    }

    const handleOpenEditPopup = (id, i) => {
      // console.log(codes[i].data().suffixCode)
      setShowEditCodePopup(true)
      let EditingNewCode = {};
      EditingNewCode.id  = id;
      EditingNewCode.code  = codes[i].data().code;
      EditingNewCode.prefixCode  = codes[i].data().prefixCode;
      EditingNewCode.suffixCode  = codes[i].data().suffixCode;
      // EditingNewCode.productActivated  = codes[i].data().productActivated;
      EditingNewCode.products  = codes[i].data().products;
      EditingNewCode.notes  = codes[i].data().notes;
      setEditingCode({...EditingNewCode});
      // {console.log("editingCode",editingCode)}
    }

    const closeAddPop = () => {
        setShowCodePopup(false)
        setShowEditCodePopup(false)
        setshowInactiveCode(false)
        // setshowInactiveCode(false)
    }
    const handleAddingCodeprefix = (e) => {
        let newAddingCode = addingNewCode;
        newAddingCode.prefixCode = e.target.value;
        setAddingNewCode({...addingNewCode});
    }
    const handleAddingCodeLength = (e) => {
        let newAddingCode = addingNewCode;
        newAddingCode.lengthCode = e.target.value;
        setAddingNewCode({...addingNewCode});
    }
    const handleAddingpurchasedLocation = (e) => {
        let newAddingCode = addingNewCode;
        newAddingCode.purchasedLocation = e.target.value;
        setAddingNewCode({...addingNewCode});
    }
    const handleSelectedApps = (e, pIndex, appIndex) => {

      let newAddingCode = addingNewCode;
      newAddingCode.products[pIndex].checked = false;

      if(e.target.checked){
        newAddingCode.products[pIndex].apps[appIndex].checked = true;
      }else{
        newAddingCode.products[pIndex].apps[appIndex].checked = false;
      }

      newAddingCode.products[pIndex].apps.map(app=>{
        if(app.checked){
          newAddingCode.products[pIndex].checked = true;
        }
      })
      newAddingCode.products[pIndex].features.map(feature=>{
        if(feature.checked){
          newAddingCode.products[pIndex].checked = true;
        }
      })
      
      setAddingNewCode({...addingNewCode});
    }
    const handleSelectedFeatures = (e, pIndex, featureIndex) => {
      
      let newAddingCode = addingNewCode;
      newAddingCode.products[pIndex].checked = false;

      if(e.target.checked){
        newAddingCode.products[pIndex].features[featureIndex].checked = true;
      }else{
        newAddingCode.products[pIndex].features[featureIndex].checked = false;
      }

      newAddingCode.products[pIndex].apps.map(app=>{
        if(app.checked){
          newAddingCode.products[pIndex].checked = true;
        }
      })
      newAddingCode.products[pIndex].features.map(feature=>{
        if(feature.checked){
          newAddingCode.products[pIndex].checked = true;
        }
      })
      
      setAddingNewCode({...addingNewCode});
    }
    const handleNotesChange = e => {
      let newAddingCode = addingNewCode;
      newAddingCode.notes = e.target.value;
      setAddingNewCode({...addingNewCode});
    }
    const handleEditingNotesChange = e => {
      let newEditableCode = editingCode;
      newEditableCode.notes = e.target.value
      setEditingCode({...newEditableCode});
    }
    const handleEditingCodeprefix = (e)=>{
      let newEditableCode = editingCode;
      newEditableCode.prefixCode = e.target.value
      setEditingCode({...newEditableCode});
    }
    const handleEditSelectedApps = (e, pIndex, appIndex) => {
      let newEditableCode = editingCode;
        console.log("e.target",e.target.checked)

        newEditableCode.products[pIndex].checked = false;

        if(e.target.checked){
          newEditableCode.products[pIndex].apps[appIndex].checked = true
        }
        else{
          newEditableCode.products[pIndex].apps[appIndex].checked = false
        }
        newEditableCode.products[pIndex].apps.map(app=>{
          if(app.checked){
          newEditableCode.products[pIndex].checked = true;
          }
        })
        newEditableCode.products[pIndex].features.map(feature=>{
          if(feature.checked){
          newEditableCode.products[pIndex].checked = true;
          }
        })


      setEditingCode({...newEditableCode});
    }
  
    const handleEditSelectedFeaturs = (e, pIndex, appIndex) => {
      let newEditableCode = editingCode;
      newEditableCode.products[pIndex].checked = false;

        if(e.target.checked){
          newEditableCode.products[pIndex].features[appIndex].checked = true;
        }else{
          newEditableCode.products[pIndex].features[appIndex].checked = false;
        }

        newEditableCode.products[pIndex].apps.map(app=>{
          if(app.checked){
          newEditableCode.products[pIndex].checked = true;
          }
        })
        newEditableCode.products[pIndex].features.map(feature=>{
          if(feature.checked){
          newEditableCode.products[pIndex].checked = true;
          }
        })

      setEditingCode({...newEditableCode});
    }

    const handleAddingQuantity = e => {
      let newAddingCode = addingNewCode;
      newAddingCode.quantity = e.target.value;
      setAddingNewCode({...addingNewCode});
    }

    const handleOpenViewPopup = (code, i) => {
      // console.log(code.data())
      setshowInactiveCode(true)
       let viewCode = {};
        viewCode.code  = code.data().inactiveCode;
        viewCode.firstName  = code.data().firstName?code.data().firstName : null;
        viewCode.lastName  = code.data().lastName?code.data().lastName : null;
        viewCode.email  = code.data().activatedBy ;
        viewCode.apps  = code.data().productActivated;
        viewCode.products  = code.data().products;
        viewCode.notes  = code.data().notes;
        viewCode.id = code.id;
        viewCode.prefixCode = code.data().prefixCode
        viewCode.placeOfPurchase = code.data().placeOfPurchase;
        viewCode.dataAdded = code.data().dataAdded
        viewCode.suffixCode = code.data().suffixCode
        setViewInactiveCode({...viewCode});
    }

    const handleSelectedInactiveApps = (e, i, id) => {
      let newSelectedCodes = selectedCodes;
      let newInactiveCodes = currentInactiveCodes
      if(e.target.checked){
        newInactiveCodes[i].checked = true
        newSelectedCodes.push(id);
      }else{
        newInactiveCodes[i].checked = false
        newSelectedCodes = newSelectedCodes.filter((uid)=>{
          return uid !== id
        })
      }
      setSelectedInactiveCodes([...newSelectedCodes])
      let newCodes = inactiveCodes;
      newCodes[i].checked = e.target.checked
      setInactiveCodes([...newCodes])
    }

    const onPageChanged = data => {
      setPageNum(0)
      const { currentPage, totalPages, pageLimit } = data;
  
      const offset = (currentPage - 1) * pageLimit;
      const currentActiveCodes = codes.slice(offset, offset + pageLimit);

      // console.log("data", data, "offset", offset, "currentInactiveCodes", currentInactiveCodes)
      setTheOffsetActiveCode(offset)
      setThePageLimitActiveCode(pageLimit)

      setCurrentPage(currentPage)
      setCurrentActiveCodes(currentActiveCodes)
      setTotalPages(totalPages)
    };

    const totalActiveCodes = codes.length;
    // if (totalActiveCodes ===0) return null;

    const onPageChangedInactive = data => {
      setPageNum(0)
      const { currentPage, totalPages, pageLimit } = data;
  
      const offset = (currentPage - 1) * pageLimit;
      const currentInactiveCodes = inactiveCodes.slice(offset, offset + pageLimit);
  
      setTheOffsetInactiveCode(offset)
      setThePageLimitInactiveCode(pageLimit)

      setCurrentInactivePage(currentPage)
      setCurrentInactiveCodes(currentInactiveCodes)
      setTotalInactivePages(totalPages)
    };

    const LoadingSection = () => (
      <div className="loadingPage">
        <img src={Loading}/>
      </div>
    )
   
    if(loading){
      return <LoadingSection/>
    }

    const totalInactiveCodes = inactiveCodes.length;
    // if (totalInactiveCodes === 0) return null;

    let productApps = null;
    productApps = products.map((p,i) => {
        return (
            <Col md="3" key={i}>
                <p style={{marginTop: 20}}>{p.productName}: </p>
                <div>
                  {
                    p.apps.map((app,j) => {
                        return (<div style={{display: "flex"}} key={j}>
                        <Form.Check className="mb-1 pl-0" >
                        <Form.Check.Label>
                            <Form.Check.Input
                            onChange={(e)=> handleSelectedApps(e, i,j)}
                            checked={app.checked}
                            defaultValue={false}
                            type="checkbox"
                            ></Form.Check.Input>
                            <span className="form-check-sign"></span>
                            </Form.Check.Label>
                        </Form.Check>
                        <span style={{display: "inline-block", marginTop: 15}}>{app.name}</span>
                        </div>)
                    })
                  }
                </div>
                <div>
                  {
                    p.features.map((feature,k) => {
                        return (<div style={{display: "flex"}} key={k}>
                        <Form.Check className="mb-1 pl-0" >
                        <Form.Check.Label>
                            <Form.Check.Input
                            onChange={(e)=> handleSelectedFeatures(e, i, k)}
                            checked={feature.checked}
                            defaultValue={false}
                            type="checkbox"
                            ></Form.Check.Input>
                            <span className="form-check-sign"></span>
                            </Form.Check.Label>
                        </Form.Check>
                        <span style={{display: "inline-block", marginTop: 15}}>{feature.name}</span>
                        </div>)
                    })
                  }
                </div>
            </Col>
        )
    });

    let renderActiveCodes = null;
    renderActiveCodes = codes.map((code,i) => {
      
      if(!codes.length){
            return;
        }
        if(i == pageNum){
        return ;
        }
      if(code.data().code.includes(searchedVal)){
        if(i < pageNum){
        return (
          <tr key={i}>
            <td>
          <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
              <Form.Check.Input
                  onChange={(e)=> handleSelectCode(e,i,code.id)}
                  checked={code.checked}
                  defaultValue={false}
                  type="checkbox"
              ></Form.Check.Input>
              <span className="form-check-sign"></span>
              </Form.Check.Label>
          </Form.Check>
          </td>
            <td>
              {code.data().code}
            </td>
            <td>{
              code.data().productActivated ? code.data().productActivated.map((product, i)=>{
                return(<div key={i}>
                  <strong>{product.name} =></strong>
                  <div>
                  {
                    product.apps ? product.apps.map((app, k) => {
                      return (<span key={k}>{app}, </span>)
                    }):null
                  }
                  </div>
                  <div>
                  {
                    product.features ? product.features.map((feature, k) => {
                      return (<span key={k}>{feature}, </span>)
                    }):null
                  }
                  </div>
                  </div>
                )
              }):null
              }</td>
            <td>{code.data().dateAdded}</td>
            <td>{code.data().purchasedLocation}</td>
            <td>
                <OverlayTrigger overlay={<Tooltip id="tooltip-422471719">Edit Task..</Tooltip>}>
                <Button className="btn-simple btn-link p-1"
                    type="button" variant="info"
                    onClick = {() => handleOpenEditPopup(code.id, i)}
                ><i className="fas fa-edit"></i> </Button>
                </OverlayTrigger>
                <OverlayTrigger
                overlay={<Tooltip id="tooltip-829164576">Remove..</Tooltip>}>
                <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                    onClick = {() => openDeleteActiveCodeAlert(code)}
                ><i className="fas fa-times"></i>
                </Button>
                </OverlayTrigger>
                <Modal 
                show={showDeleteActiveCode} 
                onHide={() => setShowDeleteActiveCode(false)}
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
                  <Button variant="primary" onClick={()=>handleDeleteCode(deleteCode,setCodes,closePopUp,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)}>
                    Yes
                  </Button>
                </Modal.Footer>
              </Modal>
            </td>
          </tr>
        )}
      }
    })

    let renderActiveCodesPage = null;
    renderActiveCodesPage = currentActiveCodes.map((code,i) => {
      
      if(!codes.length){
            return;
        }
        
        if(code.data().code.includes(searchedVal)){
        
        return (
          <tr key={i}>
            <td>
          <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
              <Form.Check.Input
                onChange={(e)=> handleSelectCode(e,i,code.id)}
                checked={code.checked}
                defaultValue={false}
                type="checkbox"
              ></Form.Check.Input>
              <span className="form-check-sign"></span>
              </Form.Check.Label>
          </Form.Check>
          </td>
            <td>
              {code.data().code}
            </td>
            <td>{
              code.data().productActivated ? code.data().productActivated.map((product, i)=>{
                return(<div key={i}>
                  <strong>{product.name} =></strong>
                  <div>
                  {
                    product.apps ? product.apps.map((app, k) => {
                      return (<span key={k}>{app}, </span>)
                    }):null
                  }
                  </div>
                  <div>
                  {
                    product.features ? product.features.map((feature, k) => {
                      return (<span key={k}>{feature}, </span>)
                    }):null
                  }
                  </div>
                  </div>
                )
              }):null
              }</td>
            <td>{code.data().dateAdded}</td>
            <td>{code.data().purchasedLocation}</td>
            <td>
                <OverlayTrigger overlay={<Tooltip id="tooltip-422471719">Edit Task..</Tooltip>}>
                <Button className="btn-simple btn-link p-1"
                    type="button" variant="info"
                    onClick = {() => handleOpenEditPopup(code.id, i)}
                ><i className="fas fa-edit"></i> </Button>
                </OverlayTrigger>
                <OverlayTrigger
                overlay={<Tooltip id="tooltip-829164576">Remove..</Tooltip>}>
                <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                    onClick = {() => openDeleteActiveCodeAlert(code)}
                ><i className="fas fa-times"></i>
                </Button>
                </OverlayTrigger>
                <Modal 
                show={showDeleteActiveCode} 
                onHide={() => setShowDeleteActiveCode(false)}
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
                  <Button variant="primary" onClick={()=>handleDeleteCode(deleteCode,setCodes,closePopUp,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)}>
                    Yes
                  </Button>
                </Modal.Footer>
              </Modal>
            </td>
          </tr>
        )}
    })

    let renderInactiveCodes = null;
    renderInactiveCodes = inactiveCodes.map((code,i) => {
      // {console.log(pageNum)}
      if(!inactiveCodes.length){
          return;
      }
      if(i == pageNum){
        return ;
      }
      if(code.data().inactiveCode.includes(searchedVal)){
      if(i < pageNum){
          return (
          <tr key={i}>
          <td>
          <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
              <Form.Check.Input
                onChange={(e)=> handleSelectedInactiveApps(e,i,code.id)}
                checked={code.checked}
                defaultValue={false}
                type="checkbox"
              ></Form.Check.Input>
              <span className="form-check-sign"></span>
              </Form.Check.Label>
          </Form.Check>
          </td>
            <td>{code.data().inactiveCode}</td>
            <td>{code.data().activatedBy}</td>
            <td>{code.data().dataAdded}</td>
            <td>{code.data().placeOfPurchase}</td>
            <td>
                <OverlayTrigger overlay={<Tooltip id="tooltip-422471719">View Task..</Tooltip>}>
                <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                    onClick = {() => handleOpenViewPopup(code, i)}
                >View</Button>
                </OverlayTrigger>
            </td>
          </tr>
        )
      }
    }
    })

    
    let renderInactiveCodesPage = null;
    renderInactiveCodesPage = currentInactiveCodes.map((code,i) => {
      // {console.log(code.data())}   
      if(code.data().inactiveCode.includes(searchedVal)){
          return (
          <tr key={i}>
          <td>
          <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
              <Form.Check.Input
                onChange={(e)=> handleSelectedInactiveApps(e,i,code.id)}
                checked={code.checked}
                defaultValue={false}
                type="checkbox"
              ></Form.Check.Input>
              <span className="form-check-sign"></span>
              </Form.Check.Label>
          </Form.Check>
          </td>
            <td>{code.data().inactiveCode}</td>
            <td>{code.data().activatedBy}</td>
            <td>{code.data().dataAdded}</td>
            <td>{code.data().placeOfPurchase}</td>
            <td>
                <OverlayTrigger overlay={<Tooltip id="tooltip-422471719">View Task..</Tooltip>}>
                <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                    onClick = {() => handleOpenViewPopup(code, i)}
                >View</Button>
                </OverlayTrigger>
            </td>
          </tr>
        )
     }
    })

    const ActiveTable = (<Table className="table-hover table-striped">
      <thead>
        <tr>
          <th className="border-0">
            <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                <Form.Check.Label>
                  <Form.Check.Input
                    onChange={toggleCodesSelection}
                    ref={allRef}
                    defaultValue="x"
                    type="checkbox"
                  ></Form.Check.Input>
                  <span className="form-check-sign"></span>
                </Form.Check.Label>
              </Form.Check>
              <span>all</span>
            </th>
          <th className="border-0">Code</th>
          <th className="border-0">Product Activated</th>
          <th className="border-0">Date Added</th>
          <th className="border-0">Place Of Purchase</th>
          <th className="border-0">
            <button onClick={showTheAddPop}>Add Code</button><br/>
            <button onClick={() => setShowDeleteSelectedCodesAlert(true)}>Delete Selected Codes</button><br/>
            <button>
            <CSVLink {...csvReportActiveCodes} style={{color : "#000"}}>Export Codes to CSV</CSVLink>
            </button><br/>
            <Modal 
              show={showDeleteSelectedCodesAlert} 
              onHide={() => setShowDeleteSelectedCodesAlert(false)}
              aria-labelledby="contained-modal-title-vcenter"
              centered
              >
              <Modal.Header closeButton>
                {/* <Modal.Title>Confirm</Modal.Title> */}
              </Modal.Header>
              <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteSelectedCodesAlert(false)}>
                  No
                </Button>
                <Button variant="primary" onClick={()=> handleDeleteCodes(selectedCodes, setCodes, closePopUp,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)}>
                  Yes
                </Button>
              </Modal.Footer>
            </Modal>
          </th>
        </tr>
      </thead>
      <tbody>
      {pageNum > 0 ? renderActiveCodes : renderActiveCodesPage}
      {/* {renderActiveCodes} */}
      </tbody>
    </Table>
    )

    const ActivePagination = (<div className="w-100 px-4 py-5 d-flex flex-row flex-wrap align-items-center justify-content-between">
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
          totalRecords={totalActiveCodes}
          pageLimit={pageNum}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
        />
      </div>
    </div>
    )

    const InactiveTable = (<Table className="table-hover table-striped">
    <thead>
      <tr>
        <th className="border-0">
          <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
              <Form.Check.Label>
                <Form.Check.Input
                  onChange={toggleInactiveCodeSelection}
                  ref={allRef}
                  defaultValue="x"
                  type="checkbox"
                ></Form.Check.Input>
                <span className="form-check-sign"></span>
              </Form.Check.Label>
            </Form.Check>
            <span>all</span>
          </th>
        <th className="border-0">Code</th>
        <th className="border-0">Activated By</th>
        <th className="border-0">Date Activated</th>
        <th className="border-0">Place Of Purchase</th>
        <th className="border-0">
          {/* <button onClick={showTheAddPop}>Add Code</button> */}
          <button onClick={() => setShowDeleteSelectedInactiveCodesAlert(true)}>Delete Selected Codes</button>
          <button>
          <CSVLink {...csvReportInactiveCodes} style={{color : "#000"}}>Export Codes to CSV</CSVLink>
          </button><br/>
          <Modal 
            show={showDeleteSelectedInactiveCodesAlert} 
            onHide={() => setShowDeleteSelectedInactiveCodesAlert(false)}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
            <Modal.Header closeButton>
              {/* <Modal.Title>Confirm</Modal.Title> */}
            </Modal.Header>
            <Modal.Body style={{marginBottom: 30}}>Are You Sure ?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteSelectedInactiveCodesAlert(false)}>
                No
              </Button>
              <Button variant="primary" onClick={()=> handleDeleteInactiveCodes(selectedInactiveCodes, setInactiveCodes,closePopUp,theOffsetInactiveCode,thePageLimitInactiveCode,setCurrentInactiveCodes)}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        </th>
      </tr>
    </thead>
    <tbody>
    {pageNum > 0 ? renderInactiveCodes : renderInactiveCodesPage}
    {/* {renderInactiveCodes} */}
    </tbody>
  </Table>
    )

    const InactivePagination = (<div className="w-100 px-4 py-5 d-flex flex-row flex-wrap align-items-center justify-content-between">
    <div className="d-flex flex-row align-items-center">
      {currentInactivePage && (
        <span className="current-page d-inline-block h-100 pl-4 text-secondary">
          Page <span className="font-weight-bold">{currentInactivePage}</span> /{" "}
          <span className="font-weight-bold">{totalInactivePages}</span>
        </span>
      )}
    </div>
    <div className="d-flex flex-row py-4 align-items-center">
      <Pagination
        totalRecords={totalInactiveCodes}
        pageLimit={pageNum}
        pageNeighbours={1}
        onPageChanged={onPageChangedInactive}
      />
    </div>
  </div>)

    const AddInactiveCode = (
      <div className={"thePopUp " + (showCodePopup ? "active" : "")} >
        <div className="thePopUpBody" style={{maxWidth: "770px "}}>
              <div className="font-icon-detail closePopUp" onClick={closeAddPop}>
              <i className="nc-icon nc-simple-remove"></i>
              </div>
              <h2 style={{marginBottom:50}}>Add Code</h2>
          <Tabs defaultActiveKey="SingleCode" id="uncontrolled-tab-example">
            <Tab eventKey="SingleCode" title="Single Code" style={{paddingTop: 40}}>
              <Form.Group>
              <Row>
                  <Col md="4"><Row><Col xs="auto"><label>Code prefix: </label></Col>
              <Col>
              <Form.Control
                      defaultValue={addingNewCode.prefixCode }
                      value={addingNewCode.prefixCode }
                      type="text"
                      onChange={handleAddingCodeprefix}
                  ></Form.Control></Col></Row></Col>
                  <Col md="4">
                  <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="secondary"
                      onClick={()=> console.log("Add Code")}
                  >
                      Generate Random Code
                  </Button>
                  </Col>
                  <Col md="4">
                  <Row><Col xs="auto"><label>Code Length: </label></Col>
              <Col>
              <Form.Control
                      defaultValue={addingNewCode.lengthCode}
                      value={addingNewCode.lengthCode}
                      type="number"
                      onChange={handleAddingCodeLength}
                  ></Form.Control></Col></Row>
                  </Col>
              </Row>
              </Form.Group>
              <Form.Group>
          <Row>
              <Col xs="auto"><label>Purchased Location: </label></Col>
              <Col xs="auto"><Form.Control
                      defaultValue={addingNewCode.purchasedLocation}
                      value={addingNewCode.purchasedLocation}
                      placeholder="Add Purchased Location"
                      type="text"
                      onChange={handleAddingpurchasedLocation}
                  ></Form.Control></Col>
              </Row>
              </Form.Group>
              <hr />
              <h5>Products To Activate</h5>
              <Row>{productApps }</Row>
              <hr style={{marginTop: 30}}/>
              <Row>
              <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Notes: </Form.Label>
                  <Form.Control as="textarea" rows={3} defaultValue={addingNewCode.notes} value={addingNewCode.notes} onChange={handleNotesChange}/>
              </Form.Group>
              </Col>
              </Row>
              <Row>
                <Col>
                <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="info"
                    onClick={() => handleAddCode(addingNewCode, setCodes,closeAddPop,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)}
                  >
                    Add Code
                  </Button>
                </Col>
            </Row>
            </Tab>
          <Tab eventKey="BulkCode" title="Bulk Code" style={{paddingTop: 40}}>
          <Form.Group>
              <Row>
                  <Col md="6"><Row><Col xs="auto"><label>Code prefix: </label></Col>
              <Col>
              <Form.Control
                      defaultValue={addingNewCode.prefixCode }
                      value={addingNewCode.prefixCode }
                      type="text"
                      onChange={handleAddingCodeprefix}
                  ></Form.Control></Col></Row></Col>
                  <Col md="6">
                  <Row><Col xs="auto"><label>Code Length: </label></Col>
              <Col>
              <Form.Control
                      defaultValue={addingNewCode.lengthCode}
                      value={addingNewCode.lengthCode}
                      type="number"
                      onChange={handleAddingCodeLength}
                  ></Form.Control></Col></Row>
                  </Col>
              </Row>
              </Form.Group>
              <Form.Group>
              <Row>
                  <Col md="6"><Row><Col xs="auto"><label>Code Quantity: </label></Col>
              <Col>
              <Form.Control
                  defaultValue={addingNewCode.quantity }
                  value={addingNewCode.quantity }
                  type="number"
                  onChange={handleAddingQuantity}
                ></Form.Control></Col></Row></Col>
                <Col md="6">
                <Row><Col xs="auto"><label>Purchased Location: </label></Col>
              <Col>
              <Form.Control
                      defaultValue={addingNewCode.purchasedLocation}
                      value={addingNewCode.purchasedLocation}
                      type="text"
                      onChange={handleAddingpurchasedLocation}
                  ></Form.Control></Col></Row>
                  </Col>
              </Row>
              </Form.Group>
              <hr />
              <h5>Products To Activate</h5>
              <Row>{productApps }</Row>
              <hr style={{marginTop: 30}}/>
              <Row>
              <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Notes: </Form.Label>
                  <Form.Control as="textarea" rows={3} defaultValue={addingNewCode.notes} value={addingNewCode.notes} onChange={handleNotesChange}/>
              </Form.Group>
              </Col>
              </Row>
              <Row>
                <Col>
                <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="info"
                    onClick={() => handleAddCodes(addingNewCode, setCodes,setShowCodePopup,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes, setLoading)}
                  >
                    Add Codes
                  </Button>
                </Col>
            </Row>
          </Tab>
          </Tabs>
        </div>
      </div>)
 
    const EditCode = (<div className={"thePopUp " + (showEditCodePopup ? "active" : "")} >
      <div className="thePopUpBody" style={{maxWidth: "770px "}}>
        <div className="font-icon-detail closePopUp" onClick={closeAddPop}>
        <i className="nc-icon nc-simple-remove"></i>
        </div>
        <h2 style={{marginBottom:50}}>Edit Code</h2>
        {
          Array.isArray(editingCode.code) ? null : <Form.Group><Row>
          <Col xs="auto"><label>Code prefix: </label></Col>
          <Col xs="auto">
          <Form.Control defaultValue={editingCode.prefixCode } value={editingCode.prefixCode } type="text" onChange={handleEditingCodeprefix}
              ></Form.Control></Col>
          </Row></Form.Group>
        }
        <hr />
        <h5>Products To Activate</h5>
        <Row>
          {
            editingCode.products ? editingCode.products.map((p,i) => {
              return (
              <Col md="3" key={i}>
                <p style={{marginTop: 20}}>{p.productName}: </p>
                {
                  p.apps.map((app, j) => {
                    return (<div style={{display: "flex"}} key={j}>
                    <Form.Check className="mb-1 pl-0" >
                    <Form.Check.Label>
                        <Form.Check.Input
                        onChange={(e)=> handleEditSelectedApps(e,i,j)}
                        checked={app.checked}
                        defaultValue={false}
                        type="checkbox"
                        ></Form.Check.Input>
                        <span className="form-check-sign"></span>
                        </Form.Check.Label>
                    </Form.Check>
                    <span style={{display: "inline-block", marginTop: 15}}>{app.name}</span>
                    </div>)
                  })
                }
                {
                  p.features.map((feature, k) => {
                    return (<div style={{display: "flex"}} key={k}>
                    <Form.Check className="mb-1 pl-0" >
                    <Form.Check.Label>
                        <Form.Check.Input
                        onChange={(e)=> handleEditSelectedFeaturs(e,i,k)}
                        checked={feature.checked}
                        defaultValue={false}
                        type="checkbox"
                        ></Form.Check.Input>
                        <span className="form-check-sign"></span>
                        </Form.Check.Label>
                    </Form.Check>
                    <span style={{display: "inline-block", marginTop: 15}}>{feature.name}</span>
                    </div>)
                  })
                }
              </Col>
            )
            }) : null
          }
        </Row>
        <hr style={{marginTop: 30}}/>
        <Row>
        <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
        <Form.Label>Notes: </Form.Label>
            <Form.Control as="textarea" rows={3} defaultValue={editingCode.notes} value={editingCode.notes} onChange={handleEditingNotesChange}/>
        </Form.Group>
        </Col>
        </Row>
        <Row>
        <Col>
        {
          Array.isArray(editingCode.code)?<Button className="btn-fill pull-right"
              type="submit" variant="info" onClick={() => handleEditCodes(editingCode, setCodes,closeAddPop)}
            >Save Changes</Button>:<Button className="btn-fill pull-right" type="submit" variant="info" onClick={() => handleEditCode(editingCode, setCodes,closeAddPop,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)}
              >Save Changes</Button>
        }
        </Col>
        </Row>
      </div>
      </div>)
 
    const ShowInactiveCode = (<div className={"thePopUp " + (showInactiveCode ? "active" : "")} >
    <div className="thePopUpBody" style={{maxWidth: "770px "}}>
          <div className="font-icon-detail closePopUp" onClick={closeAddPop}> 
          <i className="nc-icon nc-simple-remove"></i>
          </div>
          <h2 style={{marginBottom:50}}>View Inactive Code</h2>
          <h5><strong>Code: </strong>{viewInactiveCode.code}</h5>
          <h5><strong>First Name: </strong>{viewInactiveCode.firstName}</h5>
          <h5><strong>Last Name: </strong>{viewInactiveCode.lastName}</h5>
          <h5><strong>Email: </strong>{viewInactiveCode.email}</h5>
          <strong>Products To Activate</strong>
          <Row style ={{marginBottom : 30}}>
            {
              viewInactiveCode.products ? viewInactiveCode.products.map((product,i) => {
                return (<Col md="3" key={i}>
                  <strong>{product.productName} : </strong>
                    {
                      product.apps ? product.apps.map((app,j) => {
                        return(<div style={{display: "flex"}} key={j}>
                          <Form.Check className="mb-1 pl-0" >
                          <Form.Check.Label>
                            <Form.Check.Input
                            // onChange={(e)=> handleEditSelectedApps(e, product.productName, app.name)}
                            disabled={true}
                            checked={app.checked}
                            defaultValue={false}
                            type="checkbox"
                            ></Form.Check.Input>
                            <span className="form-check-sign"></span>
                          </Form.Check.Label>
                          </Form.Check>
                          <span style={{display:"inline-block", marginTop: 15}}>{app.name}</span>
                          </div>)
                      }) : null
                    } 
                    {
                      product.features ? product.features.map((feature,j) => {
                        return(<div style={{display: "flex"}} key={j}>
                          <Form.Check className="mb-1 pl-0" >
                          <Form.Check.Label>
                            <Form.Check.Input
                            // onChange={(e)=> handleEditSelectedApps(e, product.productName, feature.name)}
                            disabled={true}
                            checked={feature.checked}
                            defaultValue={false}
                            type="checkbox"
                            ></Form.Check.Input>
                            <span className="form-check-sign"></span>
                          </Form.Check.Label>
                          </Form.Check>
                          <span style={{display:"inline-block", marginTop: 15}}>{feature.name}</span>
                      </div>)
                      }) : null
                    } 
                </Col>)
              }) : null
            }
          </Row>
          <hr style={{marginTop: 30}}/>
          <Row>
          <Col xs="12"><Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Notes: </Form.Label>
              <Form.Control as="textarea" rows={3} disabled={true}/>
          </Form.Group>
          </Col>
          </Row>
      <Row>
      <Col>
      <Button className="btn-fill pull-right" type="submit" variant="info" 
      onClick={() => handleReactiveCode(viewInactiveCode, setInactiveCodes,closeAddPop,theOffsetInactiveCode,thePageLimitInactiveCode,setCurrentInactiveCodes)}>Reactive</Button>
      <Button className="btn-fill pull-right" type="submit" variant="info" 
      onClick={closeAddPop}>Cancel</Button>
      </Col>
  </Row>
    </div>
  </div>)         

 if (totalActiveCodes === 0 ){
    return (
      <>
        <Container fluid>
          <Row>
            <Col md="12">
              <Card className="strpied-tabled-with-hover table-bordered">
                <Card.Header>
                  <Card.Title as="h4">Codes</Card.Title>
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
                    <span>Codes Per Page : </span>
                    <select  onChange={e => handleChangePage(e)}>
                      {/* <option vlaue="5">5</option> */}
                      <option vlaue="10">10</option>
                      <option vlaue="15">15</option>
                      <option vlaue="20">20</option>
                      <option vlaue="25">25</option>
                    </select>
                  </div>
                  <Tabs defaultActiveKey="activateCode" id="uncontrolled-tab-example">
                    <Tab eventKey="activateCode" title="Active" style={{paddingTop:50}}>
                    {ActiveTable}
                    </Tab>
                    <Tab eventKey="inActivateCode" title="Inactive" style={{paddingTop:50}}>
                    {InactiveTable}
                    {/* {InactivePagination} */}
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
            {AddInactiveCode}
            {EditCode}
            {ShowInactiveCode}
        </Container>
      </>
    )}else if(totalInactiveCodes === 0 ){
      return (
        <>
          <Container fluid>
            <Row>
              <Col md="12">
                <Card className="strpied-tabled-with-hover table-bordered">
                  <Card.Header>
                    <Card.Title as="h4">Codes</Card.Title>
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
                      <span>Codes Per Page : </span>
                      <select  onChange={e => handleChangePage(e)}>
                        {/* <option vlaue="5">5</option> */}
                        <option vlaue="10">10</option>
                        <option vlaue="15">15</option>
                        <option vlaue="20">20</option>
                        <option vlaue="25">25</option>
                      </select>
                    </div>
                    <Tabs defaultActiveKey="activateCode" id="uncontrolled-tab-example">
                      <Tab eventKey="activateCode" title="Active" style={{paddingTop:50}}>
                      {ActiveTable}
                      {ActivePagination}
                      </Tab>
                      <Tab eventKey="inActivateCode" title="Inactive" style={{paddingTop:50}}>
                      {InactiveTable}
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
              {AddInactiveCode}
              {EditCode}
              {ShowInactiveCode}
          </Container>
        </>
      )}else {
    return (
      <>
        <Container fluid>
          <Row>
            <Col md="12">
              <Card className="strpied-tabled-with-hover table-bordered">
                <Card.Header>
                  <Card.Title as="h4">Codes</Card.Title>
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
                    <span>Codes Per Page : </span>
                    <select  onChange={e => handleChangePage(e)}>
                      {/* <option vlaue="5">5</option> */}
                      <option vlaue="10">10</option>
                      <option vlaue="15">15</option>
                      <option vlaue="20">20</option>
                      <option vlaue="25">25</option>
                    </select>
                  </div>
                  <Tabs defaultActiveKey="activateCode" id="uncontrolled-tab-example">
                    <Tab eventKey="activateCode" title="Active" style={{paddingTop:50}}>
                    {ActiveTable}
                    {ActivePagination}
                    </Tab>
                    <Tab eventKey="inActivateCode" title="Inactive" style={{paddingTop:50}}>
                    {InactiveTable}
                    {InactivePagination}
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
            {AddInactiveCode}
            {EditCode}
            {ShowInactiveCode}
        </Container>
      </>
  )};

}

export default AddCodes;
