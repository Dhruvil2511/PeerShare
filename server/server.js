const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb+srv://priyanshu24052:bleqFyixRr2tnaXW@cluster0.qqyzxn9.mongodb.net/PeerShare?retryWrites=true&w=majority').then(() => { console.log('Starting') });
const UserSchema = new mongoose.Schema({
    eid: String,
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    emoji1: String,
    emoji2: String,
    review: String,
    suggestion: String,
    find: String,
});
const User = new mongoose.model('User', UserSchema);

// app.post('/mail', async (req, res) => {

//     var trans = await nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'johnpaul.schamberger@ethereal.email',
//             pass: 'YRXqmTccNntRh3qzAk'
//         }
//     });
//     fromEmail = await req.body.email;
//     console.log(fromEmail)
//     var mailoption = {
//         from: '<priyanshu24052@gmail.com>',
//         to: fromEmail,
//         subject: 'Add On The Mailing List',
//         text: 'Add Me In Mailing List Senpai'
//     }
//     await trans.sendMail(mailoption, (err, info) => {
//         if (err) { console.log(err) }
//         else { console.log('Success:' + info.response) }
//     })
//     res.send()
// })
app.post('/process', async (req, res) => {
    try {
        const { eid, fname, lname, emoji1, emoji2, review, suggestion, find } = req.body;
        const newUser = new User({ eid, fname, lname, emoji1, emoji2, review, suggestion, find });
        await newUser.save();
        res.send();
    } catch (error) {
        res.send(error);
    }
});
app.listen(8000);