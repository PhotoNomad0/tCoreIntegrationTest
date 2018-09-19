/* eslint-disable quotes,no-console */
const tCoreConnect = require('./tCoreConnect');

describe('Sample Test', () => {
  let app;

  beforeEach(async () => {
    app = await tCoreConnect.startApp();
  });

  afterEach(async() => {
    await tCoreConnect.stopApp(app);
  });

  it('opens a window', async() => {
    console.log("starting");
    await app.client.pause(5000).waitUntilWindowLoaded()
      .getWindowCount()
      .should.eventually.have.at.least(1);
    await app.client.browserWindow.isVisible().should.eventually.equal(true);
    await app.client.windowByIndex(1).waitUntilWindowLoaded().getText('button.btn-prime').then(function (text) {
      console.log('The button text content is ' + text);
    });
    await app.client.click('button*=Get');
    await app.client.pause(1000).click('button*=Project');
    await app.client.pause(1000).click('button[tabindex="0"]');
    await app.client.pause(1000).click('#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > button');
    console.log("showing local import");
    await app.client.pause(5000).getTitle().should.equal('Five');
  });

  // it('should get a url', async() => {
  //   await app.client.pause(1000).url(config.url)
  //     .getTitle()
  //     .should.eventually.include('DuckDuckGo');
  // });
  //
  // it('should search', async() => {
  //   const input = 'this is a test';
  //   await app.client.url(config.url)
  //     .setValue(SearchPage.searchField, input)
  //     .getValue(SearchPage.searchField)
  //     .should.eventually.equal(input)
  //     .click(SearchPage.searchButton)
  //     .element(SearchPage.searchResult)
  //     .should.eventually.exist;
  // });

});
