module.exports = class Book {
    constructor(obj_json) {
      this.name = obj_json.name;
      this.year = obj_json.year;
      this.cover = obj_json.cover;
      this.id = obj_json.id;
      this.isbn = obj_json.isbn;
      this.author = obj_json.author;
      this.ed_code = obj_json.ed_code;
      this.publisher = obj_json.publisher;
      this.amount = obj_json.amount;
   }
}
