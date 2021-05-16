"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleDeleteUsers = exports.handleDeleteUser = exports.handleUpdateUser = void 0;

var _firebase = require("../firebase");

var _AuthContext = require("../components/contexts/AuthContext");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var deleteUser = _firebase.functions.httpsCallable("deleteUser");

var deleteUsers = _firebase.functions.httpsCallable("deleteUsers");

var updateUser = _firebase.functions.httpsCallable("updateUser");

var handleUpdateUser = function handleUpdateUser(user, setUsers, theOffset, thePageLimit, setCurrentUsers) {
  var theUsers = []; // console.log("user is ", user)

  return updateUser(user).then(function (theRecordedUser) {
    // console.log("theRecordedUser",theRecordedUser)
    _firebase.db.collection("users").doc(user.uid).update({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      // userCode:user.userCode,
      products: user.products
    }).then(function () {
      _firebase.db.collection("users").get().then(function (snapshot) {
        snapshot.docs.forEach(function (user) {
          user.checked = false; // user.purchased = false;

          theUsers.push(user);
        });
        setUsers([].concat(theUsers));

        if (theOffset || thePageLimit) {
          setCurrentUsers(theUsers.slice(theOffset, theOffset + thePageLimit));
        } else {
          setCurrentUsers([].concat(theUsers));
        }
      });
    });
  })["catch"](function (err) {
    console.log("Err is ", err);
  });
};

exports.handleUpdateUser = handleUpdateUser;

var handleDeleteUser = function handleDeleteUser(uid, users, i, setUsers, callback, theOffset, thePageLimit, setCurrentUsers) {
  // console.log("useActionI", i,uid)
  users.splice(i, 1);
  setUsers(_toConsumableArray(users));
  return deleteUser({
    uid: uid
  }).then(function () {
    _firebase.db.collection("users").doc(uid)["delete"]();

    callback();

    if (theOffset || thePageLimit) {
      setCurrentUsers(users.slice(theOffset, theOffset + thePageLimit));
    } else {
      setCurrentUsers(_toConsumableArray(users));
    }
  })["catch"](function (err) {
    console.log("Err is ", err);
  });
};

exports.handleDeleteUser = handleDeleteUser;

var handleDeleteUsers = function handleDeleteUsers(ids, setUsers, callback, theOffset, thePageLimit, setCurrentUsers) {
  var theUsers = [];
  return deleteUsers(ids).then(function (res) {
    // console.log("res after deleting users",res);
    ids.forEach(function (uid) {
      _firebase.db.collection("users").doc(uid)["delete"]();
    });
  }).then(function () {
    _firebase.db.collection("users").get().then(function (snapshot) {
      snapshot.docs.forEach(function (user) {
        user.checked = false; // user.purchased = false;

        theUsers.push(user);
      });
      setUsers([].concat(theUsers));

      if (theOffset || thePageLimit) {
        setCurrentUsers(theUsers.slice(theOffset, theOffset + thePageLimit));
      } else {
        setCurrentUsers([].concat(theUsers));
      }
    });

    callback();
  })["catch"](function (err) {
    console.log("ERR", err);
  });
};

exports.handleDeleteUsers = handleDeleteUsers;