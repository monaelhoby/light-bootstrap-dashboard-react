import { db } from "../firebase";

export const handleEditProduct = (editableProduct,setProducts,callback,theOffset,thePageLimit,setCurrentProducts)=> {
    // console.log("editableProduct",editableProduct)
    db.collection("products").doc(editableProduct.id).update({
        name:editableProduct.name,
        purchasedUrl: editableProduct.purchasedUrl,
        unpurchasedUrl: editableProduct.unpurchasedUrl,
        visibility: editableProduct.visibility,
        productIcon: editableProduct.productIcon,
        description: editableProduct.description,
        id: editableProduct.id,
        apps:editableProduct.apps,
        features:editableProduct.features
    }).then(()=>{
        db.collection("products").get()
        .then(snapshot=>{
            // console.log(snapshot.docs[0].data())
            setProducts([...snapshot.docs]);
            updateProductsinUsers(editableProduct)
            // updateProductsinCodes(editableProduct)
            callback();
            if(theOffset || thePageLimit){
                setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentProducts([...snapshot.docs])
            }
        })
    })
    .catch((err) => {
        console.log(err)
    })
}

export const handleAddNewProduct = (addedProduct,setProducts,callback,theOffset,thePageLimit,setCurrentProducts)=>{
    // console.log(addedProduct)
    db.collection("products").add({
        name: addedProduct.name,
        description: addedProduct.description,
        purchasedUrl: addedProduct.purchasedUrl,
        unpurchasedUrl: addedProduct.unpurchasedUrl,
        visibility: addedProduct.visibility,
        productIcon: addedProduct.productIcon,
        apps: addedProduct.apps[0].name.length?addedProduct.apps:null,
        features: addedProduct.features[0].name.length?addedProduct.features:null,
        // id : addedProduct.id
    })
    .then((newProduct) => {
        db.collection("products").get().then(snapshot=>{
            let products = [];
            snapshot.docs.forEach(product=>{
                product.checked = false;
                products.push(product)
            })
            setProducts([...products]);
            // console.log("addedProduct", addedProduct)
            addNewProductToUsers(addedProduct,newProduct.id)
            callback() 
            if(theOffset || thePageLimit){
                setCurrentProducts(products.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentProducts([...products])
            }
        })
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

export const handleDeleteProduct = (product,setProducts, callback,theOffset,thePageLimit,setCurrentProducts)=>{
    // console.log(product.id)
    db.collection("products").doc(product.id).delete()
    .then(()=>{
        db.collection("products").get()
        .then(snapshot=>{
            setProducts([...snapshot.docs]);
            deleteProductFromUsers(product.data().name);
            if(theOffset || thePageLimit){
                setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentProducts([...snapshot.docs])
            }
        })
        callback()
    })
    .catch((err)=>{
        console.log(err)
    })

}

const updateProductsinUsers = (product)=>{
    db.collection("users").get().then(snapshot=>{
        snapshot.docs.forEach(user=>{
            let products = user.data().products.filter(p=>{
                return product.id !== p.id;
            });

            let oldProduct = user.data().products.find(p=>{
                // console.log("p.id", p.id)
                // console.log("product.id", product.id)
                return product.id == p.id
            })
            // console.log("old product is",oldProduct)

            let theNewProduct = {};
            theNewProduct.name = product.name;
            theNewProduct.purchasedUrl= product.purchasedUrl;
            theNewProduct.unpurchasedUrl= product.unpurchasedUrl;
            theNewProduct.visibility= product.visibility;
            theNewProduct.description= product.description,
            theNewProduct.productIcon= product.productIcon,
            theNewProduct.id = product.id;
            theNewProduct.apps = [];
            theNewProduct.features = [];
            product.apps ? product.apps.forEach((a)=>{
                let exist = false;
                let generatedApp   = {};
                oldProduct ? oldProduct.apps.forEach((app)=>{
                    generatedApp.name = a.name;
                    generatedApp.tag = a.tag;
                    generatedApp.inActiveUrl = a.inActiveUrl;
                    generatedApp.activeUrl = a.activeUrl;
                    generatedApp.appIcon = a.appIcon;

                    if(app.name == a.name){
                        // console.log(a)
                        exist = true;
                        generatedApp.active = app.active
                        generatedApp.comments = a.comment?a.comment : ""
                        generatedApp.purchased= app.purchased
                        generatedApp.credentials = app.credentials
                        generatedApp.expireDate= app.expireDate
                        generatedApp.timesAppLaunchedLastLogin = app.timesAppLaunchedLastLogin
                        generatedApp.timesAppLaunchedPurchased = app.timesAppLaunchedPurchased
                        generatedApp.lastLaunchDate = app.lastLaunchDate
                        generatedApp.timesAppLaunched = app.timesAppLaunched
                        generatedApp.deviceId = app.deviceId 
                        generatedApp.activatedOn= app.activatedOn
                        generatedApp.codeUsed= app.codeUsed
                        generatedApp.DateofLastUse= app.DateofLastUse
                        generatedApp.LaunchesSinceActive= app.LaunchesSinceActive
                    }
                }) : null

                if(!exist){
                    generatedApp.active = false;
                    generatedApp.comments =  ""
                    generatedApp.purchased= false
                    generatedApp.credentials = false
                    generatedApp.expireDate= ""
                    generatedApp.timesAppLaunchedLastLogin = ""
                    generatedApp.timesAppLaunchedPurchased = ""
                    generatedApp.lastLaunchDate = ""
                    generatedApp.timesAppLaunched = ""
                    generatedApp.deviceId = ""
                    generatedApp.activatedOn= ""
                    generatedApp.codeUsed= "" 
                    generatedApp.DateofLastUse= ""
                    generatedApp.LaunchesSinceActive= ""
                }

                theNewProduct.apps.push(generatedApp)
            }) : null
            product.features ? product.features.forEach((a)=>{
                let exist = false;
                let generatedFeature   = {};
                oldProduct ? oldProduct.features.forEach((feature)=>{
                    // console.log("a:",a)
                    // console.log("feature:",feature)
                        // console.log(a)
                        exist = true;
                        generatedFeature.name = a.name;
                        generatedFeature.tag = a.tag;
                        generatedFeature.activeUrl = a.activeUrl;
                        generatedFeature.inActiveUrl = a.inActiveUrl;
                        if(feature.name == a.name){
                            // console.log(a)
                            exist = true;
                            generatedFeature.comments = a.comment?a.comment : ""
                            generatedFeature.active=feature.active? feature.active : false;
                            generatedFeature.purchased= feature.purchased ? feature.purchased : false;
                            generatedFeature.expireDate= feature.expireDate?feature.expireDate:"30/3/2021";
                            generatedFeature.activatedOn= feature.activatedOn?feature.activatedOn : '12/28/2020 @ 5:45pm : "1.23.456.5"';
                            generatedFeature.codeUsed= feature.codeUsed ? feature.codeUsed : '123456789' 
                        }
                }) : null
                if(!exist){
                    generatedFeature.comments =  ""
                    generatedFeature.active=false;
                    generatedFeature.purchased= false;
                    generatedFeature.expireDate= "30/3/2021";
                    generatedFeature.activatedOn= '12/28/2020 @ 5:45pm : "1.23.456.5"';
                    generatedFeature.codeUsed= '123456789' 
                }
                theNewProduct.features.push(generatedFeature)
            }) : null

            products.push(theNewProduct)
            // console.log(products)
            db.collection("users").doc(user.id).set({
                products
            },{merge:true})
        })
    })
}

export const deleteProductFromUsers = (productName)=>{
    let products = []
    db.collection("users").get().then(snapshot=>{
        snapshot.docs.forEach(user=>{
             products = user.data().products.filter(product=>{
                // console.log(product.name, productName)
                return product.name !== productName;
            });
            // console.log("products is : ",products)
            db.collection("users").doc(user.id).set({
                products
            },{merge:true})
        })
    })
}

const addNewProductToUsers = (product,productId)=>{
    db.collection("users").get().then(snapshot=>{
        // console.log(productId)
        let theProduct = {};
        theProduct.name = product.name;
        theProduct.purchasedUrl= product.purchasedUrl;
        theProduct.unpurchasedUrl= product.unpurchasedUrl;
        theProduct.visibility= product.visibility;
        theProduct.productIcon= product.productIcon,
        theProduct.description= product.description,
        theProduct.apps = [];
        theProduct.features = [];
        theProduct.id = productId
        // theProduct.id = product.id;
    if(product.apps[0].name.length){
        product.apps.forEach(app=>{
            theProduct.apps.push({
                name:app.name,
                activeUrl:app.activeUrl ? app.activeUrl : "",
                inActiveUrl:app.inActiveUrl ? app.inActiveUrl : "",
                tag: app.tag ? app.tag : "",
                appIcon: app.appIcon ? app.appIcon : "",
                active:app.active ? app.active : false,
                purchased: app.purchased ? app.purchased : false,
                credentials : app.credentials ? app.credentials : "",
                expireDate: app.expireDate ? app.expireDate : "",
                timesAppLaunchedLastLogin : app.timesAppLaunchedLastLogin ? app.timesAppLaunchedLastLogin : "",
                timesAppLaunchedPurchased : app.timesAppLaunchedPurchased ? app.timesAppLaunchedPurchased : "",
                lastLaunchDate : app.lastLaunchDate ? app.lastLaunchDate : "",
                timesAppLaunched : app.timesAppLaunched ? app.timesAppLaunched : "",
                deviceId : "9876543",
                activatedOn: app.activatedOn ? app.activatedOn : "",
                codeUsed: "9876543" ,
                DateofLastUse: app.DateofLastUse ? app.DateofLastUse : "",
                LaunchesSinceActive: app.LaunchesSinceActive ? app.LaunchesSinceActive : ""
            })
        })
    }
    if(product.features[0].name.length){    
        product.features.forEach(feature => {
            theProduct.features.push({
            name:feature.name,
            activeUrl:feature.activeUrl ? feature.activeUrl : "",
            inActiveUrl:feature.inActiveUrl ? feature.inActiveUrl : "",
            tag: feature.tag ? feature.tag : "",
            active: false,
            purchased:  false,
            expireDate: "",
            activatedOn:  "",
            codeUsed: "9876543" ,
            })
        })
    }
        snapshot.docs.forEach(user=>{
            let products = user.data().products;
            products.push(theProduct);
            db.collection("users").doc(user.id).set({
                products
            },{merge:true})
        })
    })
}

// const updateProductsinCodes = (product)=>{
//     db.collection("codes").get().then(snapshot=>{
//         snapshot.docs.forEach(code=>{
//             let allAppCodes=code.data().productActivated.apps
//             // console.log("allProducts before",allProducts);
//             allAppCodes.forEach(app => {
//                 if(product.name === app.productName){
//                     app.productName = 
//                     piu.apps.forEach((app,j)=>{
//                         if(app.name === p.appName){
//                             allProducts[i].apps[j].purchased = true
//                             allProducts[i].apps[j].activatedOn = new Date().toLocaleString()
//                             // console.log("allAppCodes",allAppCodes)
//                         }
//                     })
//                 }
//             })
//             code.data().productActivated.apps.forEach(app => {
//                 if(app.productName == product.name){

//                 }
//             })
//             // db.collection("codes").doc(code.id).update({
//             // })
//             console.log(code.data())
            
//             // console.log(products)
//             // db.collection("users").doc(user.id).set({
//             //     products
//             // },{merge:true})
//         })
//     })
// }

export const handleDeleteProducts = (ids, setProducts,callback,theOffset,thePageLimit,setCurrentProducts) =>{  
    // console.log(ids)
    let products = []
    return db.collection("products").get().then((snapshot) => {
        snapshot.docs.forEach(() => {
            ids.forEach(uid => {
                db.collection("products").doc(uid).delete();
            })
        })
    }).then(() => {
        db.collection("products").get()
        .then(snapshot => {
            products = [...snapshot.docs]
            setProducts([...snapshot.docs])
            callback() 
            if(theOffset || thePageLimit){
                setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentProducts([...snapshot.docs])
            }
        })
        .then(() => {
            // console.log(products)
            let theProducts = []
            let theProduct = {};
            products.forEach(p => {
                theProduct.id = p.id
                theProduct.name = p.data().name
                theProduct.apps = p.data().apps
                theProduct.features = p.data().features
                theProduct.description = p.data().description
                theProduct.visibility = p.data().visibility
                theProduct.productIcon = p.data().productIcon
                theProduct.purchasedUrl = p.data().purchasedUrl
                theProduct.unpurchasedUrl = p.data().unpurchasedUrl
                
            theProducts.push(theProduct)
            })
            db.collection("users").get().then(snapshot=>{
                snapshot.docs.forEach(user=>{
                    // console.log("user is : ",theProducts)
                    db.collection("users").doc(user.id).set({
                        products : theProducts
                    },{merge:true})
                })
            })
        })
    })
    .catch(err=>{
    console.log("ERR",err);
    })
}

// const resetUsersDetails = () =>{
//     let products;
//     db.collection("products").get().then(snapshot=>{
//         products = snapshot.docs;
//         db.collection("users").get().then(snapshot=>{
//             snapshot.docs.forEach(user=>{
//                 products.forEach(product=>{
//                     user.products
//                 })
//             })
//         })
//     });  
// }