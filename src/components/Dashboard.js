import React, { useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "./contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { functions, db } from "../firebase";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [verifyCode, setVerifyCode] = useState("");
  const history = useHistory();
  db.collection("generatedcodes")
    .get()
    .then((snapshot) => {
      console.log(snapshot.docs);
    });
  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  }
  // handleLogout();

  const handleUpdateVerifyCode = (e) => {
    console.log(e.target.value);
    setVerifyCode(e.target.value);
  };

  const handleVerifyCode = () => {
    db.collection("generatedcodes")
      .get()
      .then((snapshot) => {
        console.log();
        let theDoc = null;
        snapshot.docs.forEach((doc) => {
          console.log(doc.data().code);
          if (doc.data().code === verifyCode) {
            theDoc = doc;
          }
        });
        if (!theDoc) {
          alert("this code is not exist");
        } else {
          if (theDoc.data().verified) {
            alert("this code already verified");
          } else {
            db.collection("generatedcodes")
              .doc(theDoc.id)
              .update({
                verified: true,
              })
              .then(() => {
                alert("code verified successfully");
              });
          }
        }
      });
  };
  const generateKey = functions.httpsCallable("generateKey");

  const handleGenerateCode = (procode) => {
    return generateKey({
      userInfo: { email: currentUser.email },
      productCode: procode,
    }).then((result) => {
      console.log(procode);
      console.log("key gen results", result.data.license);
      alert(
        "new code generated based on product and user info" +
          "\n" +
          result.data.license
      );
      db.collection("generatedcodes")
        .get()
        .then((snapshot) => {
          let saved = false;
          snapshot.docs.forEach((doc) => {
            if (doc.data().code == result.data.license) {
              saved = true;
            }
          });
          if (!saved) {
            db.collection("generatedcodes").add({ code: result.data.license });
          }
        });
    });
  };
  return (
    <div>
      <button onClick={handleLogout}>log out </button>
      <div className="verifyCode">
        <input
          type="text"
          value={verifyCode}
          onChange={handleUpdateVerifyCode}
        />
        <button onClick={handleVerifyCode}>verify code</button>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="the-product">
            <h1>product 1</h1>
            <button onClick={() => handleGenerateCode("pro1")}>
              Generate Key
            </button>
          </div>
        </div>
        <div className="col-12">
          <div className="the-product">
            <h1>product 2</h1>
            <button onClick={() => handleGenerateCode("pro2")}>
              Generate Key
            </button>
          </div>
        </div>
        <div className="col-12">
          <div className="the-product">
            <h1>product 3</h1>
            <button onClick={() => handleGenerateCode("pro3")}>
              Generate Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
