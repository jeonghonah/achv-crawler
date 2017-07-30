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
    .query({ userId: tmax.user.id, passwd: tmax.user.passwd })
    .end(function(err, res){
      tmax.query.retStDate = util.getPrevdate(8);
      tmax.query.retEdDate = util.getPrevdate(1);

      console.log(tmax.query.retStDate);
      console.log(tmax.query.retEdDate);

      agent
        .get(tmax.crawlpage)
        .query(tmax.query)
        .end(function(err, res) {
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

  /* Step2 : action */
  var res = { name: tmax.query.empNm };
  res.weekly = { 
    start: tmax.query.retStDate,
    end: tmax.query.retEdDate,
    attend: {good: goodcount, bad: badcount}
  };
  var resjson = JSON.stringify(res);

  var client = redis.createClient(6379, '127.0.0.1'); //creates a new client
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
