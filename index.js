var express=require("express"); 
var bodyParser=require("body-parser");
var app=express() 
app.use('/css',express.static(__dirname +'/css'));
app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
})); 
const SendOtp = require('sendotp');
const sendOtp = new SendOtp('300774Am7lsRW7S5db2953c');
var nodemailer = require('nodemailer');
/* Send OTP */
app.post('/sign_up', function(req,res){ 
    var name = req.body.name; 
    var email =req.body.email; 
    var pass = req.body.password; 
    var phone =req.body.phone; 
    var board = req.body.board; 
    var address = req.body.address; 
    var city = req.body.city; 
    var state = req.body.state;
    var reg_no = req.body.reg_no;
    var aria = req.body.aria;
    var pin = req.body.pin; 

    const sign_records = { 
        "name": name, 
        "email":email, 
        "password":pass, 
        "phone":phone,
        "board": board, 
        "address":address, 
        "city":city, 
        "state":state,
        "reg_no":reg_no, 
        "aria":aria,
        "pin":pin,
        "status":"pending"
    } 
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url,{useNewUrlParser: true}).then(function (db) {   
        var dbo =  db.db('aimzo');
        dbo.collection("aimzo_signup").findOne({
            reg_no:reg_no
        }).then(function(data) {
            if (data == '' || data == null || data == "" || data == undefined) {
                var otp = Math.floor(1000 + Math.random() * 9000);
                    var transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                          user: 'shifalibaghel09@gmail.com',
                          pass: '200996sr'
                        }
                      });
                      var mailOptions = {
                        from: 'shifalibaghel09@gmail.com',
                        to: 'shifali.baghel@srijan.net',
                        subject: 'Sending Email using Node.js',
                        text: 'Your varification OTP: '+otp
                      };
                    const optData = { 
                        "opt_number": otp, 
                        "reg_no":reg_no, 
                        "email":email                        
                    } 
                    // -----------------
                    // dbo.collection("aimzo_signup_otp").insertOne(optData).then(function(otp_data) {
                    //     transporter.sendMail(mailOptions).then(function(datas) {
                    //                 res.send('OTP Sent Successfully');
                    //     }).catch(function (err) {//failure callback
                    //             console.log('OTP not Sent: '+err);
                    //     });
                    // }).catch(function (err) {//failure callback
                    //     res.send('OTP data not inserted: ' + err);
                    // });
                    // ---------------------------
                    dbo.collection("aimzo_signup_otp").findOne({
                        reg_no: reg_no
                    }).then(function(data) {
                    /* Insert Sign Up form data into Sigup table */
                    dbo.collection("aimzo_signup").insertOne(sign_records, function(err, result) {});
                    /* Need to insert the OTP data into table */
                    if (data == '' || data == null || data == "" || data == undefined) {
                        /* Insert OTP info into DB */
                        dbo.collection("aimzo_signup_otp").insertOne(optData).then(function(otp_data) {
                        transporter.sendMail(mailOptions).then(function(datas) {
                                    res.send('OTP Sent Successfully');
                        }).catch(function (err) {//failure callback
                                console.log('OTP not Sent: '+err);
                        });
                        }).catch(function (err) {//failure callback
                        res.send('OTP data not inserted: ' + err);
                        });
                    }
                    /* Need to Update the OTP data into table */
                    else{

                            /* Update OTP info into DB */
                            var myquery = { 'reg_no': reg_no};
                            var newvalues = { $set: {'opt_number': otp } };
                            dbo.collection("aimzo_signup_otp").updateOne(myquery, newvalues).then(function(otp_data) {
                            transporter.sendMail(mailOptions).then(function(datas) {
                                res.send('OTP Sent Successfully');
                            }).catch(function (err) {//failure callback
                                    console.log('OTP not Sent: '+err);
                            });
                            }).catch(function (err) {//failure callback
                            res.send('OTP data not inserted: ' + err);
                            });
                        }
                    }).catch(function (err) {//failure callback
                            res.send('>>>>> '+err);
                    });
            }
            else {
                res.send('Result already exists. Please with another Reg. Number..');
            };
        }).catch(function (err) {//failure callback
            console.log('>>>>> '+err);
        });
    }).catch(function (err) {
        console.log('data connnection failed due to this: <<<<<  '+err);
    });
});
/* Send OTP End: */

/* OTP verify */ 
app.get('/otp_varify/:reg_no',function(req,res){ 
    const MongoClient = require('mongodb').MongoClient;
    const url = "mongodb://localhost:27017/";    
    MongoClient.connect(url,{useNewUrlParser: true}).then(function (db) {   
        var dbo =  db.db('aimzo');
        /* Update Sign Up info from Pending to Complete */
        // var myquery = { 'reg_no': reg_no};
        // var newvalues = { $set: {'status': 'completed' } };
        // db.collection("aimzo_signup_otp").updateOne(myquery, newvalues);
        /* get OTP using Registration Number */
        dbo.collection("aimzo_signup_otp").findOne({
            reg_no: req.params.reg_no
        }).then(function(data) {
            res.send('OTP Result: '+ data.opt_number); 
        }).catch(function (err) {//failure callback
            res.send(err);
        });
    }).catch(function (err) {
        console.log('data connnection failed due to this: <<<<<  '+err);
    }); 
});
/* OTP verify end: */
app.listen(8888,()=> console.log('Server reunning on port 8888.'));
