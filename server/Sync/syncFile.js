import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';
import { _Sections,_Topics,_Resources,_SearchData, _Statistics ,_Deleted,_Egranary } from '../../Collections/collections.js';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function(){
     fs = Npm.require('fs');
     http = require('http');
      util = require('util');
      request = require('request');
      Fiber = require('fibers');

var bodyParser = Npm.require('body-parser');
Picker.middleware(bodyParser.urlencoded({ extended: false }));
Picker.middleware(bodyParser.json());


      var postRoutes = Picker.filter(function(req, res) {
        // you can write any logic you want.
        // but this callback does not run inside a fiber
        // at the end, you must return either true or false
        return req.method == "POST";
      });

});
var resourceSize = 0;
var resourceIndex = 0;
var resources = [];
var failedResources = [];
var resourceName = "";
var chunkSize = 0;
var getResourceRuning = false;


const files = {section:'syncSection.js',topic:'syncTopic.js',resource:'syncResource.js'};
const mCollections = {section:_Sections,topic:_Topics,resource:_Resources,'delete':_Deleted,'egranary':_Egranary};
// const hostUrl = 'http://192.168.8.150:3000/';
const hostUrl = 'http://52.42.16.134/';
//const hostUrl = 'localhost:3000/';

const syncPath = process.env.PWD+'/public/syncFile/';
const uploadPath = process.env.PWD+'/public/uploads/';
const _SCHOOL = "kijabe";//config
//Cloud
//const uploadPath = 'www/manoap/bundle/programs/web.browser/app/private/';


//write to section
Meteor.methods({
  deleteFile:function(file){

    var path = uploadPath+file;
    var fileStatus = fs.lstatSync(path);
    if(fileStatus){
      fs.unlinkSync(path);
    }

  }
});





//send Statistics
Meteor.methods({
  sendStatistics:function(statistics){

    var url = hostUrl+'stats';//"http://localhost:3000/stats";
    //var data = EJSON.stringify(statistics);

    HTTP.call("POST", url,
          {params:{statistics:statistics,sch:_SCHOOL}},
          function (error, result) {
            console.log(url,result);

            if (!error) {
            return true;
          }else{
            return false;
          }
          });
  }
});


//send user accounts-base
//send Statistics
Meteor.methods({
  sendUsers:function(){

    var url = hostUrl+'users';//"http://localhost:3000/stats";
    //console.log(users);
    var users = [];
    var usersData = Meteor.users.find({'emails.address':{$ne:'admin@admin.com'}});

    usersData.forEach(function(v){
      users.push(v);
    });
    users = JSON.stringify(users);


    HTTP.call("POST", url,
          {params:{users:users,sch:_SCHOOL}},
          function (error, result) {
            if (!error) {
            return true;
            console.log(url,result);
          }else{
            return false;
          }
          });
  }
});




//save Statistics
Meteor.methods({
  insertUsage:function(data,freq,sch,accStat){
    var id = data.id;
    var material = data.material;
    var url = data.url;
    var page = data.page;
    var user = data.user
    var date = data.date;
    var _id = id+user;

    if (!data.statsg) {//check if user has statistics.
        Meteor.users.update({
            _id: user},
            {$set: {
            "profile.stats": 1
            }
        }, (error, success) => {
            console.log(success); //ToDO
        });
    }



    //console.log("freq",freq);

    if(freq == undefined){
      freq = 1;
    }else{
      freq = data.freq;
    }


        if(sch == undefined){
          sch = _SCHOOL;
        }

    _Statistics.update(
      {_id:_id},
      {$set:{sch:sch,material:material,url:url,page:page,date:date,user:user,id:id},$inc:{freq:freq}},
      {upsert:true}
    );


  }
});


//save user accounts sent from remote school
Meteor.methods({
  insertUser:function(data,sch){
    var id = data._id;
    var emails = data.emails;
    var profile = data.profile;
      profile['sch'] = sch;


    Meteor.users.update(
      {_id:id},
      {$set:{emails:emails,profile:profile}},
      {upsert:true}
    );

}

});




//getJSONFileContent
Meteor.methods({
  getSyncContent:function(fileType,sch,reset){
    var val = false;
    var status = true;
    var results = null;
  if(mCollections[fileType] == undefined){
    return null;
  }else if (reset) {
    val = true;
    status =false;
  }

  var data = [];
  var query = {};
  query['sync.'+sch] = val;

  if(fileType == 'egranary'){
     results =   mCollections[fileType].find({});

  }else {

     results =   mCollections[fileType].find({query});
  }

    results.forEach(function(v){
      let id = v._id;
      let sync = v.sync;

      if(sync == undefined){
        sync = {};
      }

      sync[sch] = status;

      /*update db
     mCollections[fileType].update({_id:id},{$set:{sync:{kijabe:false,kisumu:false}}});
     **/

     //update the db. tell the sys that which school has synced
     mCollections[fileType].update({_id:id},{$set:{sync}});

      data.push(v);

    });
    //console.log("DATA",data);

    try {
      //console.log(JSON.parse(data));
      return data;
    }catch(e){
      return null;
    }

  }
});


