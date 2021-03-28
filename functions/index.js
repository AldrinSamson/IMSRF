const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const admin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
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

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'imsrf.dev@gmail.com',
        pass: 'IMSRF2020'
    }
});

function sendEmail(mailOptions , htmlRes) {
  if (htmlRes) {
    transporter.sendMail(mailOptions, (erro, info) => {
      if(erro){
          return res.send(erro.toString());
      }
          return res.send(String('Succesfully Sent to '+mailOptions.to));
    });
  } else {
    transporter.sendMail(mailOptions, (erro, info) => {
      if(erro){
        console.log(erro.toString());
      }
        console.log(String('Succesfully Sent to '+ mailOptions.to));
    });
  }
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
    cors(req, res, () => {

        if (!req.body.subject || !req.body.message) {
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
            subject: req.body.subject,
            html: req.body.message
        };

        return sendEmail(mailOptions, true)
    });
});

exports.broadcastEmail = functions.https.onRequest((req, res) => {

  cors(req, res,async () => {
    await db.collection('user').get().then(querySnapshot => {
      if (querySnapshot.empty) {
        return res.send("No Users")
      } else {
        return users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });

    const recipients = users.filter((x) => {
      return x.partnerID === req.body.institution || x.position === 'System Admin';
    });

      if (!req.body.subject || !req.body.message) {
          return res.status(422).send({
            error: {
              code: 422,
              message: "Missing arguments"
            }
          });
      }

      // eslint-disable-next-line no-cond-assign
      for (var recipient, i = 0; recipient = recipients[i++];) {
        const mailOptions = {
          from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: req.body.subject,
          html: req.body.message
        };
        sendEmail(mailOptions, false)
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
    const exempt = "N/A"

    // eslint-disable-next-line no-cond-assign
    for (var item, i = 0; item = users[i++];) {
      var institutionID = item.partnerID;

      if (!(institutionID in lookup)) {
        lookup[institutionID] = 1;
        if ( institutionID !== exempt) {
          institutions.push(institutionID);
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

          let message = "Blood Bags Expiring Today: ";

          // eslint-disable-next-line no-cond-assign
          for (var batch, i3 = 0; batch = instituteExpireToday[i3++];) {
            var messageItem = batch.batchID + " | " + batch.bloodType + " | " +batch.quantity + " | " + batch.dateExtraction.toDate() + " | " + batch.dateExpiry.toDate();
            message = message.concat(messageItem);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient, i4 = 0; recipient = recipients[i4++];) {
            console.log(recipient)


            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient.email,
              subject: 'Blood Bags Expiring Today',
              html: message
            };

            sendEmail(mailOptions, false)
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

          let message = "Blood Bags Expiring A Week from now: ";

          // eslint-disable-next-line no-cond-assign
          for (var batch3, i6 = 0; batch3 = instituteExpireWeekAway[i6++];) {
            var messageItem2 = batch3.batchID + " | " + batch3.bloodType + " | " +batch3.quantity + " | " + batch3.dateExtraction.toDate() + " | " + batch3.dateExpiry.toDate();
            message = message.concat(messageItem2);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient2, i7 = 0; recipient2 = recipients[i7++];) {


            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient2.email,
              subject: 'Blood Bags Expiring A Week from now',
              html: message
            };

            sendEmail(mailOptions, false)
          }
        }
      }

      // expired fortnightaway
      if (expireFortnightAwayEmpty === false) {
        const instituteExpireFortnightAway = inventoryFilter(expireFortnightAway, institution);
        if (Object.keys(instituteExpireFortnightAway).length > 0) {

          let message = 'Blood Bags Expiring Fortnight from now: ';

          // eslint-disable-next-line no-cond-assign
          for (var batch4, i8 = 0; batch4 = instituteExpireFortnightAway[i8++];) {
            var messageItem3 = batch4.batchID + " | " + batch4.bloodType + " | " +batch4.quantity + " | " + batch4.dateExtraction.toDate() + " | " + batch4.dateExpiry.toDate();
            message = message.concat(messageItem3);
          }

          // Send to recipients
          // eslint-disable-next-line no-cond-assign
          for (var recipient3, i9 = 0; recipient3 = recipients[i9++];) {

            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient3.email,
              subject: 'Blood Bags Expiring Fortnight from now',
              html: message
            };

            sendEmail(mailOptions, false)
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
  const exempt = "N/A"

  // eslint-disable-next-line no-cond-assign
  for (var item, i = 0; item = users[i++];) {
    var institutionID = item.partnerID;

    if (!(institutionID in lookup)) {
      lookup[institutionID] = 1;
      if ( institutionID !== exempt) {
        institutions.push(institutionID);
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

      let message = "Partner "+recipientsData[0].institutionName+" Low Quantity Blood: ";

      // eslint-disable-next-line no-cond-assign
      for (var batch2, i3 = 0; batch2 = lowQuantity[i3++];) {
        var messageItem = batch2.bloodType + " | " +batch2.quantity + " ";
        message = message.concat(messageItem);
      }

      // Send to recipients
      // eslint-disable-next-line no-cond-assign
      for (var recipient, i4 = 0; recipient = recipients[i4++];) {
        console.log(recipient)


        const mailOptions = {
          from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: 'Low Quantity Blood',
          html: message
        };

        sendEmail(mailOptions, false);
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


