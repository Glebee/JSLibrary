module.exports = class Client {
    constructor (obj_json){
       this.name = obj_json.name;
       this.borrowed_books = obj_json.borrowed_books;
    }
 }