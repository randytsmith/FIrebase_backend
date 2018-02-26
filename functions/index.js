// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
//
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//dwolla module and client
const dwolla = require('dwolla-v2');
const client = new dwolla.Client({
    key: functions.config().dwolla.key,
    secret: functions.config().dwolla.secret,
    environment: 'sandbox'
});
var dwollatoken = null;

//crypto module
const crypto = require('crypto');

//database reference
const ref = admin.database().ref();
//nodemailer module
const nodemailer = require('nodemailer');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
});
//requests lib
var request = require('request');

//promise module
var Promise = require('promise');


const rp = require('request-promise');
const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;
const secureCompare = require('secure-compare');
// Maximum concurrent account deletions.
const MAX_CONCURRENT = 3;











//Subscribe to dwolla webhooks and store webHook location URL

exports.startWebhook = functions.https.onRequest((req, res) => {
   console.log(req);
   client.auth.client()
   .then(appToken => {
       var requestBody = {
           url: "https://us-central1-tripcents-342d8.cloudfunctions.net/dwollaWebhookRec",
           secret: functions.config().dwolla.webkey 
       };
       return appToken.post('webhook-subscriptions', requestBody)
       .then(res => {
           console.log(res.headers);
           var loc = res.headers.get('location');
           return ref.child('web_hooks/').set({ url: loc })
       })
   })
   .then(() => {
       res.status(200).send('OK')
   });
});

exports.dwollaWebhookRec = functions.https.onRequest((req, res) => {
    const proposed_sig = req.get('X-Request-Signature-Sha-256');
    //may have to stringify body and use utf-8 encoding
    var hmac = crypto.createHmac('sha256', functions.config().dwolla.webkey).update(req.rawBody).digest('hex');
    if(hmac == proposed_sig) {
        var event_url = req.body.id;
        //console.log(event_id);
        ref.child('dwolla_events/').once('value') 
        .then(snap => {
             if(!snap.hasChild(event_id)){
                handleWebhook(req, resp => {
                    //console.log("webhook finished");
                        return ref.child('dwolla_events/' + event_id).set({event_id : event_url})
                        .then(() => {
                             res.status(200).send('OK\n');
                        })
                });
            } else {
                //console.log("already in database");
                res.status(200).send('event exists');
            }
        });
    } else {
        res.status(400).send('sig did not match');
    }
 }, error => {
    console.error(error)
    res.status(400).send('error req');
});

//
//exports.sendPush = functions.https.onRequest((req, res) => {
//    //var cust = req.body._links.resourceId;
//    console.log("inside");
//    var cust = "1f58eda4-74d1-4913-806f-2ca213ae77b4"
//    return ref.child('dwolla_customer/' + cust).once('value')
//    .then(snap => {
//        const uid = snap.val().uid;
//        return ref.child('customer/'+uid).once('value')
//        .then( cust_snap => {
//            console.log("inside2");
//            const tokey = "fGWmSOmoMRo:APA91bHKY9fQBdmIgAlMluIwdweBuYNKw5PT0fpnLu_729JvD85ByWnaX_CmpfYhGWZqenT1CV3breipErVrHRfMEPGZ2lssfP0R1c7CyHJsCUIHwb0oiN0TQw15_kL_PhsayO4iXL3H";
//            const url = "https://fcm.googleapis.com/fcm/send";
//            const secret = "key = " + functions.config().push.key;
//            console.log(secret);
//            const title = "pushy pushy";
//            const body = "hope this works";
//            const headers = {"Content-Type":"application/json","Authorization":secret}
//            const params = {"to": tokey,
//               "content-available":true,
//               "priority":"high",
//               "notification" : {
//                   "sound" : "",
//                   "title" : title,
//                   "body" : body
//            },
//            };
//            console.log(params);
//            request.post(url, {form: params, headers: headers}, (err, result, body) => {
//                res.status(200).send("ok\n");
//            });
//        });
//    });
//});
//
                
                


