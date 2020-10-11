const express = require("express");
const bodyparser=require("body-parser");
const Mongoose=require("mongoose");
const _ = require("lodash");
const { static } = require("express");
const app=express();


app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

Mongoose.connect("mongodb+srv://admin-srishti20:Test123@cluster0.lfgho.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

const itemsSchema = new Mongoose.Schema({
    name: String
});

const Item = Mongoose.model("Item", itemsSchema);

const item1=new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hello, what are you gonna do today"
});

const item3 = new Item({
    name: "Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema={
    name: String,
    items:[itemsSchema]
};

const List= Mongoose.model("List", listSchema);

app.get("/", function(req,res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("successfully inserted items.");
                }
            
            });
            res.redirect("/");    
        }else{
            res.render("lists", {listTitle: "Today" , newListItem:foundItems});
        }
        
    });
    
    
    

});

app.post("/", function(req, res){
    const itemName= req.body.NewItem;
    const listName= req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
   

});

app.post("/delete", function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfully deleted");
            }
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});

app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, function(err, foundList)
    {
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("lists", {listTitle: foundList.name , newListItem:foundList.items});
            }
        }

    });
   
});

app.get("/about", function(req,res){
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
    console.log("server started");
});

