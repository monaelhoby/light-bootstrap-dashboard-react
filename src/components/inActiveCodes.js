

import React, {useState, useEffect} from 'react'
import Pagination from '../components/pagination'

export default function inActiveCodes() {
    
    const [currentInactiveCodes, setCurrentInactiveCodes] = useState([]) ;
    const [currentPage, setCurrentPage] = useState(null) ;
    const [totalPages, setTotalPages] = useState(null) ;
    const [viewInactiveCode, setViewInactiveCode] = useState({});
    const [viewInactiveCode, setViewInactiveCode] = useState({});

    useEffect(() => {
        db.collection("inactiveCodes").get().then(snapshot => {
            let allCodes =[];
            snapshot.docs.forEach(code => {
                code.checked=false;
                allCodes.push(code)
            })
            setInactiveCodes([...allCodes])
        })
    },[])

    
    const handleSelectedInactiveApps = (e, i, id) => {
        let newSelectedCodes = selectedCodes;
        if(e.target.checked){
          newSelectedCodes.push(id);
        }else{
          newSelectedCodes = newSelectedCodes.filter((uid)=>{
            return uid !== id
          })
        }
        setSelectedInactiveCodes([...newSelectedCodes])
        let newCodes = inactiveCodes;
        newCodes[i].checked = e.target.checked
        setInactiveCodes([...newCodes])
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

    const onPageChangedInactive = data => {
        // setPageNum(0)
        const { currentPage, totalPages, pageLimit } = data;
    
        const offset = (currentPage - 1) * pageLimit;
        const currentInactiveCodes = inactiveCodes.slice(offset, offset + pageLimit);
        console.log(data)
        setCurrentPage(currentPage)
        setCurrentInactiveCodes(currentInactiveCodes)
        setTotalPages(totalPages)
      };
  
      const totalInactiveCodes = inactiveCodes.length;
      // if (totalInactiveCodes === 0) return null;

      let renderInactiveCodes = null;
      renderInactiveCodes = inactiveCodes.map((code,i) => {
        // {console.log(pageNum)}
        if(!inactiveCodes.length){
            return;
        }
        if(i == pageNum){
          return ;
        }
        // if(code.data().inactiveCode.includes(searchedVal)){
        if(i < pageNum){
            return (
            <tr key={i}>
            <td>
            <Form.Check className="mb-1 pl-0">
            <Form.Check.Label>
                <Form.Check.Input
                  onChange={(e)=> handleSelectedInactiveApps(e,i,code.id)}
                  checked={code.checked}
                  defaultValue=""
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
        // }
      }
      })
  
      
      let renderInactiveCodesPage = null;
      renderInactiveCodesPage = currentInactiveCodes.map((code,i) => {
        // {console.log(code.data())}
        if(!inactiveCodes.length){
            return;
        }
        
        // if(code.data().inactiveCode.includes(searchedVal)){
            return (
            <tr key={i}>
            <td>
            <Form.Check className="mb-1 pl-0">
            <Form.Check.Label>
                <Form.Check.Input
                  onChange={(e)=> handleSelectedInactiveApps(e,i,code.id)}
                  checked={code.checked}
                  defaultValue=""
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
      //  }
      })
      
    return (
        <div>
            <div className={"thePopUp " + (showInactiveCode ? "active" : "")} >
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
                                    defaultValue={app.checked}
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
                                    defaultValue={feature.checked}
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
                      <Form.Control as="textarea" rows={3} defaultValue={viewInactiveCode.notes}/>
                  </Form.Group>
                  </Col>
                  </Row>
              <Row>
              <Col>
               <Button className="btn-fill pull-right" type="submit" variant="info" 
               onClick={() => handleReactiveCode(viewInactiveCode, setInactiveCodes,closeAddPop)}>Reactive</Button>
               <Button className="btn-fill pull-right" type="submit" variant="info" 
               onClick={closeAddPop}>Cancel</Button>
              </Col>
            </Row>
            </div>
          </div>
        </div>
    )
}
