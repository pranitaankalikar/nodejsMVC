const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');



const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product=require('./models/product');
const User=require('./models/user');
const Cart=require('./models/cart');
const CartItem =require('./models/cart-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
  User.findAll({ where: { id: 1 } })
     .then(users=>{
       req.user=users[0];
       next();
     })
     .catch(err => console.log(err));

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through : CartItem });
Product.belongsToMany(Cart, { through : CartItem });  


sequelize
  //.sync({force:true})
  .sync()
  .then(result=>{
    return User.findAll({ where: { id: 1 } });
    
    // console.log(result);
  })
  .then(user=>{
    if(!user[0]){
      return User.create({name:'Pranita',email:'pranita@gmail.com'});
    }
    return user[0];
  })
  .then(user=>{
    return user.createCart();
  })
  .then(cart => {
    //console.log(user);
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
