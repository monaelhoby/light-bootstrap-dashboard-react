"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleReactiveCode = exports.handleDeleteInactiveCodes = exports.handleEditCodes = exports.handleEditCode = exports.handleDeleteCodes = exports.handleDeleteCode = exports.handleAddCodes = exports.handleAddCode = void 0;

var _firebase = require("../firebase");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// import {crypto} from 'crypto'
var crypto = require("crypto");

var handleAddCode = function handleAddCode(code, setCodes, callback, theOffsetActiveCode, thePageLimitActiveCode, setCurrentActiveCodes) {
  // console.log(code.lengthCode)
  var length = Number(code.lengthCode);
  var cryptoCode = null;
  cryptoCode = crypto.randomBytes(length).toString("hex");
  cryptoCode = cryptoCode.slice(0, length - code.prefixCode.length); // console.log("before cryptoCode", cryptoCode)

  cryptoCode = cryptoCode.replace(/0|1|o|O|l|L/gi, "e"); // console.log("before cryptoCode", cryptoCode)

  var thePrefix = code.prefixCode;
  thePrefix = thePrefix.replace(/0|1/gi, "e"); // console.log("before thePrefix", thePrefix)

  thePrefix = thePrefix.replace(/0|1|o|O|l|L/gi, "R"); // console.log("before thePrefix", thePrefix)
  // console.log(code.products)

  var activatedProduct = [];
  code.products.forEach(function (product) {
    // console.log(product.productName)
    var theProduct = {};

    if (product.checked == true) {
      theProduct.name = product.productName;
      theProduct.id = product.productId;
      var apps = [];
      product.apps.forEach(function (app) {
        if (app.checked) {
          apps.push(app.name);
        }

        theProduct.apps = apps;
      });
      var features = [];
      product.features.forEach(function (feature) {
        if (feature.checked) {
          features.push(feature.name);
        }

        theProduct.features = features;
      });
      activatedProduct.push(theProduct);
    } // console.log(theProduct)

  });

  _firebase.db.collection("codes").add({
    prefixCode: code.prefixCode,
    code: thePrefix + cryptoCode,
    suffixCode: cryptoCode,
    dateAdded: new Date().toLocaleString(),
    productActivated: activatedProduct,
    products: code.products,
    purchasedLocation: code.purchasedLocation,
    notes: code.notes
  }).then(function () {
    _firebase.db.collection("codes").get().then(function (snapshot) {
      var codes = [];
      snapshot.docs.forEach(function (code) {
        code.checked = false;
        codes.push(code);
      });
      setCodes([].concat(codes));
      callback();

      if (theOffsetActiveCode || thePageLimitActiveCode) {
        setCurrentActiveCodes(codes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode));
      } else {
        setCurrentActiveCodes([].concat(codes));
      }
    });
  })["catch"](function (error) {
    console.error("Error writing document: ", error);
  });
};

exports.handleAddCode = handleAddCode;

