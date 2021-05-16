import { functions, db } from "../firebase";
import { useAuth } from "../components/contexts/AuthContext"
const deleteUser  = functions.httpsCallable("deleteUser");
const deleteUsers = functions.httpsCallable("deleteUsers");
const updateUser  = functions.httpsCallable("updateUser");

export const handleUpdateUser = (user,setUsers,theOffset,thePageLimit,setCurrentUsers)=>{
    let theUsers = [];
    // console.log("user is ", user)
    return updateUser(user)
    .then((theRecordedUser)=>{
        // console.log("theRecordedUser",theRecordedUser)
        db.collection("users").doc(user.uid).update({
            email:user.email,
            password:user.password,
            firstName:user.firstName,
            lastName:user.lastName,
            // userCode:user.userCode,
            products:user.products
        }).then(()=>{
            db.collection("users").get().then(snapshot=>{
                snapshot.docs.forEach(user=>{
                    user.checked = false;
                    // user.purchased = false;
                    theUsers.push(user);
                })
                setUsers([...theUsers]);
                if(theOffset || thePageLimit){
                    setCurrentUsers(theUsers.slice(theOffset, theOffset + thePageLimit))
                  }else{
                    setCurrentUsers([...theUsers])
                  }
            })
        })
    })
    .catch(err=>{
        console.log("Err is ", err)
    })
}

export const handleDeleteUser = (uid,users,i,setUsers,callback,theOffset,thePageLimit,setCurrentUsers)=>{
    // console.log("useActionI", i,uid)
    users.splice(i, 1);
    setUsers([...users]);

    return deleteUser({uid:uid})
    .then(()=>{
        db.collection("users").doc(uid).delete();
        callback() 
        if(theOffset || thePageLimit){
            setCurrentUsers(users.slice(theOffset, theOffset + thePageLimit))
        }else{
            setCurrentUsers([...users])
        }
    })
    .catch(err=>{
        console.log("Err is ", err)
    })
}

export const handleDeleteUsers = (ids,setUsers, callback,theOffset,thePageLimit,setCurrentUsers) =>{
    let theUsers = [];
    return deleteUsers(ids)
    .then(res=>{
        // console.log("res after deleting users",res);
        ids.forEach(uid => {
            db.collection("users").doc(uid).delete();
        });
    }).then(() => {
        db.collection("users").get().then(snapshot=>{
            snapshot.docs.forEach(user=>{
                user.checked = false;
                // user.purchased = false;
                theUsers.push(user);
            })
            setUsers([...theUsers]);
            if(theOffset || thePageLimit){
                setCurrentUsers(theUsers.slice(theOffset, theOffset + thePageLimit))
              }else{
                setCurrentUsers([...theUsers])
              }
        })
        callback()
    }).catch(err=>{
        console.log("ERR",err);
    })
}



