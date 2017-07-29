var superagent = require('superagent');
var agent = superagent.agent(); /* hack for cookie handling */

var target = require('./lib/target.js'); /* your crawling target */
var tmax = target('tmax.co.kr');

agent
.get(tmax.loginpage)
.query({ userId: tmax.user.id, passwd: tmax.user.passwd })
  .end(function(err, res){

    agent
      .get(tmax.crawlpage)
      .query(tmax.query)
      .end(function(err, res) {
        console.log(res.text);
      });
  });
