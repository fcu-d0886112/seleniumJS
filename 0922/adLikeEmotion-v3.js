const { WebDriver, By, until, WebElement } = require('selenium-webdriver');

/**
 * @param {object} chromeInstance - chrome 的實例
 * @param {WebDriver} chromeInstance.driver - Selenium WebDriver
 * @param {object} params - 傳入的參數
 * @param {Array<string>} params.keywords - 傳入的 keywords，這個是一個 Array
 * @param {function} addTaskData - 用於保存抓取到的Function
 */


async function run(chromeInstance, params, addTaskData) {
    const keywords = params.keywords; // keywords，依照實際場景傳入的參數可以是網址，或是文字，但一定都會是 array of string
    const number = 1000   //可在此設定獲取的人數
    let xpath
    try {
        const driver = chromeInstance.driver;
        await driver.get(keywords[0]);

        xpath = '//div[text()="所有心情："]'
        let motionSpan = await driver.findElement(By.xpath(xpath))
        await driver.executeScript("arguments[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });", motionSpan);
        let motionButton = await motionSpan.findElement(By.xpath('..'))
        motionButton.click()
        xpath = '//div[contains(@class,"xwib8y2 xkhd6sd")]'
        let scrollParent = await driver.wait(until.elementLocated(By.xpath(xpath)), 10000)
        xpath = './/div[@class="x78zum5 xdt5ytf xz62fqu x16ldp7u"]'
        let itemList = await scrollParent.findElements(By.xpath(xpath))
        let preCount = -1, curCount = 0
        let i = 0

        for (; i < itemList.length; i++) {
            let item = itemList[i]
            xpath = './/a'
            let a = await item.findElement(By.xpath(xpath))
            let link = await a.getAttribute('href')
            let name = await a.getText()
            addTaskData({
                name: name,
                link: link,
            })
        }

        while (preCount != curCount) {
            preCount = curCount
            await driver.executeScript("arguments[0].scrollTop = arguments[0].scrollHeight;", scrollParent);
            await driver.sleep(3000)
            xpath = './/div[@class="x78zum5 xdt5ytf xz62fqu x16ldp7u"]'
            itemList = await scrollParent.findElements(By.xpath(xpath))
            for (; i < itemList.length; i++) {
                let item = itemList[i]
                xpath = './/a'
                let a = await item.findElement(By.xpath(xpath))
                let link = await a.getAttribute('href')
                let name = await a.getText()
                addTaskData({
                    name: name,
                    link: link,
                })
            }
            curCount = itemList.length
        }


    } catch (err) {
        console.error('ERROR:', err);
    }
    return 0
}

module.exports = run;
