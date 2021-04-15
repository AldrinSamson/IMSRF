const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const handlebars = require('handlebars');
const fs = require('fs')
const rxjs = require('rxjs')
const path = require('path');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
admin.initializeApp({
    credential: admin.credential.applicationDefault(), //FOR PROD
    //credential: admin.credential.cert('C:/Workspace/mcfam-server/MCFAM SYSTEMS-2ae2a0f0f5fa.json'), //FOR DEV
    apiKey: 'AIzaSyDIYbOsXILVC4CPoNoSvMEHycBxx1LAGqs',
    authDomain: 'imsrf-dev.firebaseapp.com',
    databaseURL: 'https://imsrf-dev.firebaseio.com',
    projectId: 'imsrf-dev',
    storageBucket: 'imsrf-dev.appspot.com',
    })

const db = admin.firestore()

// var readHTMLFile = function(path, callback) {
//   fs.readFile(path, {encoding: 'utf-8'}, (err, html) => {
//       if (err) {
//           throw err;
//       }
//       else {
//           return callback(null, html);
//       }
//   });
// };

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'imsrf.dev@gmail.com',
        pass: 'IMSRF2020'
    }
});

async function sendEmail(mailOptions , templateDIR, replacements ) {

  var directory = '/views/' + templateDIR + '.handlebars'
  const filePath = path.join(__dirname, directory);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(replacements);
  mailOptions.html = htmlToSend

  return new Promise((resolve,reject)=>{
    transporter.sendMail(mailOptions, (erro, info) => {
      if(erro){
        console.log(erro.toString());
        resolve(400);
      }
        console.log(String('Succesfully Sent to '+ mailOptions.to));
        resolve(String('Succesfully Sent to '+ mailOptions.to));
    });
  })
    
    
}

function userFilter(users, institution, withAdmin) {
  if (withAdmin) {
    return users.filter((x) => {
      return x.partnerID === institution || x.position === 'System Admin';
    });
  } else {
    return users.filter((x) => {
      return x.partnerID === institution;
    });
  }

}

// TODO: Upgrade to use 0AUTH2
exports.sendMail = functions.https.onRequest((req, res) => {
    console.log(req.body);
    cors(req, res, async () => {

        if (!req.body.subject || !req.body.template || !req.body.replacements) {
            return res.status(422).send({
              error: {
                code: 422,
                message: "Missing arguments"
              }
            });
        }

        console.log(req.body);

        const mailOptions = {
            from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
            to: req.body.email,
            subject: req.body.subject
        };

        let resp= await sendEmail(mailOptions, req.body.template, req.body.replacements)
        return res.send(resp)
       
    });
    console.log('done')
});

// depreciated
// exports.broadcastEmail = functions.https.onRequest((req, res) => {

//   cors(req, res,async () => {
//     await db.collection('user').get().then(querySnapshot => {
//       if (querySnapshot.empty) {
//         return res.send("No Users")
//       } else {
//         return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
//       }
//     });

//     const recipients = users.filter((x) => {
//       return x.partnerID === req.body.institution || x.position === 'System Admin';
//     });

//       if (!req.body.subject || !req.body.message) {
//           return res.status(422).send({
//             error: {
//               code: 422,
//               message: "Missing arguments"
//             }
//           });
//       }

//       // eslint-disable-next-line no-cond-assign
//       for (var recipient, i = 0; recipient = recipients[i++];) {
//         const mailOptions = {
//           from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
//           to: req.body.email,
//           subject: req.body.subject
//         };

//         sendEmail(mailOptions, req.body.template, req.body.replacements)
//       }
//       return res.send("More Work?");
//   });
// });