var handleAddCodes = function handleAddCodes(code, setCodes, callback, theOffsetActiveCode, thePageLimitActiveCode, setCurrentActiveCodes) {
  var length = Number(code.lengthCode);
  var cryptoCode = null; // console.log(code.products)

  var activatedProduct = [];
  code.products.forEach(function (product) {
    // console.log(product.productName)
    var theProduct = {};

    if (product.checked == true) {
      theProduct.name = product.productName;
      theProduct.id = product.productId;
      var apps = [];
      product.apps.forEach(function (app) {
        if (app.checked) {
          apps.push(app.name);
        }

        theProduct.apps = apps;
      });
      var features = [];
      product.features.forEach(function (feature) {
        if (feature.checked) {
          features.push(feature.name);
        }

        theProduct.features = features;
      });
      activatedProduct.push(theProduct);
    } // console.log(theProduct)

  }); // console.log("activatedProduct", activatedProduct)

  for (var i = 0; i < code.quantity; i++) {
    cryptoCode = crypto.randomBytes(length).toString("hex");
    cryptoCode = cryptoCode.slice(0, length - code.prefixCode.length); // console.log("before cryptoCode", cryptoCode)

    cryptoCode = cryptoCode.replace(/0|1|o|O|l|L/gi, "e"); // console.log("before cryptoCode", cryptoCode)

    var thePrefix = code.prefixCode;
    thePrefix = thePrefix.replace(/0|1/gi, "e"); // console.log("before thePrefix", thePrefix)

    thePrefix = thePrefix.replace(/0|1|o|O|l|L/gi, "R"); // console.log("before thePrefix", thePrefix)

    _firebase.db.collection("codes").add({
      prefixCode: code.prefixCode,
      code: thePrefix + cryptoCode,
      dateAdded: new Date().toLocaleString(),
      productActivated: activatedProduct,
      purchasedLocation: code.purchasedLocation,
      notes: code.notes,
      products: code.products,
      suffixCode: cryptoCode
    }).then(function () {
      _firebase.db.collection("codes").get().then(function (snapshot) {
        var codes = [];
        snapshot.docs.forEach(function (code) {
          code.checked = false;
          codes.push(code);
        });
        setCodes(_toConsumableArray(snapshot.docs));
        callback();

        if (theOffsetActiveCode || thePageLimitActiveCode) {
          setCurrentActiveCodes(snapshot.docs.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode));
        } else {
          setCurrentActiveCodes(_toConsumableArray(snapshot.docs));
        }
      });
    })["catch"](function (error) {
      console.error("Error writing document: ", error);
    });
  }
};

exports.handleAddCodes = handleAddCodes;

