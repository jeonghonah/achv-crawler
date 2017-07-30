'use strict';

module.exports = target;

function target(domain) {
  if (domain == 'tmax.co.kr') {
    return {
      loginpage: 'https://dtims.tmax.co.kr/checkUserInfo.tmv',
      crawlpage: 'https://dtims.tmax.co.kr/insa/attend/findAttdDailyConfirm.screen',
      query: {},
      login: {id: 'yourid', passwd: 'yourpasswd'},
    };
  }
  else {
    return {
      loginpage: 'https://example.com/login.html',
      crawlpage: 'https://example.com',
      query: {},
      login: {id: 'yourid', passwd: 'yourpasswd'},
    };
  }
}