exports.broadcastToPositionEmail = functions.https.onRequest((req, res) => {

  cors(req, res,async () => {
    await db.collection('user').get().then(querySnapshot => {
      if (querySnapshot.empty) {
        return res.send("No Users")
      } else {
        return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });

    if (!req.body.subject || !req.body.template || !req.body.replacements || !req.body.position) {
      return res.status(422).send({
        error: {
          code: 422,
          message: "Missing arguments"
        }
      });
    }

    const recipients = users.filter((x) => {
      return x.position === req.body.position;
    });

      // eslint-disable-next-line no-cond-assign
      for (var recipient, i = 0; recipient = recipients[i++];) {
        const mailOptions = {
          from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: req.body.subject
        };

        var replacements = req.body.replacements
        replacements.username = recipient.fullName
        replacements.institutionName = recipient.institutionName

        sendEmail(mailOptions, req.body.template, replacements)
      }
      return res.send("More Work?");
  });
});

exports.broadcastToPartnerEmail = functions.https.onRequest((req, res) => {

  cors(req, res,async () => {
    await db.collection('user').get().then(querySnapshot => {
      if (querySnapshot.empty) {
        return res.send("No Users")
      } else {
        return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });

    if (!req.body.subject || !req.body.template || !req.body.replacements || !req.body.partnerID) {
      return res.status(422).send({
        error: {
          code: 422,
          message: "Missing arguments"
        }
      });
    }

    const recipients = users.filter((x) => {
      return x.parnterID === req.body.parnterID;
    });

      // eslint-disable-next-line no-cond-assign
      for (var recipient, i = 0; recipient = recipients[i++];) {
        const mailOptions = {
          from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: req.body.subject
        };

        var replacements = req.body.replacements
        replacements.username = recipient.fullName
        replacements.institutionName = recipient.institutionName

        sendEmail(mailOptions, req.body.template, replacements)
      }
      return res.send("More Work?");
  });
});


exports.terminateUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        if (!req.body.uid) {
            return res.status(422).send({
              error: {
                code: 422,
                message: "Missing arguments"
              }
            });
        }

        const uid = req.body.uid;

        return admin.auth().deleteUser(uid)
        .then(() =>  {
            return res.send('Successfully deleted user');
            })
        .catch((error) =>  {
            console.log('Error deleting user:', error);
            return res.send('Error deleting user:', error);
        });
    });
});

