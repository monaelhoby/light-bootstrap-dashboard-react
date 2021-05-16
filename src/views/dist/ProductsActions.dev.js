"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleDeleteProducts = exports.deleteProductFromUsers = exports.handleDeleteProduct = exports.handleAddNewProduct = exports.handleEditProduct = void 0;

var _firebase = require("../firebase");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var handleEditProduct = function handleEditProduct(editableProduct, setProducts, callback, theOffset, thePageLimit, setCurrentProducts) {
  // console.log("editableProduct",editableProduct)
  _firebase.db.collection("products").doc(editableProduct.id).update({
    name: editableProduct.name,
    purchasedUrl: editableProduct.purchasedUrl,
    unpurchasedUrl: editableProduct.unpurchasedUrl,
    visibility: editableProduct.visibility,
    productIcon: editableProduct.productIcon,
    description: editableProduct.description,
    id: editableProduct.id,
    apps: editableProduct.apps,
    features: editableProduct.features
  }).then(function () {
    _firebase.db.collection("products").get().then(function (snapshot) {
      // console.log(snapshot.docs[0].data())
      setProducts(_toConsumableArray(snapshot.docs));
      updateProductsinUsers(editableProduct); // updateProductsinCodes(editableProduct)

      callback();

      if (theOffset || thePageLimit) {
        setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentProducts(_toConsumableArray(snapshot.docs));
      }
    });
  })["catch"](function (err) {
    console.log(err);
  });
};

exports.handleEditProduct = handleEditProduct;

