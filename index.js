import express from 'express';
import session from 'express-session';
import { request } from 'undici';
import { twitterOAuth2 } from 'twitter-oauth2';
import * as http from 'http';
import moment from 'moment';
import * as momentTimeZone from 'moment-timezone'

import needle from 'needle';

const app = express();

const server = http.createServer(app);

import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi(
  'AAAAAAAAAAAAAAAAAAAAAGXEoQEAAAAAe9vnftE8zs2S%2FAHqCM79p6bFUkA%3D6MfAId2qEunWHWSzIvNLsKCCdk8Brtl3RkoSnQrpoiOxBG9YXH'
);

const readOnlyClient = twitterClient.readOnly;
var collection = [];
var latestDate =  moment().subtract(45, 'seconds').format('YYYY-MM-DDTHH:mm:ssZ');
var previousTime= moment();

app.get('/data', async function routeHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  // res.flushHeaders()
  setInterval(() => {
     getTweets(req, res).then(x=>{
      res.write(`data: ${x}\n\n`);
    });
   
  }, 20000);
});

async function getTweets(req, res) {

  try{
  collection=[];
  console.log("lateDate: " + latestDate);
  const currentDate = moment();
  console.log("setting start time less than 45 sec");
  let start_time = moment(latestDate).add(1,"seconds").format("YYYY-MM-DDTHH:mm:ssZ");
  console.log("startTimeinitial:"+ start_time);


  const duration = moment.duration(moment(start_time).diff(previousTime));
  console.log(`INTERVALDURATION : ${duration.asSeconds()}`);
  const end_time = moment().subtract(10,"seconds").format('YYYY-MM-DDTHH:mm:ssZ');

  // const end_time = currentDate.toISOString(currentDate.getTime() - 10000);
  // const start_time= currentDate.setDate(currentDate.getTime() - 60000)  // Subtracting 1 minute (60,000 milliseconds)
  // const start_time = currentDate.toISOString(currentDate.getDate() - 60000);
  console.log("start-date:" + start_time);
  console.log("end-date:" + end_time);
   const apiData = await readOnlyClient.v2.search({
    query: 'craftech360',
    expansions: 'referenced_tweets.id.author_id',
    "tweet.fields":'created_at',
    start_time: start_time,
    end_time: end_time
  });
  var tweets = apiData._realData
  // // console.log(JSON.stringify(tweets.includes));
  if (tweets.data) {
    let tweet =tweets.data.map(tweet => moment(tweet.created_at));
    console.log(tweet);
    latestDate = moment.max(tweet).format('YYYY-MM-DDTHH:mm:ssZ');
    console.log(latestDate);
    
    latestDate= moment(latestDate).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ssZ');
    console.log("latestDateRedifined" + latestDate);
    
    for (let index = 0; index < tweets.includes.users.length; index++) { 
      collection.push({
        id: tweets.data[index].id,
        username: tweets.includes.users[index].username,
        name: tweets.includes.users[index].name,
        profilePic: tweets.includes.users[index].profile_image_url,
        text: tweets.data[index].text,
        createdAt:tweets.data[index].created_at
      });
    }
    console.log(JSON.stringify(collection));
    return JSON.stringify(collection);
  }
  else{
    console.log("err");
    // res.write(collection);
    return JSON.stringify("");
  }}catch(err){
    return JSON.stringify(collection);
  }
  
}


app.listen(3002, () => {
  console.log('Server listening on port 3002');
});