const mongoose = require('mongoose');

const { Schema , model } = mongoose;

const schema = new Schema({
    todolist : String
})

const List = model("List",schema);
export default List;