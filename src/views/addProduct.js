import React, { useEffect, useState, useRef }   from "react";
import {db, storage} from '../firebase';
import {
    Card,
    Table,
    Container,
    Row,
    Col,
    Form,
    OverlayTrigger,
    Tooltip,
    Button, 
    Modal
  } from "react-bootstrap";

  import {handleDeleteProduct,handleEditProduct, handleAddNewProduct, handleDeleteProducts} from './ProductsActions';
  import Pagination from '../components/pagination'



// react-bootstrap components

const addProduct = ()=>{
  const allRef = useRef();
  const [products,setProducts] = useState([]);
  const [showEditPop,setShowEditPop] = useState(false);
  const [showAddPop,setShowAddPop] = useState(false);
  const [editableProduct,setEditableProduct] = useState({});
  const [addingNewProduct,setAddingNewProduct] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([])
  const [createAppComponent, setCreateAppComponent] = useState([]);
  const [createFeatureComponent, setCreateFeatureComponent] = useState([]);
  const [showDeleteSelectedAlert, setShowDeleteSelectedAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productIcon, setProductIcon] = useState(null);
  const [appIcon, setAppIcon] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState({})
  const [currentProducts, setCurrentProducts] = useState([]) ;
  const [currentPage, setCurrentPage] = useState(null) ;
  const [totalPages, setTotalPages] = useState(null) ;
  const [theOffset, setTheOffset] = useState(null)
  const [thePageLimit, setThePageLimit] = useState(null)

    
    useEffect(() => {
        db.collection("products").get()
            .then(snapshot=>{
              let products = [];
              snapshot.docs.forEach(product=>{
                product.checked = false;
                products.push(product);
              })
            setProducts([...products]);
        })
    }, [])

  const handleUplaodproductIcon=  () => {
    // async magic goes here...
    if(productIcon=== '') {
      console.error(`not an icon, the productIconfile is a ${typeof(productIcon)}`)
    }
    // const abortController = new AbortController()
    // const signal = abortController.signal
    const uploadTask = storage.ref(`/productIcons/${productIcon.name}`).put(productIcon)
    //initiates the firebase side uploading 
    uploadTask.on('state_changed', 
    () => {
      // gets the functions from storage refences the productIconstorage in firebase by the children
      // gets the download url then sets the productIconfrom firebase as the value for the imgUrl key:
      storage.ref('productIcons').child(productIcon.name).getDownloadURL()
      .then(fireBaseUrl => {
        let newAddingProduct = addingNewProduct;
        newAddingProduct.productIcon = fireBaseUrl
        setAddingNewProduct({...newAddingProduct})
      })
    })
   }

   const handleEditUplaodproductIcon = () => {
    if(productIcon=== '') {
      console.error(`not an icon, the productIconfile is a ${typeof(productIcon)}`)
    }
    const uploadTask = storage.ref(`/productIcons/${productIcon.name}`).put(productIcon)
    uploadTask.on('state_changed', 
    () => {
      storage.ref('productIcons').child(productIcon.name).getDownloadURL()
      .then(fireBaseUrl => {
        // console.log(fireBaseUrl)
        let newEditableProduct = editableProduct;
        newEditableProduct.productIcon = fireBaseUrl
        setEditableProduct({...newEditableProduct})
      })
    })
   }
 
   const handelChangeproductIcon= e => {
     if (e.target.files[0]) {
       const productIcon= e.target.files[0];
       setProductIcon(productIcon);
     }
   }

   const handleUplaodAppIcon=  (appIndex) => {
    if(appIcon === '') {
      console.error(`not an icon, the productIconfile is a ${typeof(appIcon)}`)
    }
    const uploadTask = storage.ref(`/appIcons/${appIcon.name}`).put(appIcon)
    //initiates the firebase side uploading 
    uploadTask.on('state_changed', 
    () => {
      storage.ref('appIcons').child(appIcon.name).getDownloadURL()
      .then(fireBaseUrl => {

        let newCreateAppComponent = createAppComponent;
        newCreateAppComponent[appIndex].appIcon=fireBaseUrl;
        setCreateAppComponent([...newCreateAppComponent]);
        setAddingNewProduct({...createAppComponent});
        let newAddingProduct = addingNewProduct;
        newAddingProduct.apps = createAppComponent;
        setAddingNewProduct({...newAddingProduct})
      })
    })
   }

   const handleUplaodEditAppIcon = (appIndex) => {
    if(appIcon === '') {
      console.error(`not an icon, the product Icon file is a ${typeof(appIcon)}`)
    }
    const uploadTask = storage.ref(`/appIcons/${appIcon.name}`).put(appIcon)
    //initiates the firebase side uploading 
    uploadTask.on('state_changed', 
    () => {
      storage.ref('appIcons').child(appIcon.name).getDownloadURL()
      .then(fireBaseUrl => {

      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps[appIndex].appIcon=fireBaseUrl;
      newEditingNewProduct.apps = apps
      setEditableProduct({...newEditingNewProduct});
      })
    })
   }
 
   const handelChangeAppIcon= e => {
     if (e.target.files[0]) {
       const appIcon= e.target.files[0];
       setAppIcon(appIcon);
     }
   }

    const handleSelectProduct = (e,i,id)=>{
      // console.log(e.target.value)
      let newSelectedProducts = selectedProducts;
      let newProducts = products;
      let newPageProducts = currentProducts
      if(e.target.checked){
        newSelectedProducts.push(id);
        newProducts[i].checked = true
        newPageProducts[i].checked = true
      }else{
        newProducts[i].checked = false
        newPageProducts[i].checked = false
        newSelectedProducts = newSelectedProducts.filter((uid)=>{
          return uid !== id
        })
      }
      setSelectedProducts([...newSelectedProducts])
      setProducts([...newProducts])
      setCurrentProducts([...newPageProducts])
    }
  
    const toggleProductsSelection = (e)=>{
      let newSelectedProducts = [];
      let newProducts = products;
      newProducts.forEach(product=>{
        product.checked = e.target.checked;
        if(e.target.checked){
          newSelectedProducts.push(product.id);
        }
      })
      setSelectedProducts([...newSelectedProducts])
      setProducts([...newProducts])
    }

    const handleOpenDeletePopup = (product) => {
      setDeleteProduct(product)
      setShowDeleteAlert(true)
    }

    const closeEditPop = ()=>{
        setShowEditPop(false);
        setShowDeleteSelectedAlert(false);
        setShowDeleteAlert(false)
    }

    const closeAddPop = ()=>{
        setShowAddPop(false);
    }

    const showTheAddPop = ()=>{
        // setAddingNewProduct({});
        setShowAddPop(true);
        let addingNewProduct = {};
        addingNewProduct.name  = "";
        addingNewProduct.description  = "";
        addingNewProduct.visibility  = false;
        addingNewProduct.unpurchasedUrl  = "";
        addingNewProduct.purchasedUrl  = "";
        addingNewProduct.productIcon  = null;
        addingNewProduct.apps  = [{name:"", activeUrl:"", inActiveUrl: "", tag: "", appIcon: null}];
        addingNewProduct.features  = [{name:"", activeUrl:"", inActiveUrl: "", tag: ""}];
        // console.log("this is adding new product",addingNewProduct)
        setAddingNewProduct({...addingNewProduct});
        setCreateAppComponent([...addingNewProduct.apps])
        setCreateFeatureComponent([...addingNewProduct.features])
    }

    const resetEditableProduct = (pid,i)=>{
        let newEditableProduct = {};
        newEditableProduct.id = pid;
        newEditableProduct.name  = products[i].data().name;
        newEditableProduct.productIcon  = products[i].data().productIcon;
        newEditableProduct.apps  = products[i].data().apps == null ? [] : products[i].data().apps;
        newEditableProduct.features  = products[i].data().features == null ? [] : products[i].data().features;
        newEditableProduct.visibility  = products[i].data().visibility;
        newEditableProduct.unpurchasedUrl  = products[i].data().unpurchasedUrl;
        newEditableProduct.purchasedUrl = products[i].data().purchasedUrl;
        newEditableProduct.description = products[i].data().description
        newEditableProduct.index = i;
        setEditableProduct({...newEditableProduct});
        setShowEditPop(true)
    }

  const handleEditableNameChange = (e)=>{
      let newEditableProduct = editableProduct
      newEditableProduct.name = e.target.value
      setEditableProduct({...newEditableProduct})
  }

  const handleEditableDescriptionChange =(e) =>{
    let newEditableProduct = editableProduct
    newEditableProduct.description = e.target.value
    setEditableProduct({...newEditableProduct})
  }

    const handleEditableAppsName = (e, appIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps[appIndex].name =e.target.value;
      newEditingNewProduct.apps = apps;
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditableFeatureName = (e, featureIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features[featureIndex].name =e.target.value;
      newEditingNewProduct.features = features;
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditingFeatureActiveUrlChange = (e, featureIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features[featureIndex].activeUrl =e.target.value;
      newEditingNewProduct.features = features;
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditingInActiveUrlChange = (e, featureIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features[featureIndex].inActiveUrl =e.target.value;
      newEditingNewProduct.features = features;
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditableFeatureTag = (e, featureIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features[featureIndex].tag =e.target.value;
      newEditingNewProduct.features = features;
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditableAppsTag = (e, appIndex) =>{
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps[appIndex].tag =e.target.value;
      newEditingNewProduct.apps = apps;
      setEditableProduct({...newEditingNewProduct});
    } 

    const handleEditingAppActiveUrlChange = (e,appIndex) => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps[appIndex].activeUrl =e.target.value;
      newEditingNewProduct.apps = apps
      setEditableProduct({...newEditingNewProduct});
    }

    const handleEditingAppInActiveUrlChange= (e,appIndex) => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps[appIndex].inActiveUrl =e.target.value;
      newEditingNewProduct.apps = apps
      setEditableProduct({...newEditingNewProduct});
      setCreateAppComponent(apps);
      
    }

    const hanldeEditableunpurchasedUrlChange = (e) => {
      let newEditableProduct = editableProduct;
        newEditableProduct.unpurchasedUrl = e.target.value
        setEditableProduct({...newEditableProduct})
    }
    const hanldeEditablepurchasedUrlChange = (e) => {
      let newEditableProduct = editableProduct;
        newEditableProduct.purchasedUrl = e.target.value
        setEditableProduct({...newEditableProduct})
    }

    const toggleShowEditing = (e) => {
      let newEditableProduct = editableProduct;
      newEditableProduct.visibility = e.target.checked;
      setEditableProduct({...newEditableProduct})
    }

    const handleAddingNameChange = (e)=>{
      let newAddingProduct = addingNewProduct;
      newAddingProduct.name = e.target.value
      setAddingNewProduct({...newAddingProduct})
    }

    
  //onClickBodyPopup
  const onClickBodyPopup= e => {
    e.preventDefault();
    e.stopPropagation()
  }

    const handleAddingDescriptionChange = (e)=>{
      let newAddingProduct = addingNewProduct;
      newAddingProduct.description = e.target.value
      setAddingNewProduct({...newAddingProduct})
    }

    const hanldeOneAppName = (e, appIndex) =>{
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent[appIndex].name=e.target.value;
      setCreateAppComponent([...newCreateAppComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.apps = createAppComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const hanldeOneFeatureName = (e, featureIndex) => {
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent[featureIndex].name=e.target.value;
      setCreateFeatureComponent([...newCreateFeatureComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.features = createFeatureComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const hanldeOneAppTag = (e, appIndex) => {
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent[appIndex].tag=e.target.value;
      setCreateAppComponent([...newCreateAppComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.apps = createAppComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const hanldeOneFeatureTag = (e, featureIndex) => {
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent[featureIndex].tag=e.target.value;
      setCreateFeatureComponent([...newCreateFeatureComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.features = createFeatureComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const handleAddingFeatureActiveUrlChange = (e, featureIndex) => {
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent[featureIndex].activeUrl=e.target.value;
      setCreateFeatureComponent([...newCreateFeatureComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.features = createFeatureComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const handleAddingFeatureInActiveUrlChange = (e, featureIndex) => {
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent[featureIndex].inActiveUrl=e.target.value;
      setCreateFeatureComponent([...newCreateFeatureComponent]);
      let newAddingProduct = addingNewProduct;
      newAddingProduct.features = createFeatureComponent;
      setAddingNewProduct({...newAddingProduct})
    }
    
    const handleAddingActiveAppUrlChange = (e,appIndex) => {
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent[appIndex].activeUrl=e.target.value;
      setCreateAppComponent([...newCreateAppComponent]);
      setAddingNewProduct({...createAppComponent});
      let newAddingProduct = addingNewProduct;
      newAddingProduct.apps = createAppComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const handleAddingAppInActiveUrlChange = (e,appIndex) => {
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent[appIndex].inActiveUrl=e.target.value;
      setCreateAppComponent([...newCreateAppComponent]);
      setAddingNewProduct({...createAppComponent});
      let newAddingProduct = addingNewProduct;
      newAddingProduct.apps = createAppComponent;
      setAddingNewProduct({...newAddingProduct})
    }

    const handleAddingunpurchasedUrlChange = (e) =>{
      let newAddingProduct = addingNewProduct;
      newAddingProduct.unpurchasedUrl = e.target.value
      setAddingNewProduct({...newAddingProduct})
    }

    const handleAddingpurchasedUrlChange = (e) =>{
      let newAddingProduct = addingNewProduct;
      newAddingProduct.purchasedUrl = e.target.value
      setAddingNewProduct({...newAddingProduct})
    }

    // check app box
    const toggleShowAdding = (e) => {
      let newAddingProduct = addingNewProduct;
      newAddingProduct.visibility = e.target.checked;
      setAddingNewProduct({...newAddingProduct})
    }

    
    const onPageChanged = data => {
      const { currentPage, totalPages, pageLimit } = data;
  
      const offset = (currentPage - 1) * pageLimit;
      const currentProducts = products.slice(offset, offset + pageLimit);
      setTheOffset(offset);
      setThePageLimit(pageLimit)
      // console.log("theOffset", theOffset, "thePageLimit", thePageLimit)
  
      setCurrentPage(currentPage)
      setCurrentProducts(currentProducts)
      setTotalPages(totalPages)
    };
    // console.log("theOffset", theOffset, "thePageLimit", thePageLimit)
   
    let productsList = null; 
    productsList = currentProducts.map((product,i)=>{
        if(!products.length){
          return;
        }    
        
      let appNameArr = product.data().apps ? product.data().apps.map( app => app.name) : []
      let featureNameArr = product.data().features ? product.data().features.map( feature => feature.name) : []
        
      return <tr key={product.id}>
        <td>
          <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
            <Form.Check.Input
              onChange={(e)=>{handleSelectProduct(e,i,product.id)}}
              checked={product.checked}
              defaultValue={false}
              // value={product.checked}
              type="checkbox"
              ></Form.Check.Input>
              <span className="form-check-sign"></span>
            </Form.Check.Label>
          </Form.Check>
        </td>
        <td>{product.data().name}</td>
        {/* <td>{appNameArr.join()}</td> */}
        <td>{product.data().apps ? appNameArr.join(): null}</td>
        <td>{product.data().features ? featureNameArr.join() : null}</td>
        <td>{product.data().visibility ? "yes" : "No"}</td>
        {/* <td>{product.data().purchasedUrl}</td>
        <td>{product.data().unpurchasedUrl}</td> */}
        <td>
        <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-422471719">
                  Edit Task..
                </Tooltip>
              }
            >
              <Button
                className="btn-simple btn-link p-1"
                type="button"
                variant="info"
                onClick = {()=>{resetEditableProduct(product.id,i)}}
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
            className="btn-simple btn-link p-1"
            type="button"
            variant="danger"
            onClick = {() => handleOpenDeletePopup(product)}
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
            <Button variant="primary" onClick={()=>handleDeleteProduct(deleteProduct,setProducts,closeEditPop,theOffset,thePageLimit,setCurrentProducts)}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
        </td>
      </tr>
      })

    const removeFeatureRow = (i)=>{
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent.splice(i,1);
      setCreateFeatureComponent([...newCreateFeatureComponent]);
    }
    const removeAppRow = i => {
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent.splice(i,1);
      setCreateAppComponent([...newCreateAppComponent]);
    }
    const removeAppEditRow = i => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps.splice(i,1);
      newEditingNewProduct.apps = apps
      setEditableProduct({...newEditingNewProduct});
    }
    const removeFeatureEditRow = i => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features.splice(i,1);
      newEditingNewProduct.features = features
      setEditableProduct({...newEditingNewProduct});
    }

    let renderAppsComponents = null;
    // console.log("createAppComponent",createAppComponent);
    renderAppsComponents = createAppComponent.map((app,i)=>{
      return (
        <div className="addAppDiv"  key={i}>
          <Row>
            <Col xs="auto"><Button variant="danger" className="removeApp" onClick={()=>{removeAppRow(i)}}>-</Button></Col>
            <Col xs="auto"><h4>App #{i+1}</h4></Col>
            <Col xs="auto">
            <Form.Group>
              <Form.File style={{display: "inline-block", marginBottom:25}} id="uploadAppIcon" label="Icon" onChange={handelChangeAppIcon}/>
              <Button variant="danger" onClick={e => handleUplaodAppIcon(i)}>Save Icon</Button>
            </Form.Group>
            </Col>
         </Row>
         <Row>
          <Col>
          <Form.Group><Row><Col xs="auto"><label>App Name</label></Col>
          <Col>
              <Form.Control
                defaultValue={app.name}
                value={app.name}
                placeholder="Add Product Apps"
                type="text"
                onChange={e =>hanldeOneAppName(e,i)}
              ></Form.Control>
          </Col></Row>
          </Form.Group>
          </Col>
          <Col>
        <Form.Group>
        <Row><Col xs="auto"><label>MailChimp tag</label></Col>
            <Col><Form.Control
              defaultValue={app.tag}
              value={app.tag}
              placeholder="MailChimp tag"
              type="text"
              onChange={e =>hanldeOneAppTag(e,i)}
            ></Form.Control></Col></Row>
        </Form.Group>
        </Col>
         </Row>
        
        <Row>
          <Col>
          <Form.Group>
          <Row><Col xs="auto"><label>Active URL</label></Col>
            <Col><Form.Control
              // defaultValue={app.activeUrl}
              value={app.activeUrl}
              placeholder="Add Product Page url"
              type="text"
              onChange={e => handleAddingActiveAppUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
          <Col>
          <Form.Group>
          <Row><Col xs="auto"> <label>Inactive URL</label></Col>
            <Col><Form.Control
              // defaultValue={app.inActiveUrl}
              value={app.inActiveUrl}
              placeholder="Add Product Page url"
              type="text"
              onChange={e => handleAddingAppInActiveUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
        </Row>
      </div>
      )
    })
    
    let renderFeaturesComponents=null;
    renderFeaturesComponents= createFeatureComponent.map((feature,i) => {
      return(
      <div className="addAppDiv" key={i}>
        <Row>
          <Col xs="auto"><Button variant="danger" className="removeApp" onClick={()=>{removeFeatureRow(i)}}>-</Button></Col>
          <Col xs="auto"><h4>Feature #{i+1}</h4></Col>
        </Row>
        <Row>
          <Col>
        <Form.Group><Row><Col xs="auto"><label>Feature Name</label></Col>
        <Col>
          <Form.Control
            defaultValue={feature.name}
            value={feature.name}
            placeholder="Add Feature Name"
            type="text"
            onChange={e =>hanldeOneFeatureName(e,i)}
          ></Form.Control>
        </Col></Row>
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
        <Row><Col xs="auto"><label>MailChimp tag</label></Col>
          <Col><Form.Control
            defaultValue={feature.tag}
            value={feature.tag}
            placeholder="MailChimp tag"
            type="text"
            onChange={e =>hanldeOneFeatureTag(e,i)}
          ></Form.Control></Col></Row>
        </Form.Group>
        </Col>
        </Row>
        <Row>
          <Col>
          <Form.Group>
          <Row><Col xs="auto"><label>Active URL</label></Col>
            <Col><Form.Control
              defaultValue={feature.activeUrl}
              value={feature.activeUrl}
              placeholder="Add Product Page url"
              type="text"
              onChange={e => handleAddingFeatureActiveUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
          <Col>
          <Form.Group>
          <Row><Col xs="auto"> <label>Inactive URL</label></Col>
            <Col><Form.Control
              defaultValue={feature.inActiveUrl}
              value={feature.inActiveUrl}
              placeholder="Add Product Page url"
              type="text"
              onChange={e => handleAddingFeatureInActiveUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
        </Row>
    </div>
    )})
    const addComponent = ()=>{
      let newCreateAppComponent = createAppComponent;
      newCreateAppComponent.push({
        name:"",
        activeUrl:"", 
        inActiveUrl: "", 
        tag: "", 
        appIcon: null
      });
      setCreateAppComponent([...newCreateAppComponent])
    }
    const addFeatureComponent = () => {
      let newCreateFeatureComponent = createFeatureComponent;
      newCreateFeatureComponent.push({
        name:"",
        activeUrl:"", 
        inActiveUrl: "", 
        tag: ""
      });
      setCreateFeatureComponent([...newCreateFeatureComponent])
    }
    const addEditableComponent = () => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let apps = newEditableProduct.apps;
      apps.push({
        name:"",
        activeUrl:"", 
        inActiveUrl: "", 
        tag: "", 
        appIcon: null
      });
      newEditingNewProduct.apps = apps;
      setEditableProduct({...newEditingNewProduct})
    }

    const addEditableFeature = () => {
      let newEditableProduct = editableProduct;
      let newEditingNewProduct = editableProduct;
      let features = newEditableProduct.features;
      features.push({
        name:"",
        activeUrl:"", 
        inActiveUrl: "", 
        tag: ""
      });
      newEditingNewProduct.features = features;
      setEditableProduct({...newEditingNewProduct})
    }

    const EditAppComponent = editableProduct.apps ? editableProduct.apps.map((app,i) => {
      return (
        <div key={i} className="addAppDiv">
          <Row style={{marginBottom: 30}}>
            <Col xs="auto"> <Button variant="danger" className="removeApp" onClick={()=>{removeAppEditRow(i)}}>-</Button></Col>
            <Col xs="auto"><h3>App #{i+1}</h3></Col><Col xs="auto">
            <Form.Group>
              <Form.File style={{display: "inline-block", marginBottom:25}} id="uploadAppIcon" label="Icon" onChange={handelChangeAppIcon}/>
              <img src={app.appIcon} width="30" height="30" />
              <Button variant="danger" onClick={e => handleUplaodEditAppIcon(i)}>Save Icon</Button>
            </Form.Group>
            </Col>
          </Row>
        <Row >
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>App Name</label></Col>
              <Col><Form.Control
                  defaultValue={app.name}
                  value={app.name}
                  placeholder="edit app name"
                  type="text"
                  onChange={e => handleEditableAppsName(e, i)}
              ></Form.Control></Col></Row>
          </Form.Group>
          </Col>
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>Mailchimp Tag</label></Col>
            <Col>
            <Form.Control
                defaultValue={app.tag}
                value={app.tag}
                placeholder="Mailchimp Tag"
                type="text"
                onChange={e => handleEditableAppsTag(e, i)}
            ></Form.Control></Col>
          </Row>
        </Form.Group></Col>
        </Row>
        <Row>
          <Col>
            <Form.Group><Row>
            <Col xs="auto"><label>Active URL</label></Col>
              <Col><Form.Control
                defaultValue={app.activeUrl}
                value={app.activeUrl}
                placeholder="Add Active url"
                type="text"
                onChange={e => handleEditingAppActiveUrlChange(e, i)}
              > 
              </Form.Control></Col></Row>
            </Form.Group>
          </Col>
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>Inactive URL</label></Col>
            <Col><Form.Control
              defaultValue={app.inActiveUrl}
              value={app.inActiveUrl}
              placeholder="Add Inactive url"
              type="text"
              onChange={e => handleEditingAppInActiveUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
        </Row>
       
        </div>
      )
    }) : null

    const EditFeatureComponent = editableProduct.features ? editableProduct.features.map((feature,i) => {
      return (
        <div key={i} className="addAppDiv">
          <Row style={{marginBottom: 30}}>
            <Col xs="auto"> <Button variant="danger" className="removeApp" onClick={()=>{removeFeatureEditRow(i)}}>-</Button></Col>
            <Col xs="auto"><h3>Feature #{i+1}</h3></Col><Col xs="auto">
            </Col>
          </Row>
        <Row >
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>Feature Name</label></Col>
              <Col><Form.Control
                  defaultValue={feature.name}
                  value={feature.name}
                  placeholder="edit Feature name"
                  type="text"
                  onChange={e => handleEditableFeatureName(e, i)}
              ></Form.Control></Col></Row>
          </Form.Group>
          </Col>
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>Mailchimp Tag</label></Col>
            <Col>
            <Form.Control
                defaultValue={feature.tag}
                value={feature.tag}
                placeholder="Mailchimp Tag"
                type="text"
                onChange={e => handleEditableFeatureTag(e, i)}
            ></Form.Control></Col>
          </Row>
        </Form.Group></Col>
        </Row>
        <Row>
          <Col>
            <Form.Group><Row>
            <Col xs="auto"><label>Active URL</label></Col>
              <Col><Form.Control
                defaultValue={feature.activeUrl}
                value={feature.activeUrl}
                placeholder="Active url"
                type="text"
                onChange={e => handleEditingFeatureActiveUrlChange(e, i)}
              > 
              </Form.Control></Col></Row>
            </Form.Group>
          </Col>
          <Col>
          <Form.Group>
          <Row>
            <Col xs="auto"><label>Inactive URL</label></Col>
            <Col><Form.Control
              defaultValue={feature.inActiveUrl}
              value={feature.inActiveUrl}
              placeholder="Inactive url"
              type="text"
              onChange={e => handleEditingInActiveUrlChange(e, i)}
            > 
            </Form.Control></Col></Row>
          </Form.Group>
        </Col>
        </Row>
       
        </div>
      )
    }) : null

    const totalProducts = products.length;


    if (totalProducts === 0){
      return (
        <>
        <Container fluid>
          <Row> 
            <Col>
              <Card className="card-tasks">
                <Card.Header>
                  <Card.Title as="h4">Products</Card.Title>
                  <p className="card-category">Add , Delete, Manage Products</p>
                </Card.Header>
                <Card.Body>
  
                <Table className="table-hover table-striped table-bordered ">
                    <thead>
                      <tr>
                        <th className="border-0">
                           <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                              <Form.Check.Label>
                                <Form.Check.Input
                                  onChange={toggleProductsSelection}
                                  ref={allRef}
                                  // value={false}
                                  defaultValue={false}
                                  type="checkbox"
                                ></Form.Check.Input>
                                <span className="form-check-sign"></span>
                              </Form.Check.Label>
                            </Form.Check>
                            <span>all</span>
                          </th>
                        <th className="border-0">Product Name</th>
                        <th className="border-0">Product Apps</th>
                        <th className="border-0">Product Features</th>
                        <th className="border-0">Visblility</th>
                        {/* <th className="border-0">Un purchased Link</th>
                        <th className="border-0"> purchased Link</th> */}
  
                        <th className="border-0">
                          <button onClick={showTheAddPop}>Add Product</button>
                          <button onClick={()=>{setShowDeleteSelectedAlert(true)}}>Delete Selected Products</button>
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
                                <Button variant="primary" onClick={()=> handleDeleteProducts(selectedProducts, setProducts,closeEditPop,theOffset,thePageLimit,setCurrentProducts)}>
                                  Yes
                                </Button>
                              </Modal.Footer>
                            </Modal>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                    {productsList}
                    </tbody>
                  </Table>
                </Card.Body>
                <Card.Footer>
                 
                  <div className="stats">
                    <i className="now-ui-icons loader_refresh spin"></i>
                    Updated 3 minutes ago
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
        <div className={"thePopUp " + (showAddPop ? "active" : "")} >
            <div className="thePopUpBody"  >
              <div className="font-icon-detail closePopUp" onClick={closeAddPop}>
                <i className="nc-icon nc-simple-remove"></i>
              </div>
              <h2 style={{marginBottom:50}}>Add New Produt</h2>
              <Form.Group>
                    <Row><Col xs="auto"><label>Product Name</label></Col>
                    <Col>
                    <Form.Control
                          defaultValue={addingNewProduct.name }
                          value={addingNewProduct.name }
                          placeholder="Add Product Name"
                          type="text"
                          onChange={handleAddingNameChange}
                      ></Form.Control></Col>
                    </Row>
                  </Form.Group>
              <Row>
                <Col>
                <label style={{marginRight: 25}}>Product visibility  </label>
                <label className="switch">
                <input type="checkbox" defaultValue={false} checked={addingNewProduct.visibility} onChange={toggleShowAdding} />
                <span className="slider round"></span>
              </label>
              </Col>
              </Row>
              <Row>
                  <Col>
                  <Form.Group>
                  <Row><Col xs="auto"><label style={{marginBottom: 15}}>Product Description</label></Col>
                      <Col><Form.Control
                          defaultValue={addingNewProduct.description }
                          value={addingNewProduct.description }
                          placeholder="Add Product Name"
                          type="text"
                          onChange={handleAddingDescriptionChange}
                      ></Form.Control></Col></Row>
                  </Form.Group>
                  </Col>
              </Row>
              <Row>
                <Col>
              <Form.Group>
                <Form.File style={{display: "inline-block"}} id="uploadproductIcon" label="Icon : " onChange={handelChangeproductIcon}/>
                <Button variant="danger" onClick={handleUplaodproductIcon}>Save Icon</Button>
              </Form.Group>
              </Col>
              </Row>
              <hr style={{borderTop: "2px solid #555"}} />
              <div>
              <Button variant="success" style={{display:"inline-block",margin: "25px auto 40px"}} onClick={addComponent}>Add App</Button>
              <Button variant="success" style={{display:"inline-block",margin:  "25px 15px 40px"}} onClick={addFeatureComponent}>Add Feature</Button>
              {renderAppsComponents}
              {renderFeaturesComponents}
              </div>
              
              <Row>
                  <Col>
                  <Form.Group>
                      <label>Unpurchased URL</label>
                      <Form.Control
                          defaultValue={addingNewProduct.unpurchasedUrl}
                          value={addingNewProduct.unpurchasedUrl}
                          placeholder="Add Product Page url"
                          type="text"
                          onChange={handleAddingunpurchasedUrlChange}
                      ></Form.Control>
                  </Form.Group>
                  </Col>
              </Row>
              <Row>
                  <Col>
                  <Form.Group>
                      <label>purchased URL</label>
                      <Form.Control
                          defaultValue={addingNewProduct.purchasedUrl}
                          value={addingNewProduct.purchasedUrl}
                          placeholder="Add Product Page url"
                          type="text"
                          onChange={handleAddingpurchasedUrlChange}
                      ></Form.Control>
                  </Form.Group>
                  </Col>
              </Row>
              <Row>
                  <Col>
                  <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="info"
                      onClick={()=>{handleAddNewProduct(addingNewProduct,setProducts,closeAddPop,theOffset,thePageLimit,setCurrentProducts)}}
                    >
                      Add Product
                    </Button>
                  </Col>
              </Row>
              </div>
        </div>
        </>
      )
    } else {
    return (
      <>
      <Container fluid>
        <Row> 
          <Col>
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Products</Card.Title>
                <p className="card-category">Add , Delete, Manage Products</p>
              </Card.Header>
              <Card.Body>

              <Table className="table-hover table-striped table-bordered ">
                  <thead>
                    <tr>
                      <th className="border-0">
                         <Form.Check  className="mb-1 pl-0" style={{display:"inline-block"}}>
                            <Form.Check.Label>
                              <Form.Check.Input
                                onChange={toggleProductsSelection}
                                ref={allRef}
                                defaultValue={false}
                                // value={false}
                                type="checkbox"
                              ></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                          <span>all</span>
                        </th>
                      <th className="border-0">Product Name</th>
                      <th className="border-0">Product Apps</th>
                      <th className="border-0">Product Features</th>
                      <th className="border-0">Visblility</th>
                      {/* <th className="border-0">Un purchased Link</th>
                      <th className="border-0"> purchased Link</th> */}

                      <th className="border-0">
                        <button onClick={showTheAddPop}>Add Product</button>
                        <button onClick={()=>{setShowDeleteSelectedAlert(true)}}>Delete Selected Products</button>
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
                              <Button variant="primary" onClick={()=> handleDeleteProducts(selectedProducts, setProducts,closeEditPop,theOffset,thePageLimit,setCurrentProducts)}>
                                Yes
                              </Button>
                            </Modal.Footer>
                          </Modal>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {productsList}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer>
               
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
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
              totalRecords={totalProducts}
              pageLimit={15}
              pageNeighbours={1}
              onPageChanged={onPageChanged}
            />
          </div>
        </div>
      </Container>
      <div className={"thePopUp " + (showEditPop ? "active" : "")} >
          <div className="thePopUpBody">
          <div className="font-icon-detail closePopUp" onClick={closeEditPop}>
              <i className="nc-icon nc-simple-remove"></i>
          </div>
          <h2 style={{marginBottom:50}}>Edit Product</h2>
            <Row>
                <Col>
                <Form.Group><Row>
                    <Col xs="auto"><label>Product Name :</label></Col>
                    <Col><Form.Control
                        defaultValue={editableProduct.name}
                        value={editableProduct.name}
                        placeholder="Add Product Name"
                        type="text"
                        onChange={handleEditableNameChange}
                    ></Form.Control></Col></Row>
                </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                <Form.Group><Row>
                    <Col xs="auto"><label>Product Description :</label></Col>
                    <Col><Form.Control
                        defaultValue={editableProduct.description}
                        value={editableProduct.description}
                        placeholder="Add Product Description"
                        type="text"
                        onChange={handleEditableDescriptionChange}
                    ></Form.Control></Col></Row>
                </Form.Group>
                </Col>
            </Row>
             <Row>
              <Col>
              <label style={{marginRight: 25}}>Product visibility :  </label>
              <label className="switch">
              <input type="checkbox" defaultValue={false} checked={editableProduct.visibility} onChange={toggleShowEditing} />
              <span className="slider round"></span>
            </label>
            </Col>
            </Row>
            <Row>
                <Col>
                <Form.Group><Row>
                <Col xs="auto"><label>"Learn More" Link :</label></Col>
                    <Col><Form.Control
                        defaultValue={editableProduct.unpurchasedUrl}
                        value={editableProduct.unpurchasedUrl}
                        placeholder="Add Product url"
                        type="text"
                        onChange={hanldeEditableunpurchasedUrlChange}
                    ></Form.Control></Col></Row>
                </Form.Group>
                </Col>
            </Row>
            {/* <Row>
                <Col>
                <Form.Group>
                    <label>purchased URL</label>
                    <Form.Control
                        defaultValue={editableProduct.purchasedUrl}
                        placeholder="Add Product url"
                        type="text"
                        onChange={hanldeEditablepurchasedUrlChange}
                    ></Form.Control>
                </Form.Group>
                </Col>
            </Row> */}
            <Row>
              <Col>
            <Form.Group>
              <Form.File style={{display: "inline-block"}} id="uploadproductIcon" label="Icon : " onChange={handelChangeproductIcon}/>
              <img src={editableProduct.productIcon} height="30px" width="30px" />
              <Button variant="danger" onClick={handleEditUplaodproductIcon}>Save Icon</Button>
            </Form.Group>
            </Col>
            </Row>
            <hr style={{borderTop: "2px solid #555"}} />
            <Button variant="success" style={{display: "inline-block", margin: "25px auto 40px"}} onClick={addEditableComponent}>Add App</Button>
            <Button variant="success" style={{display: "inline-block", margin: "25px 20px 40px"}} onClick={addEditableFeature}>Add Feature</Button>
             {EditAppComponent}
             {EditFeatureComponent}
            <Row>
                <Col>
                <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="info"
                    onClick={()=>{handleEditProduct(editableProduct,setProducts,closeEditPop,theOffset,thePageLimit,setCurrentProducts)}}
                  >
                    Save Changes
                  </Button>
                </Col>
            </Row>
            </div>
      </div>

      <div className={"thePopUp " + (showAddPop ? "active" : "")} >
          <div className="thePopUpBody"  >
            <div className="font-icon-detail closePopUp" onClick={closeAddPop}>
              <i className="nc-icon nc-simple-remove"></i>
            </div>
            <h2 style={{marginBottom:50}}>Add New Produt</h2>
            <Form.Group>
                  <Row><Col xs="auto"><label>Product Name</label></Col>
                  <Col>
                  <Form.Control
                        defaultValue={addingNewProduct.name }
                        value={addingNewProduct.name}
                        placeholder="Add Product Name"
                        type="text"
                        onChange={handleAddingNameChange}
                    ></Form.Control></Col>
                  </Row>
                </Form.Group>
            <Row>
              <Col>
              <label style={{marginRight: 25}}>Product visibility  </label>
              <label className="switch">
              <input type="checkbox" defaultValue={false} checked={addingNewProduct.visibility} onChange={toggleShowAdding} />
              <span className="slider round"></span>
            </label>
            </Col>
            </Row>
            <Row>
                <Col>
                <Form.Group>
                <Row><Col xs="auto"><label style={{marginBottom: 15}}>Product Description</label></Col>
                    <Col><Form.Control
                        defaultValue={addingNewProduct.description }
                        value={addingNewProduct.description }
                        placeholder="Add Product Name"
                        type="text"
                        onChange={handleAddingDescriptionChange}
                    ></Form.Control></Col></Row>
                </Form.Group>
                </Col>
            </Row>
            <Row>
              <Col>
            <Form.Group>
              <Form.File style={{display: "inline-block"}} id="uploadproductIcon" label="Icon : " onChange={handelChangeproductIcon}/>
              <Button variant="danger" onClick={handleUplaodproductIcon}>Save Icon</Button>
            </Form.Group>
            </Col>
            </Row>
            <hr style={{borderTop: "2px solid #555"}} />
            <div>
            <Button variant="success" style={{display:"inline-block",margin: "25px auto 40px"}} onClick={addComponent}>Add App</Button>
            <Button variant="success" style={{display:"inline-block",margin:  "25px 15px 40px"}} onClick={addFeatureComponent}>Add Feature</Button>
            {renderAppsComponents}
            {renderFeaturesComponents}
            </div>
            
            <Row>
                <Col>
                <Form.Group>
                    <label>Unpurchased URL</label>
                    <Form.Control
                        defaultValue={addingNewProduct.unpurchasedUrl}
                        value={addingNewProduct.unpurchasedUrl}
                        placeholder="Add Product Page url"
                        type="text"
                        onChange={handleAddingunpurchasedUrlChange}
                    ></Form.Control>
                </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                <Form.Group>
                    <label>purchased URL</label>
                    <Form.Control
                        defaultValue={addingNewProduct.purchasedUrl}
                        value={addingNewProduct.purchasedUrl}
                        placeholder="Add Product Page url"
                        type="text"
                        onChange={handleAddingpurchasedUrlChange}
                    ></Form.Control>
                </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="info"
                    onClick={()=>{handleAddNewProduct(addingNewProduct,setProducts,closeAddPop,theOffset,thePageLimit,setCurrentProducts)}}
                  >
                    Add Product
                  </Button>
                </Col>
            </Row>
            </div>
      </div>
      </>
    )}
}

export default addProduct;