function handleWebhook(req, callback){
    const topic = req.body.topic;
    console.log(topic);
    switch(topic){
        case "customer_created":
            {
            //fetch customer link, lookup email by cust ID, send email
            var cust = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                const uid = snap.val().uid;
                var updates = {};
                updates['customer/' + uid] = {"dwolla_id": cust};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp  => {
                        callback(true);
                    });
                });
            });
            break;     
            }        
        case "customer_verified":
            //fetch custommer link, lookup email, change status
            {
            var cust = req.body.resourceId;
            var email = "";
            var custUrl = req.body._links.resource.href;
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                token = dwollatoken;
                return token.get(custUrl + '/funding-sources')
                .then( res => {
                    var updates = {};
                    const bal = res.body._embedded['funding-sources'][0].id;
                    updates['dwolla_customer/' + cust] = {"status":"verified", "dwolla_bal":bal};
                    return ref.update(updates)
                    .then(() => {
                        return sendMail(email, topic, resp => {
                            callback(true);
                        });
                    });
                });
            });
            break;     
            }
        case "customer_suspended":
            //fetch cust link, lookup email, change status
            {
            var cust = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_customer/' + cust] = {"status":"suspended"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;     
            }
        case "customer_reverification_needed":
            {
            var cust = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_customer/' + cust] = {"status":"reverification"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break; 
            }
            
        case "customer_deactivated":
            {
            var cust = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_customer/' + cust] = {"status":"deactivated"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });        
            break;
            }
        case "customer_activated":
            {
            var cust = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_customer/' + cust] = {"status":"deactivated"};
                return ref.update(updates)
                .then(()=> {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });   
            break;
            }
        case "customer_funding_source_added":
            //fetch customer, possibly funding source info from custID->fundingsource-> send email
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            const fund = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_customer/' + cust] = {"dwolla_fund":fund};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_funding_source_removed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var fund = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email; 
                var updates = {};
                updates['dwolla_fund_source/' + fund] = {"status":"removed"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_funding_source_verified":
            //fetch customer, funding source info from cust id, send email
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var fund = req.body.resourceId;
            var email = "";    
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email; 
                var updates = {};
                updates['dwolla_fund_source/' + fund] = {"status":"verified"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_bank_transfer_created":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            const transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"pending"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_bank_transfer_creation_failed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"creation_failed"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });

            break;
            }
        case "customer_bank_transfer_cancelled":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"cancelled"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });

            break;
            }
        case "customer_bank_transfer_failed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"cancelled"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_bank_transfer_completed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transferUrl = req.body._links.resource.href;
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1;
                var yyyy = today.getFullYear();
                if(dd<10){
                    dd = '0'+dd;
                }
                if(mm<10){
                    mm = '0'+mm;
                }
                today = mm + '/' + dd + '/' + yyyy;
               //fetch transfer id and add it to bs whatever 
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"cancelled"}
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_transfer_created":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"pending"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        case "customer_transfer_cancelled":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"cancelled"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });

            break;
            }
        case "customer_transfer_failed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"failed"};
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            
            break;
            }
        case "customer_transfer_completed":
            {
            var custUrl = req.body._links.customer.href;
            var cust = custUrl.substr(custUrl.lastIndexOf('/') + 1);
            var transfer = req.body.resourceId;
            var email = "";
            return ref.child('dwolla_customer/' + cust).once('value')
            .then(snap => {
                email = snap.val().email;
                var updates = {};
                updates['dwolla_transfers/' + cust + '/' + transfer] = {"status":"completed"}
                return ref.update(updates)
                .then(() => {
                    return sendMail(email, topic, resp => {
                        callback(true);
                    });
                });
            });
            break;
            }
        default:
            callback(true)

    }
}
function sendMail(word, m, resp){
    resp("hi");
}
//
//exports.testFlow = functions.https.onRequest((req, res) => {
//    var n = req.body.name;
//    console.log(n);
//    const trans = {"testkey" : "transfertesting"};
//    var balid = '';
//    return ref.child('customer/uid').once('value')
//    .then(snap => {
//        //console.log("first");
//        balid = snap.val().dwolla_id;
//        const fund = snap.val().dwolla_fund_url;
//        var updates = {};
//        updates['testme'] = trans;
//        updates['dwolla_transfers/' + "swuid"] = trans;
//        return ref.update(updates)
//        .then(() => {
//            //console.log("inner");
//            var m = "anothertest";
//            sendMail(balid, m, resp => {
//              //  console.log(resp);
//                res.end();
//            });
//        });
//    });
//});
//                

exports.updateToken = functions.https.onRequest((req, res) => {
    client.auth.client()
    .then(token => {
        dwollatoken = token; 
        console.log(token.access_token);
        var tok = token.access_token;
        return ref.child('access_token/').set({"access" : tok})
    })
    .then(() => {
    res.status(200).send();
    });
});

function getToken(){
    var appToken = ref('access_token/');
    const tok = appToken.on('value', token => {
        return token.val
    });
    return tok;
}

exports.removeFund = functions.ref("/dwolla_customer/{custID}/dwolla_fund").onWrite((event) => {
    if (event.data.val() == "none"){
        const prev_fund = event.data.previous.val();
        var fundUrl = "https://api-sandbox.dwolla.com/funding-sources/" + prev_fund;
        var requestBody = {
            removed: true
        };
        dwollatoken.post(fundUrl, requestBody);
    }
});



//exports.createDwollaDeposit = functions.https.onRequest((req, res) => {
//
//}

//exports.createDwollaCust = functions.https.onRequest((req, res) => {
//    const uid = req.body.uid;
//    const firstName = req.body.firstName;
//    const lastName = req.body.firstName;
//    const email = req.body.email;
//    const street = req.body.street;
//    const city = req.body.city;
//    const state = req.body.state;
//    const postal = req.body.postal;
//    const dob = req.body.dob;
//    const ssn = req.body.ssn; 
//    getToken()
//    .then(appToken => {
//        const param = {"firstName": firstName, "lastName": lastName, "email": email, "type": "personal", "street": street, "city": city, "state": state, "postalCode": postal, "dateOfBirth": dob, "ssn": ssn};
//        appToken.post('customers', param, headers)
//        .then(resp => {
//            const url = res.headers.get('location');
//
//
//    });