var handleDeleteCode = function handleDeleteCode(code, setCodes, callback, theOffsetActiveCode, thePageLimitActiveCode, setCurrentActiveCodes) {
  _firebase.db.collection("codes").doc(code.id)["delete"]().then(function () {
    _firebase.db.collection("codes").get().then(function (snapshot) {
      setCodes(_toConsumableArray(snapshot.docs));

      if (theOffsetActiveCode || thePageLimitActiveCode) {
        setCurrentActiveCodes(snapshot.docs.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode));
      } else {
        setCurrentActiveCodes(_toConsumableArray(snapshot.docs));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log(err);
  });
};

exports.handleDeleteCode = handleDeleteCode;

var handleDeleteCodes = function handleDeleteCodes(ids, setCodes, callback, theOffsetActiveCode, thePageLimitActiveCode, setCurrentActiveCodes) {
  var theCodes = [];
  return _firebase.db.collection("codes").get().then(function (snapshot) {
    snapshot.docs.forEach(function (code) {
      var codes = [];
      ids.forEach(function (uid) {
        _firebase.db.collection("codes").doc(uid)["delete"]();

        codes.push(code);
      });
    });
  }).then(function () {
    _firebase.db.collection("codes").get().then(function (snapshot) {
      snapshot.docs.forEach(function (code) {
        code.checked = false;
        theCodes.push(code);
      });
      setCodes([].concat(theCodes));

      if (theOffsetActiveCode || thePageLimitActiveCode) {
        setCurrentActiveCodes(theCodes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode));
      } else {
        setCurrentActiveCodes([].concat(theCodes));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log("ERR", err);
  });
};

exports.handleDeleteCodes = handleDeleteCodes;

var handleEditCode = function handleEditCode(editCode, setCodes, callback, theOffsetActiveCode, thePageLimitActiveCode, setCurrentActiveCodes) {
  // console.log("editCode", editCode)
  var activatedProduct = [];
  editCode.products.forEach(function (product) {
    // console.log(product.productName)
    var theProduct = {};

    if (product.checked == true) {
      theProduct.name = product.productName;
      theProduct.id = product.productId;
      var apps = [];
      product.apps.forEach(function (app) {
        if (app.checked) {
          apps.push(app.name);
        }

        theProduct.apps = apps;
      });
      var features = [];
      product.features.forEach(function (feature) {
        if (feature.checked) {
          features.push(feature.name);
        }

        theProduct.features = features;
      });
      activatedProduct.push(theProduct);
    } // console.log(theProduct)

  }); // console.log(editCode)

  _firebase.db.collection("codes").doc(editCode.id).update({
    prefixCode: editCode.prefixCode,
    code: editCode.prefixCode + editCode.suffixCode,
    productActivated: activatedProduct,
    notes: editCode.notes,
    products: editCode.products
  }).then(function (codes) {
    _firebase.db.collection("codes").get().then(function (snapshot) {
      var codes = [];
      snapshot.docs.forEach(function (code) {
        code.checked = false;
        codes.push(code);
      });
      setCodes([].concat(codes));
      callback();

      if (theOffsetActiveCode || thePageLimitActiveCode) {
        setCurrentActiveCodes(codes.slice(theOffsetActiveCode, theOffsetActiveCode + thePageLimitActiveCode));
      } else {
        setCurrentActiveCodes([].concat(codes));
      }
    });
  })["catch"](function (error) {
    console.error("Error writing document: ", error);
  });
};

exports.handleEditCode = handleEditCode;

var handleEditCodes = function handleEditCodes(editCode, setCodes, callback) {
  _firebase.db.collection("codes").doc(editCode.id).update({
    productActivated: editCode.apps,
    notes: editCode.notes
  }).then(function (codes) {
    _firebase.db.collection("codes").get().then(function (snapshot) {
      var codes = [];
      snapshot.docs.forEach(function (code) {
        code.checked = false;
        codes.push(code);
      });
      setCodes([].concat(codes));
      callback();
    });
  })["catch"](function (error) {
    console.error("Error writing document: ", error);
  });
};

exports.handleEditCodes = handleEditCodes;

var handleDeleteInactiveCodes = function handleDeleteInactiveCodes(ids, setCodes, callback, theOffsetInactiveCode, thePageLimitInactiveCode, setCurrentInactiveCodes) {
  // console.log(ids)
  return _firebase.db.collection("inactiveCodes").get().then(function (snapshot) {
    snapshot.docs.forEach(function (code) {
      ids.forEach(function (uid) {
        _firebase.db.collection("inactiveCodes").doc(uid)["delete"]();
      });
    });
    callback();
  }).then(function () {
    _firebase.db.collection("inactiveCodes").get().then(function (snapshot) {
      var codes = [];
      snapshot.docs.forEach(function (code) {
        codes.push(code);
      });
      setCodes([].concat(codes));
      callback();

      if (theOffsetInactiveCode || thePageLimitInactiveCode) {
        setCurrentInactiveCodes(codes.slice(theOffsetInactiveCode, theOffsetInactiveCode + thePageLimitInactiveCode));
      } else {
        setCurrentInactiveCodes([].concat(codes));
      }
    });
  })["catch"](function (err) {
    console.log("ERR", err);
  });
};

exports.handleDeleteInactiveCodes = handleDeleteInactiveCodes;

var handleReactiveCode = function handleReactiveCode(code, setCodes, callback, theOffsetInactiveCode, thePageLimitInactiveCode, setCurrentInactiveCodes) {
  // console.log(code)
  _firebase.db.collection("codes").add({
    code: code.code,
    dateAdded: new Date().toLocaleString(),
    productActivated: code.apps,
    products: code.products,
    purchasedLocation: code.placeOfPurchase,
    notes: code.notes,
    prefixCode: code.prefixCode,
    suffixCode: code.suffixCode
  }).then(function () {
    _firebase.db.collection("inactiveCodes").doc(code.id)["delete"]().then(function () {
      _firebase.db.collection("inactiveCodes").get().then(function (snapshot) {
        // console.log(snapshot.docs)
        setCodes(_toConsumableArray(snapshot.docs));

        if (theOffsetInactiveCode || thePageLimitInactiveCode) {
          setCurrentInactiveCodes(snapshot.docs.slice(theOffsetInactiveCode, theOffsetInactiveCode + thePageLimitInactiveCode));
        } else {
          setCurrentInactiveCodes(_toConsumableArray(snapshot.docs));
        }
      }); // code.checked = false;
      // codes.push(code)

    });

    callback();
  })["catch"](function (error) {
    console.error("Error writing document: ", error);
  });
};

exports.handleReactiveCode = handleReactiveCode;