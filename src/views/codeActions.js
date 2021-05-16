import {db} from '../firebase';
// import {crypto} from 'crypto'
const crypto = require("crypto");

export const handleAddCode = (code,setCodes,callback,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes) => {
    // console.log(code.lengthCode)
    const length = Number(code.lengthCode) 
    let cryptoCode = null;
    cryptoCode = crypto.randomBytes(length).toString("hex")
    cryptoCode = cryptoCode.slice(0,length - code.prefixCode.length)
    // console.log("before cryptoCode", cryptoCode)
    cryptoCode = cryptoCode.replace(/0|1|o|O|l|L/gi,"e")
    // console.log("before cryptoCode", cryptoCode)
    let thePrefix = code.prefixCode
    thePrefix = thePrefix.replace(/0|1/gi,"e")
    // console.log("before thePrefix", thePrefix)
    thePrefix = thePrefix.replace(/0|1|o|O|l|L/gi,"R")
    // console.log("before thePrefix", thePrefix)
    // console.log(code.products)
    let activatedProduct = []
    code.products.forEach(product => {
        // console.log(product.productName)
        let theProduct = {}
        if(product.checked == true){
            theProduct.name = product.productName
            theProduct.id = product.productId
            let apps =[]
            product.apps.forEach(app => {
                if(app.checked){
                    apps.push(app.name)
                }
                theProduct.apps = apps
            })
            let features =[]
            product.features.forEach(feature => {
                if(feature.checked){
                    features.push(feature.name)
                }
                theProduct.features = features
            })
            activatedProduct.push(theProduct)
        }
        // console.log(theProduct)
    })
    db.collection("codes").add({
        prefixCode : code.prefixCode,
        code : thePrefix+cryptoCode,
        suffixCode : cryptoCode,
        dateAdded : new Date().toLocaleString(),
        productActivated : activatedProduct,
        products : code.products,
        purchasedLocation : code.purchasedLocation,
        notes : code.notes,
    })
    .then(() => {
        db.collection("codes").get().then(snapshot=>{
            let codes = [];
            snapshot.docs.forEach(code=>{
                code.checked = false;
                codes.push(code)
            })
            setCodes([...codes]);
            callback()
            if(theOffsetActiveCode || thePageLimitActiveCode){
                setCurrentActiveCodes(codes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode))
            }else{
                setCurrentActiveCodes([...codes])
            }
        })
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

export const handleAddCodes = (code,setCodes,callback,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes) => {
    const length = Number(code.lengthCode) 
    let cryptoCode = null;
    // console.log(code.products)
    let activatedProduct = []
    code.products.forEach(product => {
        // console.log(product.productName)
        let theProduct = {}
        if(product.checked == true){
            theProduct.name = product.productName
            theProduct.id = product.productId
            let apps =[]
            product.apps.forEach(app => {
                if(app.checked){
                    apps.push(app.name)
                }
                theProduct.apps = apps
            })
            let features =[]
            product.features.forEach(feature => {
                if(feature.checked){
                    features.push(feature.name)
                }
                theProduct.features = features
            })
            activatedProduct.push(theProduct)
        }
        // console.log(theProduct)
    })
    // console.log("activatedProduct", activatedProduct)
    for(let i =0; i<code.quantity; i++){
        cryptoCode = crypto.randomBytes(length).toString("hex")
        cryptoCode = cryptoCode.slice(0,length - code.prefixCode.length)
        // console.log("before cryptoCode", cryptoCode)
        cryptoCode = cryptoCode.replace(/0|1|o|O|l|L/gi,"e")
        // console.log("before cryptoCode", cryptoCode)
        let thePrefix = code.prefixCode
        thePrefix = thePrefix.replace(/0|1/gi,"e")
        // console.log("before thePrefix", thePrefix)
        thePrefix = thePrefix.replace(/0|1|o|O|l|L/gi,"R")
        // console.log("before thePrefix", thePrefix)
        db.collection("codes").add({
        prefixCode : code.prefixCode,
        code : thePrefix+cryptoCode,
        dateAdded : new Date().toLocaleString(),
        productActivated : activatedProduct,
        purchasedLocation : code.purchasedLocation,
        notes : code.notes,
        products: code.products,
        suffixCode: cryptoCode
        })
        .then(() => {
            db.collection("codes").get().then(snapshot=>{
                let codes = [];
                snapshot.docs.forEach(code=>{
                    code.checked = false;
                    codes.push(code)
                })
                setCodes([...snapshot.docs]);
                callback()
                if(theOffsetActiveCode || thePageLimitActiveCode){
                    setCurrentActiveCodes(snapshot.docs.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode))
                }else{
                    setCurrentActiveCodes([...snapshot.docs])
                }
            })
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
}

export const handleDeleteCode = (code,setCodes,callback,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes)=>{
    
    db.collection("codes").doc(code.id).delete()
    .then(()=>{
        db.collection("codes").get()
        .then(snapshot=>{
            setCodes([...snapshot.docs]);
            if(theOffsetActiveCode || thePageLimitActiveCode){
                setCurrentActiveCodes(snapshot.docs.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode))
            }else{
                setCurrentActiveCodes([...snapshot.docs])
            }
        })
        callback() 
    })
    .catch((err)=>{
        console.log(err)
    })
}

export const handleDeleteCodes = (ids, setCodes,callback,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes) =>{  
    let theCodes = [];
    return db.collection("codes").get().then((snapshot) => {
        snapshot.docs.forEach((code) => {
            let codes = [];
            ids.forEach(uid => {
                db.collection("codes").doc(uid).delete();
                codes.push(code)
            })
        })
    }).then(() => {
        db.collection("codes").get().then(snapshot=>{
            snapshot.docs.forEach(code => {
                code.checked = false;
                theCodes.push(code)
            })
            setCodes([...theCodes]); 
            if(theOffsetActiveCode || thePageLimitActiveCode){
                setCurrentActiveCodes(theCodes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode))
            }else{
                setCurrentActiveCodes([...theCodes])
            }
        })
        callback()
    }).catch(err=>{
    console.log("ERR",err);
    })
}

export const handleEditCode = (editCode,setCodes,callback,theOffsetActiveCode,thePageLimitActiveCode,setCurrentActiveCodes) => {
    // console.log("editCode", editCode)
    let activatedProduct = []
    editCode.products.forEach(product => {
        // console.log(product.productName)
        let theProduct = {}
        if(product.checked == true){
            theProduct.name = product.productName
            theProduct.id = product.productId
            let apps =[]
            product.apps.forEach(app => {
                if(app.checked){
                    apps.push(app.name)
                }
                theProduct.apps = apps
            })
            let features =[]
            product.features.forEach(feature => {
                if(feature.checked){
                    features.push(feature.name)
                }
                theProduct.features = features
            })
            activatedProduct.push(theProduct)
        }
        // console.log(theProduct)
    })
    // console.log(editCode)
    db.collection("codes").doc(editCode.id).update({
        prefixCode : editCode.prefixCode,
        code : editCode.prefixCode+editCode.suffixCode,
        productActivated : activatedProduct,
        notes : editCode.notes,
        products : editCode.products
    })
    .then((codes) => {
        db.collection("codes").get().then(snapshot=>{
            let codes = [];
            snapshot.docs.forEach(code=>{
                code.checked = false;
                codes.push(code)
            })
            setCodes([...codes]);
            callback() 
            if(theOffsetActiveCode || thePageLimitActiveCode){
                setCurrentActiveCodes(codes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode))
            }else{
                setCurrentActiveCodes([...codes])
            }
        })
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

export const handleEditCodes = (editCode,setCodes,callback) => {
    db.collection("codes").doc(editCode.id).update({
        productActivated : editCode.apps,
        notes : editCode.notes,
    })
    .then((codes) => {
        db.collection("codes").get().then(snapshot=>{
            let codes = [];
            snapshot.docs.forEach(code=>{
                code.checked = false;
                codes.push(code)
            })
            setCodes([...codes]);
            callback()
        })
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

export const handleDeleteInactiveCodes = (ids, setCodes,callback,theOffsetInactiveCode,thePageLimitInactiveCode,setCurrentInactiveCodes) =>{  
    // console.log(ids)
    return db.collection("inactiveCodes").get().then((snapshot) => {
        snapshot.docs.forEach((code) => {
            ids.forEach(uid => {
                db.collection("inactiveCodes").doc(uid).delete();
            })
        })
        callback()
    }).then(() => {
        db.collection("inactiveCodes").get().then((snapshot) => {
            let codes =[]
            snapshot.docs.forEach((code) => {
                codes.push(code)
            })
            setCodes([...codes])
            callback()
            if(theOffsetInactiveCode || thePageLimitInactiveCode){
                setCurrentInactiveCodes(codes.slice(theOffsetInactiveCode, theOffsetInactiveCode + thePageLimitInactiveCode))
            }else{
                setCurrentInactiveCodes([...codes])
            }
        })
    }).catch(err=>{
    console.log("ERR",err);
    })
}

export const handleReactiveCode = (code,setCodes,callback,theOffsetInactiveCode,thePageLimitInactiveCode,setCurrentInactiveCodes) => {
    // console.log(code)
    db.collection("codes").add({
        code : code.code,
        dateAdded : new Date().toLocaleString(),
        productActivated : code.apps,
        products : code.products,
        purchasedLocation : code.placeOfPurchase,
        notes : code.notes,
        prefixCode : code.prefixCode,
        suffixCode: code.suffixCode
    })
    .then(() => {
        db.collection("inactiveCodes").doc(code.id).delete()
        .then(() => {
            db.collection("inactiveCodes").get().then(snapshot=>{
                // console.log(snapshot.docs)
                setCodes([...snapshot.docs]);
                if(theOffsetInactiveCode || thePageLimitInactiveCode){
                    setCurrentInactiveCodes(snapshot.docs.slice(theOffsetInactiveCode, theOffsetInactiveCode + thePageLimitInactiveCode))
                }else{
                    setCurrentInactiveCodes([...snapshot.docs])
                }
            })
            // code.checked = false;
            // codes.push(code)
        })
        callback()
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}