var superagent = require('superagent');
var redis = require('redis');
var utility = require('achv-util'); /* your crawling target */
var util = utility();
var target = require('./lib/target.js'); /* your crawling target */

(function doCrawl()
{
  /* Step1 : init */
  var agent = superagent.agent(); /* hack for cookie handling */
  var tmax = target('tmax.co.kr');

  /* Step2 : crwal */
  tmaxAttend(agent, tmax);

  /* Step3 : finalize */
})();

///////////////////////////////////////////////////////////////////////////////
// Get page and call process
///////////////////////////////////////////////////////////////////////////////
function tmaxAttend(agent, tmax)
{
  agent
    .get(tmax.loginpage)
    .query({ userId: tmax.login.id, passwd: tmax.login.passwd })
    .end(function(err, res){
      var query = {};
      query.retStDate = util.getPrevdate(8);
      query.retEdDate = util.getPrevdate(1);
      query.countPerPage = 1000;
      query.empNm = '나정호';

      agent
        .get(tmax.crawlpage)
        .query(query)
        .end(function(err, res) {
          if (err)
            console.log(err);
          tmaxProcessAttend(res.text, query);
        });
    });

  agent
    .get(tmax.loginpage)
    .query({ userId: tmax.login.id, passwd: tmax.login.passwd })
    .end(function(err, res){
      var query = {};
      query.retStDate = util.getPrevdate(8);
      query.retEdDate = util.getPrevdate(1);
      query.countPerPage = 1000;
      query.empNm = '남윤수';

      agent
        .get(tmax.crawlpage)
        .query(query)
        .end(function(err, res) {
          if (err)
            console.log(err);
          tmaxProcessAttend(res.text, query);
        });
    });
}

///////////////////////////////////////////////////////////////////////////////
// Parse and act
///////////////////////////////////////////////////////////////////////////////
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function tmaxProcessAttend(text, query)
{
  /* Step1 : parsing */
  const dom = new JSDOM(text);
  const doc = dom.window.document;

  var text = doc.getElementsByClassName('table01')[0].tBodies[0].innerHTML;
  var badcount = (text.match(/지각Ⅱ/g) || []).length;
  var goodcount = (text.match(/정상/g) || []).length;

  /* Step2 : build info */
  var res = { name: query.empNm };
  res.weekly = { 
    start: query.retStDate,
    end: query.retEdDate,
    attend: {good: goodcount, bad: badcount}
  };
  res.ever = {
    attend: {good: goodcount, bad: badcount}
  }

  if (res.name == "나정호") {
    res.medal = { /* 0: disable, 1: enable */
      "후계자" : 1,
      "실장" : 1,
      "Maestro" : 1
    }
    res.notice = ["후계자 칭호를 얻었습니다.", "실장 칭호를 얻었습니다", "Maestro 칭호를 얻었습니다."];
  }
  else if (res.name == "남윤수") {
    res.medal = { /* 0: disable, 1: enable */
      "업적시스템의 아버지" : 1,
      "Super rookie" : 1
    }
    res.notice = ["업적시스템의 아버지 칭호를 얻었습니다.", "Super rookie 칭호를 얻었습니다."];
  }

  var resjson = JSON.stringify(res);

  /* Step3 : action */
  var client = redis.createClient(6379, '127.0.0.1');
  client.on('connect', function() {
    console.log('redis connected');
  });

  client.set("notice", "[\"Prototype 오픈했습니다. 아직 시작단계라서 추가할게 많네요.\"]", function(err, reply) {
      console.log("redis " + reply + "(system)");
  });

  client.set("weekly_news",
      "[\"나정호 gets 지각왕\", \"남윤수 gets 업적시스템 아버지\", \"나정호 gets 업적시스템 어머니\", \"나정호 gets 업적덕후\"]",
      function(err, reply) {
        console.log("redis " + reply + "(system)");
      });

  client.set("halloffame", "[\"Hall of Fame\", \"second ticket\", \"Third ticket\"]", function(err, reply) {
      console.log("redis " + reply + "(system)");
  });

  client.set(res.name, resjson, function(err, reply) {
      console.log("redis " + reply + "(attend)");
  });

  client.get(res.name, function(err, reply) {
    console.log(reply);
  });

  client.quit();
}
