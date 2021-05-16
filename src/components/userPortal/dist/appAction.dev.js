"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleInactiveCode = exports.handleDeactiveAllApps = exports.handleDeactiveApp = void 0;

var _firebase = require("../../firebase");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var handleDeactiveApp = function handleDeactiveApp(user, product, theApp, setUser) {
  // console.log(theApp)
  var newUser = user;
  var editableProduct = newUser.products.find(function (p) {
    return p.name == product.name;
  });
  newUser.products = newUser.products.filter(function (p) {
    return p.name !== product.name;
  });
  editableProduct.apps.forEach(function (app) {
    // console.log(app.name,theApp.name)
    if (app.name == theApp.name) {
      app.deviceId = "";
    }
  });
  newUser.products.push(editableProduct);
  setUser(_objectSpread({}, newUser));
  return _firebase.db.collection('users').doc(user.id).set(newUser);
};

exports.handleDeactiveApp = handleDeactiveApp;

var handleDeactiveAllApps = function handleDeactiveAllApps(user, product, setUser, callback) {
  var newUser = user;
  var editableProduct = newUser.products.find(function (p) {
    return p.name == product.name;
  });
  newUser.products = newUser.products.filter(function (p) {
    return p.name !== product.name;
  });
  editableProduct.apps.forEach(function (app) {
    app.deviceId = "";
  });
  newUser.products.push(editableProduct);
  setUser(_objectSpread({}, newUser));
  callback();
  return _firebase.db.collection('users').doc(user.id).set(newUser);
};

exports.handleDeactiveAllApps = handleDeactiveAllApps;

var handleInactiveCode = function handleInactiveCode(code, prefixCode, theUser, theCodeObject, callback, setCode, setProductsActivated) {
  //   console.log("theCodeObject: ",theCodeObject.data(),"theUser",theUser)
  _firebase.db.collection("codes").get().then(function (snapshot) {
    var activeCodeObject = {};
    snapshot.docs.forEach(function (oneCode) {
      if (Array.isArray(oneCode.data().code)) {
        var activeCode = "";
        activeCode = oneCode.data().code.find(function (singleCode) {
          return singleCode == code;
        });

        if (activeCode) {
          activeCodeObject = oneCode.data();
        }
      } else if (!Array.isArray(oneCode.data().code)) {
        if (oneCode.data().code == code) {
          activeCodeObject = oneCode.data();
        } else {
          return;
        }
      }
    });

    _firebase.db.collection("inactiveCodes").add({
      inactiveCode: code,
      activatedBy: theUser.email,
      firstName: theUser.firstName,
      lastName: theUser.lastName,
      prefixCode: prefixCode,
      dataAdded: new Date().toLocaleString(),
      placeOfPurchase: theCodeObject.data().purchasedLocation,
      productActivated: theCodeObject.data().productActivated,
      products: theCodeObject.data().products,
      notes: theCodeObject.data().notes,
      suffixCode: theCodeObject.data().suffixCode
    }).then(function () {
      // console.log(theCodeObject.data().productActivated)
      _firebase.db.collection("codes").doc(theCodeObject.id)["delete"]();

      updateAppsinUser(theCodeObject.data().productActivated, theUser.id, code, setProductsActivated);
      setCode("");
      callback(); // window.location.reload(false);
    });
  })["catch"](function (err) {
    console.log(err);
  });
};

exports.handleInactiveCode = handleInactiveCode;

var updateAppsinUser = function updateAppsinUser(productsActivated, id, code, setProductsActivated) {
  _firebase.db.collection("users").doc(id).get().then(function (snapshot) {
    var allProducts = snapshot.data().products; // console.log("allProducts before",productsActivated);

    productsActivated ? productsActivated.forEach(function (product) {
      product.apps ? product.apps.forEach(function (acivatedApp) {
        allProducts.forEach(function (piu, i) {
          if (piu.name === product.name) {
            piu.apps.forEach(function (app, j) {
              if (app.name === acivatedApp) {
                allProducts[i].apps[j].purchased = true;
                allProducts[i].apps[j].codeUsed = code;
                allProducts[i].apps[j].activatedOn = new Date().toLocaleString();
              }
            });
          }
        });
      }) : null;
      product.features ? product.features.forEach(function (activatedFeature) {
        allProducts.forEach(function (piu, i) {
          if (piu.name === product.name) {
            piu.features.forEach(function (feature, k) {
              if (feature.name === activatedFeature) {
                allProducts[i].features[k].purchased = true;
                allProducts[i].features[k].codeUsed = code;
                allProducts[i].features[k].activatedOn = new Date().toLocaleString();
              }
            });
          }
        });
      }) : null;
    }) : null; // console.log("allProducts after",allProducts)

    setProductsActivated(allProducts);

    _firebase.db.collection("users").doc(id).set({
      products: allProducts
    }, {
      merge: true
    });
  })["catch"](function (err) {
    console.log(err);
  });
};