exports.expiryChecker = functions.https.onRequest( async(req, res) => {

    // get UTC +8 timezone
    const date = new Date();
    const utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()-1,
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    const dateToday = new Date(utc + 28800000);
    // set to midnight
    dateToday.setHours(8,0,0,0);

    // date ranges
    let dateTodayStart = new Date(dateToday.getTime());
    let dateTodayEnd = new Date(dateToday.getTime());
    let weekAwayStart = new Date(dateToday.getTime());
    let weekAwayEnd = new Date(dateToday.getTime());
    let fortnightAwayStart = new Date(dateToday.getTime());
    let fortnightAwayEnd = new Date(dateToday.getTime());
    dateTodayEnd.setDate(dateTodayEnd.getDate() + 1);
    weekAwayStart.setDate(weekAwayStart.getDate() + 7);
    weekAwayEnd.setDate(weekAwayEnd.getDate() + 8);
    fortnightAwayStart.setDate(fortnightAwayStart.getDate() + 14);
    fortnightAwayEnd.setDate(fortnightAwayEnd.getDate() + 15);

    console.log(dateToday)

    // Query Data
    let expireTodayEmpty = false;
    let expireWeekAwayEmpty = false;
    let expireFortnightAwayEmpty = false;

    let users;
    let expireToday;
    let expireWeekAway;
    let expireFortnightAway;

    await db.collection('inventory').where('dateExpiry', '>', dateTodayStart).where('dateExpiry', '<', dateTodayEnd).get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        return expireTodayEmpty = true;
      } else {
        return expireToday = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('inventory').where('dateExpiry', '>', weekAwayStart).where('dateExpiry', '<', weekAwayEnd).get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        return expireWeekAwayEmpty = true;
      } else {
        return expireWeekAway = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('inventory').where('dateExpiry', '>', fortnightAwayStart).where('dateExpiry', '<', fortnightAwayEnd).get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        return expireFortnightAwayEmpty = true;
      } else {
        return expireFortnightAway = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('user').get().then(querySnapshot => {
      if (querySnapshot.empty) {
        return res.send("No Users")
      } else {
        return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });


    // get active instituion list
    var lookup = {};
    var institutions = [];
    var institutionsNameRef = [];
    const exempt = "N/A"
    const exempt2 = "The Redbank Foundation"

    // eslint-disable-next-line no-cond-assign
    for (var item, i = 0; item = users[i++];) {
      var institutionID = item.partnerID;
      var institutionName = item.institutionName;

      if (!(institutionID in lookup)) {
        lookup[institutionID] = 1;
        if ( institutionID !== exempt) {
          institutions.push(institutionID);
        }
      }

      if (!(institutionName in lookup)) {
        lookup[institutionName] = 1;
        if ( institutionName !== exempt2) {
          institutionsNameRef.push(institutionName);
        }
      }
      
    }

    function inventoryFilter(inventory, institution) {
      return inventory.filter((x) => {
        return x.partnerID === institution;
      });
    }


    // start email sending loop by partner
    // eslint-disable-next-line no-cond-assign
    for (var institution, i2 = 0; institution = institutions[i2++];) {
      console.log(institution)
       //create recipient list
      const recipients = userFilter(users, institution, true);

      // expired today
      if (expireTodayEmpty === false) {
        const instituteExpireToday = inventoryFilter(expireToday, institution);

        if (Object.keys(instituteExpireToday).length > 0) {

          let payload1 = [];

          // eslint-disable-next-line no-cond-assign
          for (var batch, i3 = 0; batch = instituteExpireToday[i3++];) {
            var processedData1 = {
              batchID: batch.batchID,
              bloodType: batch.bloodType,
              quantity: batch.quantity,
              dateExpiry: batch.dateExpiry.toDate()
            }
            payload1.push(processedData1);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient, i4 = 0; recipient = recipients[i4++];) {
            console.log(recipient)
    
            const replacements = {
              expiring: payload1,
              username: recipient.fullName,
              institutionName: institutionsNameRef[i2],
              date: 'Today'
            }
    
            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient.email,
              subject: 'Blood Bags Expiring Today',
            };
    
            sendEmail(mailOptions, 'expiry', replacements)
          }

          // Update inventory
          // eslint-disable-next-line no-cond-assign
          for (var batch2, i5 = 0; batch2 = instituteExpireToday[i5++];) {
            db.collection("inventory").doc(batch2.id).update({isExpired: true});
            db.collection("audit").add({
              date: new Date(),
              level: 'System Admin',
              name: 'Automated',
              uid: 'N/A',
              type: 'Inventory',
              action: 'Expired',
              associatedID: batch2.batchID
            });
          }
        }



      }

      // expiring weekaway
      if (expireWeekAwayEmpty === false) {
        const instituteExpireWeekAway = inventoryFilter(expireWeekAway, institution);
        if (Object.keys(instituteExpireWeekAway).length > 0) {

          let payload2 = [];

          // eslint-disable-next-line no-cond-assign
          for (var batch3, i6 = 0; batch3 = instituteExpireWeekAway[i6++];) {
            var processedData2 = {
              batchID: batch3.batchID,
              bloodType: batch3.bloodType,
              quantity: batch3.quantity,
              dateExpiry: batch3.dateExpiry.toDate('MM/dd/yyyy')
            }
            payload2.push(processedData2);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient2, i7 = 0; recipient2 = recipients[i7++];) {
    
            const replacements = {
              expiring: payload2,
              username: recipient2.fullName,
              institutionName: institutionsNameRef[i2],
              date: 'A Week from Now'
            }
    
            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient2.email,
              subject: 'Blood Bags Expiring A Week from Now',
            };
    
            sendEmail(mailOptions, 'expiry', replacements)
          }
        }
      }

      // expired fortnightaway
      if (expireFortnightAwayEmpty === false) {
        const instituteExpireFortnightAway = inventoryFilter(expireFortnightAway, institution);
        if (Object.keys(instituteExpireFortnightAway).length > 0) {

          let payload3 = [];

          // eslint-disable-next-line no-cond-assign
          for (var batch4, i8 = 0; batch4 = instituteExpireFortnightAway[i8++];) {
            var processedData3 = {
              batchID: batch4.batchID,
              bloodType: batch4.bloodType,
              quantity: batch4.quantity,
              dateExpiry: batch4.dateExpiry.toDate()
            }
            payload3.push(processedData3);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient3, i9 = 0; recipient3 = recipients[i9++];) {

            const replacements = {
              expiring: payload3,
              username: recipient3.fullName,
              institutionName: institutionsNameRef[i2],
              date: 'Fortnight from Now'
            }
    
            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient3.email,
              subject: 'Blood Bags Expiring Fortnight from Now',
            };
    
            sendEmail(mailOptions, 'expiry', replacements)
          }
        }
      }
    }

    return res.send("More Work?");
});

