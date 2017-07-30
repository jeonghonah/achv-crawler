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
      tmax.query.retStDate = util.getPrevdate(8);
      tmax.query.retEdDate = util.getPrevdate(1);
      tmax.query.countPerPage = 1000;
      tmax.query.empNm = '나정호';

      console.log(tmax.query.retStDate);
      console.log(tmax.query.retEdDate);

      agent
        .get(tmax.crawlpage)
        .query(tmax.query)
        .end(function(err, res) {
          if (err)
            console.log(err);
          tmaxProcessAttend(res.text, tmax);
        });
    });
}

///////////////////////////////////////////////////////////////////////////////
// Parse and act
///////////////////////////////////////////////////////////////////////////////
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function tmaxProcessAttend(text, tmax)
{
  /* Step1 : parsing */
  const dom = new JSDOM(text);
  const doc = dom.window.document;

  var text = doc.getElementsByClassName('table01')[0].tBodies[0].innerHTML;
  var badcount = (text.match(/지각Ⅱ/g) || []).length;
  var goodcount = (text.match(/정상/g) || []).length;

  /* Step2 : build info */
  var res = { name: tmax.query.empNm };
  res.weekly = { 
    start: tmax.query.retStDate,
    end: tmax.query.retEdDate,
    attend: {good: goodcount, bad: badcount}
  };
  res.ever = {
    attend: {good: goodcount, bad: badcount}
  }
  res.medal = { /* 0: disable, 1: enable */
    "후계자" : 1,
    "실장" : 1
  }
  res.notice = ["후계자 칭호를 얻었습니다.", "실장 칭호를 얻었습니다"];
  var resjson = JSON.stringify(res);

  /* Step3 : action */
  var client = redis.createClient(6379, '127.0.0.1');
  client.on('connect', function() {
    console.log('redis connected');
  });

  client.set(res.name, resjson, function(err, reply) {
      console.log("redis " + reply + "(attend)");
  });

  client.get(res.name, function(err, reply) {
    console.log(reply);
  });

  client.quit();
}
