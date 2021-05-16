import { db } from "../../firebase";


export const handleDeactiveApp = (user,product,theApp,setUser) => {
    // console.log(theApp)
    let newUser = user;
    let editableProduct = newUser.products.find(p=>{
        return p.name == product.name;
    })
    
    newUser.products = newUser.products.filter(p=>{
        return p.name !== product.name;
    })

    editableProduct.apps.forEach(app => {
        // console.log(app.name,theApp.name)
        if (app.name == theApp.name){
            app.deviceId = "";
        }
    });

    newUser.products.push(editableProduct);
    setUser({...newUser})
    return db.collection('users').doc(user.id).set(newUser) 
    
  }

  export const handleDeactiveAllApps = (user,product,setUser,callback) => {
    let newUser = user;
    let editableProduct = newUser.products.find(p=>{
        return p.name == product.name;
    })
    
    newUser.products = newUser.products.filter(p=>{
        return p.name !== product.name;
    })

    editableProduct.apps.forEach(app => {
            app.deviceId = "";
    });
    newUser.products.push(editableProduct);
    setUser({...newUser})
    callback()
    return db.collection('users').doc(user.id).set(newUser) 
    
  }

  export const handleInactiveCode = (code,prefixCode, theUser, theCodeObject,callback,setCode,setProductsActivated) => {
    //   console.log("theCodeObject: ",theCodeObject.data(),"theUser",theUser)
    db.collection("codes").get()
    .then(snapshot => {
    let activeCodeObject = {};
    snapshot.docs.forEach(oneCode => {
        if(Array.isArray(oneCode.data().code)){
            let activeCode = "";
            activeCode = oneCode.data().code.find(singleCode => singleCode==code);
            if(activeCode){
                activeCodeObject = oneCode.data() 
            }
        }else if(!Array.isArray(oneCode.data().code)){
            if(oneCode.data().code == code) {
                activeCodeObject = oneCode.data() 
            }else{
                return
            }
        }
    })
    db.collection("inactiveCodes").add({
        inactiveCode : code,
        activatedBy : theUser.email,
        firstName : theUser.firstName,
        lastName : theUser.lastName,
        prefixCode : prefixCode,
        dataAdded : new Date().toLocaleString(),
        placeOfPurchase: theCodeObject.data().purchasedLocation,
        productActivated: theCodeObject.data().productActivated,
        products: theCodeObject.data().products,
        notes: theCodeObject.data().notes,
        suffixCode: theCodeObject.data().suffixCode
    }).then(() => {
        // console.log(theCodeObject.data().productActivated)
        db.collection("codes").doc(theCodeObject.id).delete()
        updateAppsinUser(theCodeObject.data().productActivated,theUser.id,code, setProductsActivated)
        setCode("")
        callback()
        // window.location.reload(false);
    })
    }).catch(err => {
        console.log(err)
    })
  }

  const updateAppsinUser = (productsActivated, id,code, setProductsActivated)=>{
    db.collection("users").doc(id).get()
    .then(snapshot=>{
        let allProducts=snapshot.data().products
        // console.log("allProducts before",productsActivated);

        productsActivated ? productsActivated.forEach((product) => {
            product.apps ? product.apps.forEach((acivatedApp) => {
                allProducts.forEach((piu,i)=>{
                    if(piu.name === product.name){
                        piu.apps.forEach((app,j)=>{
                            if(app.name === acivatedApp){
                                allProducts[i].apps[j].purchased = true
                                allProducts[i].apps[j].codeUsed = code
                                allProducts[i].apps[j].activatedOn = new Date().toLocaleString()
                            }
                        })
                    }
                })
            }) : null
            product.features ? product.features.forEach(activatedFeature => {
                allProducts.forEach((piu,i)=>{
                    if(piu.name === product.name){
                        piu.features.forEach((feature,k)=>{
                            if(feature.name === activatedFeature){
                                allProducts[i].features[k].purchased = true
                                allProducts[i].features[k].codeUsed = code
                                allProducts[i].features[k].activatedOn = new Date().toLocaleString()
                            }
                        })
                    }
                })
            }) : null
        }) : null
        // console.log("allProducts after",allProducts)
        setProductsActivated(allProducts)
        db.collection("users").doc(id).set({
            products: allProducts
        },{merge:true})
        }).catch(err => {
            console.log(err)
        })
}