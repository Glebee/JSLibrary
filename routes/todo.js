const { Router } = require('express');
const router = Router();
const $ = require("jquery");

let list_books = [];
let list_clients = [];


let load_clients = function() {
    const Client = require('../clients/clients.js');
    const json_clients = require('../clients/clients.json');
    json_clients.clients.map(function(client_obj) { list_clients.push(new Client(client_obj)) });
}


let load_books = function() {
    const Book = require('../books/books.js');
    const json_books = require('../books/books.json');
    json_books.books.map(function(book_obj) { list_books.push(new Book(book_obj)) });
}

let loaded = false;
function load_json() {
    if (loaded) return;
    loaded = true;

    load_books();
    load_clients();
}


const fs = require('fs');
function render_index(res, books) {
    res.render('index', {books});
    fs.writeFileSync('./books/books.json', JSON.stringify({"books": list_books}, null, 4));
    fs.writeFileSync('./clients/clients.json', JSON.stringify({"clients": list_clients}, null, 4));
}


router.get('/', (req, res) => {
    load_json();
    render_index(res, list_books);
})


function parse_prms(cur_url) {
    const url = require('url');
    cur_url = url.parse(cur_url);
    let splitted_url = cur_url.query.split('&');
    let prms = {};
    for (url_param of splitted_url) {
        cur = url_param.split('=');
        prms[cur[0]] = decodeURI(cur[1]);
    }
    return prms;
}


router.get('/borrow_book_menu', (req, res) => {
    load_json();
    let prms = parse_prms(req.originalUrl);
    let book = list_books[prms.id];
    res.render('borrow_book', { book, list_clients });
})


function search_client_id(req) {
    let name = req.body.name;
    let i = 0;
    for (let id of list_clients) {
        if (id.name == name) return i;
        i++;
    }
    return -1;
}
function bookMoving(idB, idC, dateIn, dateOut) {
    if (typeof(dateIn) !== "undefined" ) {
        list_books[idB].amount--;
        list_clients[idC].borrowed_books.push([idB, dateIn.toLocaleDateString(), dateOut.toLocaleDateString()]);
    }
    else {
        list_books[idB].amount++;
        list_clients[idC].borrowed_books.splice(bID, 1);
    }
}
router.post('/borrow_book', (req, res) => {
    clientID = search_client_id(req);
    let bookID = req.body.bookID;

    if (clientID == -1) {
        console.log("client was not found");
        throw new Error("borrow book error");
    }
    else if (list_books[bookID].amount == 0) {
        console.log("books were not found");
        throw new Error("borrow book error");
    }
    let date = new Date();
    let expire_date = new Date();
    expire_date.setDate(expire_date.getDate() + 14);

    bookMoving(bookID, clientID, date, expire_date);
    render_index(res, list_books);
});


router.post('/back_book', (req, res) => {
    clientID = search_client_id(req);
    if (clientID == -1) {
        console.log("client wasn`t found");
        throw new Error('backbook error');
    }

    bID = -1;
    let bookID = req.body.bookID;
    for (let i = 0; i < list_clients[clientID].borrowed_books.length; i++) {
        if (list_clients[clientID].borrowed_books[i][0] == bookID) {
            bID = i;
            break;
        }
    }
    if (bID == -1) {
        console.log("book wasn`t found");
        throw new Error('backbook error');
    }
    bookMoving(bookID, clientID);
    render_index(res, list_books);
})

module.exports = router;
