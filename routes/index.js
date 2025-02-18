var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');

const localStrategy = require('passport-local'); 
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate('user');
  res.render('feed', { user, posts });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  let user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate('posts');  // populate the posts array with the actual post documents
  res.render("profile", { user });
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.dp = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

router.post("/register", function(req, res){
  const {username, email, fullname} = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    })
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){
});

router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
});

router.get('/add', function(req, res, next) {
  res.render('add');
});

// handle file upload
router.post('/upload',isLoggedIn, upload.single('file'), async (req, res) => {
  if(!req.file){
    return res.status(400).send("Please upload a file");
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({  // Create a new post
    image: req.file.filename,  
    posttext: req.body.posttext,  
    user: user._id  
  });

  user.posts.push(post._id);  // Push the post reference to the user's posts array
  await user.save();  // Save the user document
  res.redirect("/profile"); 
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;



// router.get('/alluserpost', async function(req, res, next) {
//   let user = await userModel.findOne({_id: "67a8e7096d7ea9511502f6b0"}).populate('posts');
//   res.send(user);
// });

// router.get('/createuser', async function(req, res, next) {
//   let createduser = await userModel.create({
//     username: "rahulkhawse",
//     password: "rahulllll",
//     email: "rahul@khawse.com",
//     fullname: "Rahul Khawse",
//     posts: [],
//   })
//   res.send(createduser);
// });

// router.get('/createpost', async function(req, res, next) {
//   let createdpost = await postModel.create({
//     posttext: "hello rahul this side ur cabin crew",
//     user: "67a8e7096d7ea9511502f6b0"
//   });
//   let user = await userModel.findOne({_id: "67a8e7096d7ea9511502f6b0"});
//   user.posts.push(createdpost._id);
//   await user.save();
//   res.send("done!");
// });