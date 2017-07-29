var superagent = require('superagent');
var agent = superagent.agent(); /* hack for cookie handling */

var target = require('./lib/target.js'); /* your crawling target */
var tmax = target('tmax.co.kr');

var utility = require('achv-util'); /* your crawling target */
var util = utility();

(function doCrawl()
{
  /* A list of crawling target */
  tmaxAttend(agent);
})();

///////////////////////////////////////////////////////////////////////////////
// Get page and call process
///////////////////////////////////////////////////////////////////////////////
function tmaxAttend(agent)
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
          tmaxProcessAttend(res.text);
        });
    });
}

///////////////////////////////////////////////////////////////////////////////
// Parse and act
///////////////////////////////////////////////////////////////////////////////
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function tmaxProcessAttend(text)
{
  /* Step1 : parsing */
  const dom = new JSDOM(text);
  const doc = dom.window.document;

  var text = doc.getElementsByClassName('table01')[0].tBodies[0].innerHTML;
  var badcount = (text.match(/지각Ⅱ/g) || []).length;
  var goodcount = (text.match(/정상/g) || []).length;

  /* Step2 : action */
  console.log("bad:" + badcount);
  console.log("good:" + goodcount);
}
