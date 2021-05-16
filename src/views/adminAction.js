import { db } from "../firebase";


export const handleEditAdmin = (admin,setAdmins, callback,theOffset,thePageLimit,setCurrentAdmins)=>{
    let theAdmins = []
    // console.log(admin)
    return db.collection("admins").doc(admin.Uid).update({
        email:admin.email,
        firstName:admin.firstName,
        lastName:admin.lastName,
        }).then(()=>{
        db.collection("admins").get().then(snapshot=>{
            snapshot.docs.forEach(user=>{
                user.checked = false;
                theAdmins.push(user)
            })
        }).then(() => {
            
            callback()
            setAdmins([...theAdmins]);
            if(theOffset || thePageLimit){
                setCurrentAdmins(theAdmins.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentAdmins([...theAdmins])
            }
        })
    })
    .catch(err=>{
        console.log("Err is ", err)
    })
}

export const handleDeleteAdmin = (uid,setAdmins, callback,theOffset,thePageLimit,setCurrentAdmins)=>{
    
    return db.collection("admins").doc(uid).delete()
    .then(() => {
        db.collection("admins").get()
        .then(snapshot=>{
          setAdmins([...snapshot.docs]);
          if(theOffset || thePageLimit){
              setCurrentAdmins(snapshot.docs.slice(theOffset, theOffset + thePageLimit))
          }else{
              setCurrentAdmins([...snapshot.docs])
          }
        })
        callback()
    })
    .catch(err=>{
        console.log("Err is ", err)
    })
}


export const handleDeleteAdmins = (ids,setAdmins,callback,theOffset,thePageLimit,setCurrentAdmins) =>{
    // console.log("ids", ids)
    let theAdmins = []
    return db.collection("admins").get()
    .then( () => ids.forEach (id => {
        return db.collection("admins").doc(id).delete();
     }))
     .then(()=>{
        db.collection("admins").get().then(snapshot => {
            snapshot.docs.forEach(admin => {
                 admin.checked = false;
                 theAdmins.push(admin);
            })
            setAdmins(theAdmins);
            if(theOffset || thePageLimit){
                setCurrentAdmins(theAdmins.slice(theOffset, theOffset + thePageLimit))
            }else{
                setCurrentAdmins([...theAdmins])
            }
      })
       callback()
     })
     .catch(err=>{
        console.log("Err is ", err)
    }) 
     
}
