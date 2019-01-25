const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
app.use(cors({origin: '*'}));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(function () {
    db.run("CREATE TABLE inetbankForms (inn TEXT, bik TEXT, number TEXT, sum TEXT, nds TEXT, dest TEXT)");
    db.run("CREATE TABLE anybankForms (cardNumber TEXT, date TEXT, cvc TEXT, amount TEXT, email TEXT)");
});


//db.close();


app.get('/forms/inetbank', function (req, response) {

    const blobStream = require('blob-stream');
    PDFDocument = require('pdfkit');
    var doc = new PDFDocument;
    const stream = doc.pipe(blobStream());

    doc
        .fontSize(25)
        .text(`INN: ${req.query.inn}`)
        .text(`BIK: ${req.query.bik}`)
        .text(`NUMBER: ${req.query.number}`)
        .text(`SUM: ${req.query.sum}`)
        .text(`NDS: ${req.query.nds}`)
        .text(`WHY, mr. Anderson?: ${req.query.dest}`);
    doc.end();


    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename=task.pdf');
    doc.pipe(response)
});

app.post('/forms/anybank', function (request, response) {

    db.serialize(function () {

        var stmt = db.prepare("INSERT INTO inetbankForms VALUES (?,?,?,?,?,?)");
        stmt.run([request.body['cardNumber'], request.body['date'], request.body['cvc'], request.body['amount'], request.body['email']]);
        stmt.finalize();

    });
    // console.log(request.body['cardNumber'])


});
arr = [];
app.get('/forms/admin', function (request, response) {

    db.each("SELECT cardNumber FROM anybankForms", function (err, row) {
        var obj = {
            cardNumber: row.cardNumber,
            // date: row.date,
            // cvc: row.cvc,
            // amount: row.amount,
            // email: row.email
        };
        arr.push(obj);
        console.log(obj);

    });
    console.log(arr);
    response.send(arr);
});


app.listen(3000, function () {
    console.log('Server listening on port 3000!');
});
