//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB")

const todolistSchema={
  name : String
}
const Item = mongoose.model(
  "Item",
  todolistSchema
)
const Item1 = new Item({
  name: "welcome to your to do list"
})
const Item2 = new Item ({
  name : "press + icon to add "
})
const Item3 = new Item({
  name : "<-- click here to delete"
})
const ItemArray = [Item1,Item2,Item3]
const listSchema ={
  name: String,
  items: [todolistSchema]
}
const List = mongoose.model("List",listSchema)

app.get("/", function(req, res) {
  Item.find( { }, function(err, result){
    if (result.length===0){
      
Item.insertMany(ItemArray,function(err){
  if (err){
    console.log(err)
  }
  else{
    console.log("successfully added");
  }
})
res.redirect("/")
    } else{
    res.render("list", {listTitle: "Today", newListItems:result});
}})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
 const item = new Item ({
   name : itemName
 })
 if (listName==="Today"){
item.save()
res.redirect("/")
 }
 else{
   List.findOne({name:listName},function(err, foundList){
     foundList.items.push(item)
     foundList.save()
     res.redirect("/" + listName)
   })
 }
});

app.post("/delete", (req,res)=>{
  const deleteId = req.body.checkbox
  const listName = req.body.listName
  if (listName==="Today"){
    Item.findByIdAndRemove(deleteId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("deleted successfully");
      }
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: deleteId}}},function(err,foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    })
  }
})


app.get("/:customListName",(req,res)=>{
 const customListName = _.capitalize(req.params.customListName)
 List.findOne({name:customListName},function(err, foundList){
 if (!err){
   if (!foundList){
    const list= new List({
      name : customListName,
      items: ItemArray
    })
    list.save()
    res.redirect("/" + customListName)
   }
   else{
    res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
   }
   
 }



 })

})       

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