exports.quantityChecker = functions.https.onRequest( async(req, res) => {

  // Query Data
  let users;
  let inventory;

  await db.collection('inventory').where('isExpired', '==', false).where('isArchived', '==', false).where('isEmpty', '==', false).get()
  .then(querySnapshot => {
    if (querySnapshot.empty) {
      return res.send("Error No Items")
    } else {
      return inventory = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
    }
  });
  await db.collection('user').get().then(querySnapshot => {
    if (querySnapshot.empty) {
      return res.send("Error No Users")
    } else {
      return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
    }
  });


   // get active instituion list
   var lookup = {};
   var institutions = [];
   var institutionsNameRef = [];
   const exempt = "N/A"
   const exempt2 = "The Redbank Foundation"

   // eslint-disable-next-line no-cond-assign
   for (var item, i = 0; item = users[i++];) {
     var institutionID = item.partnerID;
     var institutionName = item.institutionName;

     if (!(institutionID in lookup)) {
       lookup[institutionID] = 1;
       if ( institutionID !== exempt) {
         institutions.push(institutionID);
       }
     }

     if (!(institutionName in lookup)) {
       lookup[institutionName] = 1;
       if ( institutionName !== exempt2) {
         institutionsNameRef.push(institutionName);
       }
     }
     
   }

  function inventoryFilter(bloodTypes, institution, i) {
    return  inventory.filter((x) => {
      return x.bloodType === bloodTypes[i] && x.partnerID === institution;
    });
  }

  let bloodTypes = ['A+' , 'A-' , 'B+' , 'B-' , 'O+' , 'O-' , 'AB+' , 'AB-'];

  // start email sending loop by partner
  // eslint-disable-next-line no-cond-assign
  for (var institution, i2 = 0; institution = institutions[i2++];) {

     //create recipient list
    const recipients = userFilter(users, institution, true);


    let lowQuantity = [];

    for (var i5 = 0; i5 < bloodTypes.length; i5++) {
      const bloodTypeInventory = inventoryFilter(bloodTypes, institution, i5)

      console.log(bloodTypes[i5])
      var sumOfBloodType = 0;

      // eslint-disable-next-line no-cond-assign
      for (var batch, i6 = 0; batch = bloodTypeInventory[i6++];) {
        console.log(batch.bloodType)
        console.log(batch.quantity)
        sumOfBloodType = Number(sumOfBloodType) + Number(batch.quantity);
        console.log(sumOfBloodType)
      }


      if(sumOfBloodType < 5) {
        lowQuantity.push({ 'bloodType': bloodTypes[i5] , 'quantity' : sumOfBloodType})
      }
      console.log(lowQuantity)
    }

    console.log(lowQuantity)

    if(lowQuantity.length > 0){

      const recipientsData = userFilter(users, institution, false);

      // Send to recipients
      // eslint-disable-next-line no-cond-assign
      for (var recipient, i4 = 0; recipient = recipients[i4++];) {
        console.log(recipient)

        const replacements = {
          lowQuantity: lowQuantity,
          username: recipient.fullName,
          institutionName: institutionsNameRef[i2]
        }

        const mailOptions = {
          from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: 'Low Quantity Blood'
        };

        sendEmail(mailOptions, 'lowQuantity', replacements)
       
      }


    }
  }

  return res.send("More Work?");
});

exports.validateCode = functions.https.onRequest((req, res) => {
  console.log(req.body);
  cors(req, res, async () => {

      if (!req.body.code || !req.body.id) {
          return res.status(422).send({
            error: {
              code: 422,
              message: "Missing arguments"
            }
          });
      }

      return await db.collection('dispatch').where('dispatchID', '==', req.body.id).where('claimCode', '=', req.body.code).get().then(querySnapshot => {
        if (querySnapshot.empty) {
          return res.send(false)
        } else {
          return res.send(true);
        }
      });
  });
});

// exports.computeRating = functions.https.onRequest( async (req, res) => {

//         let uid = req.query.uid;
//         let getRatings = await firestore.collection("transaction")
//             .where("agentUid", "==", uid)
//             .where("isCompleted", "==", true)
//             .get();

//         let arrayRatings = getRatings.docs.map(doc => doc.data().rating);
//         let sumRatings = arrayRatings.reduce((previous, current) => current += previous);
//         let avgRatings = Math.floor(sumRatings / arrayRatings.length);


//         let getDocID = await firestore.collection("broker").where("uid", "==", uid).get();
//         let docId = getDocID.docs.map(doc => doc.id);

//         firestore.collection("broker").doc(docId[0]).update({
//             aveRating : avgRatings
//         });
//         return res.send("ok");

// });