var handleAddNewProduct = function handleAddNewProduct(addedProduct, setProducts, callback, theOffset, thePageLimit, setCurrentProducts) {
  // console.log(addedProduct)
  _firebase.db.collection("products").add({
    name: addedProduct.name,
    description: addedProduct.description,
    purchasedUrl: addedProduct.purchasedUrl,
    unpurchasedUrl: addedProduct.unpurchasedUrl,
    visibility: addedProduct.visibility,
    productIcon: addedProduct.productIcon,
    apps: addedProduct.apps[0].name.length ? addedProduct.apps : null,
    features: addedProduct.features[0].name.length ? addedProduct.features : null // id : addedProduct.id

  }).then(function (newProduct) {
    _firebase.db.collection("products").get().then(function (snapshot) {
      var products = [];
      snapshot.docs.forEach(function (product) {
        product.checked = false;
        products.push(product);
      });
      setProducts([].concat(products)); // console.log("addedProduct", addedProduct)

      addNewProductToUsers(addedProduct, newProduct.id);
      callback();

      if (theOffset || thePageLimit) {
        setCurrentProducts(products.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentProducts([].concat(products));
      }
    });
  })["catch"](function (error) {
    console.error("Error writing document: ", error);
  });
};

exports.handleAddNewProduct = handleAddNewProduct;

var handleDeleteProduct = function handleDeleteProduct(product, setProducts, callback, theOffset, thePageLimit, setCurrentProducts) {
  // console.log(product.id)
  _firebase.db.collection("products").doc(product.id)["delete"]().then(function () {
    _firebase.db.collection("products").get().then(function (snapshot) {
      setProducts(_toConsumableArray(snapshot.docs));
      deleteProductFromUsers(product.data().name);

      if (theOffset || thePageLimit) {
        setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentProducts(_toConsumableArray(snapshot.docs));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log(err);
  });
};

exports.handleDeleteProduct = handleDeleteProduct;

var updateProductsinUsers = function updateProductsinUsers(product) {
  _firebase.db.collection("users").get().then(function (snapshot) {
    snapshot.docs.forEach(function (user) {
      var products = user.data().products.filter(function (p) {
        return product.id !== p.id;
      });
      var oldProduct = user.data().products.find(function (p) {
        // console.log("p.id", p.id)
        // console.log("product.id", product.id)
        return product.id == p.id;
      }); // console.log("old product is",oldProduct)

      var theNewProduct = {};
      theNewProduct.name = product.name;
      theNewProduct.purchasedUrl = product.purchasedUrl;
      theNewProduct.unpurchasedUrl = product.unpurchasedUrl;
      theNewProduct.visibility = product.visibility;
      theNewProduct.description = product.description, theNewProduct.productIcon = product.productIcon, theNewProduct.id = product.id;
      theNewProduct.apps = [];
      theNewProduct.features = [];
      product.apps ? product.apps.forEach(function (a) {
        var exist = false;
        var generatedApp = {};
        oldProduct ? oldProduct.apps.forEach(function (app) {
          generatedApp.name = a.name;
          generatedApp.tag = a.tag;
          generatedApp.inActiveUrl = a.inActiveUrl;
          generatedApp.activeUrl = a.activeUrl;
          generatedApp.appIcon = a.appIcon;

          if (app.name == a.name) {
            // console.log(a)
            exist = true;
            generatedApp.active = app.active;
            generatedApp.comments = a.comment ? a.comment : "";
            generatedApp.purchased = app.purchased;
            generatedApp.credentials = app.credentials;
            generatedApp.expireDate = app.expireDate;
            generatedApp.timesAppLaunchedLastLogin = app.timesAppLaunchedLastLogin;
            generatedApp.timesAppLaunchedPurchased = app.timesAppLaunchedPurchased;
            generatedApp.lastLaunchDate = app.lastLaunchDate;
            generatedApp.timesAppLaunched = app.timesAppLaunched;
            generatedApp.deviceId = app.deviceId;
            generatedApp.activatedOn = app.activatedOn;
            generatedApp.codeUsed = app.codeUsed;
            generatedApp.DateofLastUse = app.DateofLastUse;
            generatedApp.LaunchesSinceActive = app.LaunchesSinceActive;
          }
        }) : null;

        if (!exist) {
          generatedApp.active = false;
          generatedApp.comments = "";
          generatedApp.purchased = false;
          generatedApp.credentials = false;
          generatedApp.expireDate = "";
          generatedApp.timesAppLaunchedLastLogin = "";
          generatedApp.timesAppLaunchedPurchased = "";
          generatedApp.lastLaunchDate = "";
          generatedApp.timesAppLaunched = "";
          generatedApp.deviceId = "";
          generatedApp.activatedOn = "";
          generatedApp.codeUsed = "";
          generatedApp.DateofLastUse = "";
          generatedApp.LaunchesSinceActive = "";
        }

        theNewProduct.apps.push(generatedApp);
      }) : null;
      product.features ? product.features.forEach(function (a) {
        var exist = false;
        var generatedFeature = {};
        oldProduct ? oldProduct.features.forEach(function (feature) {
          // console.log("a:",a)
          // console.log("feature:",feature)
          // console.log(a)
          exist = true;
          generatedFeature.name = a.name;
          generatedFeature.tag = a.tag;
          generatedFeature.activeUrl = a.activeUrl;
          generatedFeature.inActiveUrl = a.inActiveUrl;

          if (feature.name == a.name) {
            // console.log(a)
            exist = true;
            generatedFeature.comments = a.comment ? a.comment : "";
            generatedFeature.active = feature.active ? feature.active : false;
            generatedFeature.purchased = feature.purchased ? feature.purchased : false;
            generatedFeature.expireDate = feature.expireDate ? feature.expireDate : "30/3/2021";
            generatedFeature.activatedOn = feature.activatedOn ? feature.activatedOn : '12/28/2020 @ 5:45pm : "1.23.456.5"';
            generatedFeature.codeUsed = feature.codeUsed ? feature.codeUsed : '123456789';
          }
        }) : null;

        if (!exist) {
          generatedFeature.comments = "";
          generatedFeature.active = false;
          generatedFeature.purchased = false;
          generatedFeature.expireDate = "30/3/2021";
          generatedFeature.activatedOn = '12/28/2020 @ 5:45pm : "1.23.456.5"';
          generatedFeature.codeUsed = '123456789';
        }

        theNewProduct.features.push(generatedFeature);
      }) : null;
      products.push(theNewProduct); // console.log(products)

      _firebase.db.collection("users").doc(user.id).set({
        products: products
      }, {
        merge: true
      });
    });
  });
};

var deleteProductFromUsers = function deleteProductFromUsers(productName) {
  var products = [];

  _firebase.db.collection("users").get().then(function (snapshot) {
    snapshot.docs.forEach(function (user) {
      products = user.data().products.filter(function (product) {
        // console.log(product.name, productName)
        return product.name !== productName;
      }); // console.log("products is : ",products)

      _firebase.db.collection("users").doc(user.id).set({
        products: products
      }, {
        merge: true
      });
    });
  });
};

exports.deleteProductFromUsers = deleteProductFromUsers;

var addNewProductToUsers = function addNewProductToUsers(product, productId) {
  _firebase.db.collection("users").get().then(function (snapshot) {
    // console.log(productId)
    var theProduct = {};
    theProduct.name = product.name;
    theProduct.purchasedUrl = product.purchasedUrl;
    theProduct.unpurchasedUrl = product.unpurchasedUrl;
    theProduct.visibility = product.visibility;
    theProduct.productIcon = product.productIcon, theProduct.description = product.description, theProduct.apps = [];
    theProduct.features = [];
    theProduct.id = productId; // theProduct.id = product.id;

    if (product.apps[0].name.length) {
      product.apps.forEach(function (app) {
        theProduct.apps.push({
          name: app.name,
          activeUrl: app.activeUrl ? app.activeUrl : "",
          inActiveUrl: app.inActiveUrl ? app.inActiveUrl : "",
          tag: app.tag ? app.tag : "",
          appIcon: app.appIcon ? app.appIcon : "",
          active: app.active ? app.active : false,
          purchased: app.purchased ? app.purchased : false,
          credentials: app.credentials ? app.credentials : "",
          expireDate: app.expireDate ? app.expireDate : "",
          timesAppLaunchedLastLogin: app.timesAppLaunchedLastLogin ? app.timesAppLaunchedLastLogin : "",
          timesAppLaunchedPurchased: app.timesAppLaunchedPurchased ? app.timesAppLaunchedPurchased : "",
          lastLaunchDate: app.lastLaunchDate ? app.lastLaunchDate : "",
          timesAppLaunched: app.timesAppLaunched ? app.timesAppLaunched : "",
          deviceId: "9876543",
          activatedOn: app.activatedOn ? app.activatedOn : "",
          codeUsed: "9876543",
          DateofLastUse: app.DateofLastUse ? app.DateofLastUse : "",
          LaunchesSinceActive: app.LaunchesSinceActive ? app.LaunchesSinceActive : ""
        });
      });
    }

    if (product.features[0].name.length) {
      product.features.forEach(function (feature) {
        theProduct.features.push({
          name: feature.name,
          activeUrl: feature.activeUrl ? feature.activeUrl : "",
          inActiveUrl: feature.inActiveUrl ? feature.inActiveUrl : "",
          tag: feature.tag ? feature.tag : "",
          active: false,
          purchased: false,
          expireDate: "",
          activatedOn: "",
          codeUsed: "9876543"
        });
      });
    }

    snapshot.docs.forEach(function (user) {
      var products = user.data().products;
      products.push(theProduct);

      _firebase.db.collection("users").doc(user.id).set({
        products: products
      }, {
        merge: true
      });
    });
  });
}; // const updateProductsinCodes = (product)=>{
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


var handleDeleteProducts = function handleDeleteProducts(ids, setProducts, callback, theOffset, thePageLimit, setCurrentProducts) {
  // console.log(ids)
  var products = [];
  return _firebase.db.collection("products").get().then(function (snapshot) {
    snapshot.docs.forEach(function () {
      ids.forEach(function (uid) {
        _firebase.db.collection("products").doc(uid)["delete"]();
      });
    });
  }).then(function () {
    _firebase.db.collection("products").get().then(function (snapshot) {
      products = _toConsumableArray(snapshot.docs);
      setProducts(_toConsumableArray(snapshot.docs));
      callback();

      if (theOffset || thePageLimit) {
        setCurrentProducts(snapshot.docs.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentProducts(_toConsumableArray(snapshot.docs));
      }
    }).then(function () {
      // console.log(products)
      var theProducts = [];
      var theProduct = {};
      products.forEach(function (p) {
        theProduct.id = p.id;
        theProduct.name = p.data().name;
        theProduct.apps = p.data().apps;
        theProduct.features = p.data().features;
        theProduct.description = p.data().description;
        theProduct.visibility = p.data().visibility;
        theProduct.productIcon = p.data().productIcon;
        theProduct.purchasedUrl = p.data().purchasedUrl;
        theProduct.unpurchasedUrl = p.data().unpurchasedUrl;
        theProducts.push(theProduct);
      });

      _firebase.db.collection("users").get().then(function (snapshot) {
        snapshot.docs.forEach(function (user) {
          // console.log("user is : ",theProducts)
          _firebase.db.collection("users").doc(user.id).set({
            products: theProducts
          }, {
            merge: true
          });
        });
      });
    });
  })["catch"](function (err) {
    console.log("ERR", err);
  });
}; // const resetUsersDetails = () =>{
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


exports.handleDeleteProducts = handleDeleteProducts;