//getResource
Meteor.methods({
getResource: function(resourcesData) {

  console.log("INDEX = "+resourceIndex,"RESOURCES =>"+resources.length);

 if (Array.isArray(resourcesData)  && resourcesData.length > 0) {
    resourceIndex =0;
    resources = resourcesData;
    console.log("new  resources loaded ==>"+resources.length);
  }else if (resources.length == 0 ) {
    //no resources found resources.length < 1 && Array.isArray(resourcesData)
    console.log("no resources found ");
    return ;                                 //remove in production
  }else if (resourceIndex == resources.length || resourceIndex > 7) {
    //All resources downloaded               //remove in production
    console.log("All resources downloaded => "+ resources.length);
    return;
  }

    var resource = resources[resourceIndex];
    resourceName =resource.name;
     resourceSize = resource.size;
    var path = uploadPath+resourceName;
    var length = resources.size;
    var fileStatus = true;//if set to false. file won't be downloaded

    fs.stat(path, function(err, stats) {

      //check if file already exists and is of the same size

      if(stats && stats.size == resourceSize){
     //file already exist and is ok
        console.log(resourceName+" =>"+stats.size +" <=> "+ resourceSize);
        //console.log(path+" => "+stats.size);
        console.log('skipped resource '+ path);
        resourceIndex++;
        fileStatus = false;

        Fiber(function(){//download next file
          Meteor.call('getResource',[]) //##################################
        }).run();

        //return ;
      }else if (stats && stats.size !== resourceSize && !err) {
          console.log('BROKEN FILE '+resourceName+" =>"+stats.size +" <=> "+ resourceSize);

        // file already exist and is broken or needs to be replaced
      // fs.unlinkSync(path);//delete file #############################
        // download missing file
        fileStatus = true;

      }else if (err && err.errno === 34) {


      //  console.log("FILE MISSING,STATS",stats,"ERROR",err);

        //file does not exit (err && err.errno === 34)
        //download missing file
        fileStatus = true;
      }

    });

    if (!fileStatus) {
      Fiber(function(){//download next file
        Meteor.call('getResource',[]) //##################################
      }).run();
          return ;
    }

    console.log('downloading...'+resourceName);

            var url = hostUrl+"uploads/"+resourceName;
            var file = fs.createWriteStream(path);
            var isNext =false;
            var req = http.request(url,function(response){
              console.log('requedst sent'+resourceName);

              response.on('data',function(chunk){
                //check progress.
                let size = chunk.length;
            //    console.log('chunk found for => '+resourceName+' SIZE =>'+resourceSize);
              //  console.log('chunk size => '+size);
                chunkSize += size;
            //   console.log('chunk progress => '+chunkSize);
                //start  downloading a new file if current file is almost done
                var diff = Math.floor(resourceSize - chunkSize);

                console.log('chunk progress  diff => '+diff+" CHUNK =>"+size);
              if((diff < 500000 ) && !isNext){//if 500000bytes 1/2mb remaining
                isNext = true;
                console.log('NEXT FILE chunk progress < 1MB => '+diff);
                resourceIndex++;

                Fiber(function(){//download next file
                  Meteor.call('getResource',[])
                }).run();

              }

                file.write(chunk);
              });

              response.on('error',function(err){

                console.log("ERROR: "+ err);


              });

            });

            req.on('error', (e) => {
  console.log('file not found => '+resourceName+' '+e.message);
  failedResources.push(resourceName);
  resourceIndex++;

  // Fiber(function(){//download next file
  //   Meteor.call('getResource',[])
  // }).run();


});

   req.end("all resourced downloaded");


 }
});

//get Resource progeress
Meteor.methods({
  getResourceProgress: function(resourcesData) {

    if(!getResourceRuning){
      return false;
    }

    let resources =resources.length;
    return{resourceName:resourceName,resourceSize:resourceSize,
      chunkSize:chunkSize,resources:resources,resourceIndex:resourceIndex};

  }


});


//check if file exist
Meteor.methods({
  resourceExists: function(path) {
    var status = false;

    try {
      var stats=  fs.accessSync(path);
      status = true;
    } catch (e) {
      //console.log(e);
      status = false;
    } finally {
      return status;
    }

}

});


//syncApp
WebApp.connectHandlers.use("/syncApp", function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  var file = req.query.file;
  var sch = req.query.sch;
  var reset = req.query.reset;

  if(file == undefined || sch == undefined) {
    res.end('request undefined',);
  }else if (reset == undefined) {
    reset = false;
  }

console.log("linked",file);
  var content = Meteor.call('getSyncContent',file,sch,reset);
  var data = [];
  var dataJSON = "";
  if(file == "resource"){

    //check to make sure that the file actually exists
    var cleanData = [];
    content.forEach(function(v){
      let path = uploadPath+v.file['name'];
      var status = Meteor.call('resourceExists',path);
    //  console.log(status);
     if(status){
       cleanData.push(v);
     }

    });

    var data =JSON.stringify(cleanData);
    var dataJSON = EJSON.stringify(data);

  }else {

      var data =JSON.stringify(content);
      var dataJSON = EJSON.stringify(data);
  }


  res.end(dataJSON);
});

//receive Statistics


Picker.route('/stats/', function(params, req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  var statistics = req.body.statistics;
  var sch = req.body.sch;
//console.log('mmmmmmmmmmmmm');

   if(statistics == undefined){
     console.log("STATAS FAILED");
  res.end('request undefined',);
  return;
}
var stats = EJSON.parse(statistics);

_Statistics.remove({sch:sch});//clear old statistics

stats.forEach(function(v,k,arr){

Meteor.call('insertUsage',v,true,sch);

});

console.log('inserted statistics=> '+stats.length);


res.end('statistics saved to cloud');
});



//receive users accounts
    Picker.route('/users', function(params, req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);
  var users = req.body.users;
  var sch = req.body.sch;
  //console.log('mmmmmmmmmmmmm');

  var users = EJSON.parse(users);
  //console.log(users);
  if(users == undefined){
    res.end('request undefined',);
    return;
  }


users.forEach(function(v,k,arr){

 Meteor.call('insertUser',v,sch);

});

console.log('users inserted=> '+users.length);


  res.end('accounts saved to cloud');
});


//debug
