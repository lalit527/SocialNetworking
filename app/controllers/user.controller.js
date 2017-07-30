var mongoose = require('mongoose');
var express = require('express');

var userRouter = express.Router();
var userModel = mongoose.model('User');
var responseGenerator = require('./../../library/responseGenerator');
var auth = require("./../../middlewares/auth");

module.exports.controllerFunction = function(app){

   userRouter.get('/login/screen',function(req,res){
            
        res.render('login');

    });//end get login screen

     userRouter.get('/signup/screen',function(req,res){
            
        res.render('signup');

    });//end get signup screen

    userRouter.get('/dashboard',auth.checkLogin,function(req,res){
        
            res.render('dashboard',{user:req.session.user});
       

    });//end get dashboard

    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/login/screen');

      })  

    });//end logout
   
    
   userRouter.get('/:userName/info',function(req,res){

        userModel.findOne({'userName':req.params.userName},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  res.render('dashboard', { user:foundUser  });

            }

        });// end find
      

    });//end get all users

	userRouter.post('/signup', function(req, res){
           if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password


            });// end new user 

            newUser.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,err,500,null);
                   res.send(myResponse);
                  

                }
                else{
                    req.session.user = newUser;
                    delete req.session.user.password;
                    res.redirect('/user/dashboard');
                   
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
            });

            

        }
	});


	 userRouter.post('/login',function(req,res){

        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
                res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                var myResponse = responseGenerator.generate(false,"successfully logged in user",200,foundUser);
                //res.send(myResponse);
                req.session.user = foundUser;
                delete req.session.user.password;
                res.redirect('/user/dashboard')  

            }

        });// end find


    });// end login api


	 app.use('/user', userRouter);
}