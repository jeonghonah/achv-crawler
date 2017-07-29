'use strict';

module.exports = target;

function target(domain) {
  if (domain == 'tmax.co.kr') {
    return {
      loginpage: 'https://dtims.tmax.co.kr/checkUserInfo.tmv',
      crawlpage: 'https://dtims.tmax.co.kr/insa/attend/findAttdDailyConfirm.screen',
      query: { countPerPage: 1000, retStDate:'2017.07.15', retEdDate:'2017.07.15'},
      user: {id: 'yourid', passwd: 'yourpasswd'},
    };
  }
  else {
    return {
      loginpage: 'https://example.com/login.html',
      crawlpage: 'https://example.com',
      query: { },
      user: {id: 'yourid', passwd: 'yourpasswd'},
    };
  }
}
