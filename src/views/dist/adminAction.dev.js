"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleDeleteAdmins = exports.handleDeleteAdmin = exports.handleEditAdmin = void 0;

var _firebase = require("../firebase");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var handleEditAdmin = function handleEditAdmin(admin, setAdmins, callback, theOffset, thePageLimit, setCurrentAdmins) {
  var theAdmins = []; // console.log(admin)

  return _firebase.db.collection("admins").doc(admin.Uid).update({
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName
  }).then(function () {
    _firebase.db.collection("admins").get().then(function (snapshot) {
      snapshot.docs.forEach(function (user) {
        user.checked = false;
        theAdmins.push(user);
      });
    }).then(function () {
      callback();
      setAdmins([].concat(theAdmins));

      if (theOffset || thePageLimit) {
        setCurrentAdmins(theAdmins.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentAdmins([].concat(theAdmins));
      }
    });
  })["catch"](function (err) {
    console.log("Err is ", err);
  });
};

exports.handleEditAdmin = handleEditAdmin;

var handleDeleteAdmin = function handleDeleteAdmin(uid, setAdmins, callback, theOffset, thePageLimit, setCurrentAdmins) {
  return _firebase.db.collection("admins").doc(uid)["delete"]().then(function () {
    _firebase.db.collection("admins").get().then(function (snapshot) {
      setAdmins(_toConsumableArray(snapshot.docs));

      if (theOffset || thePageLimit) {
        setCurrentAdmins(snapshot.docs.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentAdmins(_toConsumableArray(snapshot.docs));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log("Err is ", err);
  });
};

exports.handleDeleteAdmin = handleDeleteAdmin;

var handleDeleteAdmins = function handleDeleteAdmins(ids, setAdmins, callback, theOffset, thePageLimit, setCurrentAdmins) {
  // console.log("ids", ids)
  var theAdmins = [];
  return _firebase.db.collection("admins").get().then(function () {
    return ids.forEach(function (id) {
      return _firebase.db.collection("admins").doc(id)["delete"]();
    });
  }).then(function () {
    _firebase.db.collection("admins").get().then(function (snapshot) {
      snapshot.docs.forEach(function (admin) {
        admin.checked = false;
        theAdmins.push(admin);
      });
      setAdmins(theAdmins);

      if (theOffset || thePageLimit) {
        setCurrentAdmins(theAdmins.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentAdmins([].concat(theAdmins));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log("Err is ", err);
  });
};

exports.handleDeleteAdmins = handleDeleteAdmins;