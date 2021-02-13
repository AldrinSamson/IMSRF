// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
                return res.send(String('Succesfully Sent to '+req.body.email));
        });
    });
});

exports.sendBroadcastMail = functions.https.onRequest(async (req, res) => {

  await db.collection('user').get().then(querySnapshot => {
    users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
  });



  cors(req, res, () => {
    const recipients = users.filter(function (x) {
      return x.partnerID == req.body.institution || x.position === 'Admin';
    });

      if (!req.body.subject || !req.body.message) {
          return res.status(422).send({
            error: {
              code: 422,
              message: "Missing arguments"
            }
          });
      }

      for (var recipient, i = 0; recipient = recipients[i++];) {
        const mailOptions = {
          from: 'The RedBank Foundation  <imsrf.dev@gmail.com>',
          to: recipient.email,
          subject: req.body.subject,
          html: req.body.message
        };

        // console.log(recipient);

        transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
              console.log(erro.toString());
            }
              console.log(String('Succesfully Sent to '+recipient.email));
        });
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
    const utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
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
        expireTodayEmpty = true;
      } else {
        expireToday = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('inventory').where('dateExpiry', '>', weekAwayStart).where('dateExpiry', '<', weekAwayEnd).get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        expireWeekAwayEmpty = true;
      } else {
        expireWeekAway = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('inventory').where('dateExpiry', '>', fortnightAwayStart).where('dateExpiry', '<', fortnightAwayEnd).get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        expireFortnightAwayEmpty = true;
      } else {
        expireFortnightAway = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
      }
    });
    await db.collection('user').get().then(querySnapshot => {
          users = querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
    });


    // get active instituion list
    var lookup = {};
    var institutions = [];
    const exempt = "N/A"

    for (var item, i = 0; item = users[i++];) {
      var institutionID = item.partnerID;

      if (!(institutionID in lookup)) {
        lookup[institutionID] = 1;
        if ( institutionID != exempt) {
          institutions.push(institutionID);
        }
      }
    }

    // start email sending loop by partner
    for (var institution, i = 0; institution = institutions[i++];) {

       //create recipient list
      const recipients = users.filter(function (x) {
        return x.partnerID == institution || x.position === 'Admin';
      });

      // expired today
      if (expireTodayEmpty === false) {
        const instituteExpireToday = expireToday.filter(function (x) {
          return x.partnerID === institution;
        });
        if (Object.keys(instituteExpireToday).length > 0) {

          let message = "Blood Bags Expiring Today: ";

          for (var batch, i = 0; batch = instituteExpireToday[i++];) {
            var item = batch.batchID + " | " + batch.bloodType + " | " +batch.quantity + " | " + batch.dateExtraction.toDate() + " | " + batch.dateExpiry.toDate();
            message = message.concat(item);
          }

          // Send to recipients
          for (var recipient, i = 0; recipient = recipients[i++];) {
            console.log(recipient)


            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient.email,
              subject: 'Blood Bags Expiring Today',
              html: message
            };

            transporter.sendMail(mailOptions, (erro, info) => {
                if(erro){
                  console.log(erro.toString());
                }
                  console.log(String('Succesfully Sent to '+ recipient.email));
            });
          }

          // Update inventory
          for (var batch, i = 0; batch = instituteExpireToday[i++];) {
            db.collection("inventory").doc(batch.id).update({isExpired: true});
          }
        }



      }

      // expiring weekaway
      if (expireWeekAwayEmpty === false) {
        const instituteExpireWeekAway = expireWeekAway.filter(function (x) {
          return x.partnerID === institution;
        });
        if (Object.keys(instituteExpireWeekAway).length > 0) {

          let message = "Blood Bags Expiring A Week from now: ";

          for (var batch, i = 0; batch = instituteExpireWeekAway[i++];) {
            var item = batch.batchID + " | " + batch.bloodType + " | " +batch.quantity + " | " + batch.dateExtraction.toDate() + " | " + batch.dateExpiry.toDate();
            message = message.concat(item);
          }

          // Send to recipients
          for (var recipient, i = 0; recipient = recipients[i++];) {


            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient.email,
              subject: 'Blood Bags Expiring A Week from now',
              html: message
            };

            transporter.sendMail(mailOptions, (erro, info) => {
                if(erro){
                  console.log(erro.toString());
                }
                  console.log(String('Succesfully Sent to '+ recipient.email));
            });
          }
        }
      }

      // expired fortnightaway
      if (expireFortnightAwayEmpty === false) {
        const instituteExpireFortnightAway = expireFortnightAway.filter(function (x) {
          return x.partnerID === institution;
        });
        if (Object.keys(instituteExpireFortnightAway).length > 0) {

          let message = 'Blood Bags Expiring Fortnight from now: ';

          for (var batch, i = 0; batch = instituteExpireFortnightAway[i++];) {
            var item = batch.batchID + " | " + batch.bloodType + " | " +batch.quantity + " | " + batch.dateExtraction.toDate() + " | " + batch.dateExpiry.toDate();
            message = message.concat(item);
          }

          // Send to recipients
          for (var recipient, i = 0; recipient = recipients[i++];) {

            const mailOptions = {
              from: 'The RedBank Foundation <imsrf.dev@gmail.com>',
              to: recipient.email,
              subject: 'Blood Bags Expiring Fortnight from now',
              html: message
            };

            transporter.sendMail(mailOptions, (erro, info) => {
                if(erro){
                  console.log(erro.toString());
                }
                  console.log(String('Succesfully Sent to '+ recipient.email));
            });
          }
        }
      }
    }

    return res.send("More Work?");
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


