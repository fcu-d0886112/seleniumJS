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
        try {
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
        } catch (error) {
            console.log('無法操作scroll');
        }
        xpath = '//div[@class="html-div x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1gslohp"]'
        let commentList = await driver.findElements(By.xpath(xpath))

        xpath = './div[not(@class)]'

        let comments
        let i = 0
        let currentCount = 0, previousCount = -1
        comments = await commentList[0].findElements(By.xpath(xpath))
        currentCount = comments.length;
        for (; i < currentCount; i++) {
            let comment = comments[i]
            xpath = './/span/a[@tabindex="0"]'
            let a = await comment.findElement(By.xpath(xpath))
            let link = await a.getAttribute('href')
            xpath = './span/span'
            let span = await a.findElement(By.xpath(xpath))
            let name = await span.getText()
            addTaskData({
                name: name,
                link: link,
            })
        }
        while (currentCount !== previousCount) {
            previousCount = currentCount;

            // 滚动到底部
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(3000); // 等待内容加载


            xpath = './div[not(@class)]'
            comments = await commentList[0].findElements(By.xpath(xpath))
            currentCount = comments.length;
            for (i = previousCount; i < currentCount; i++) {
                let comment = comments[i]
                xpath = './/span/a[@tabindex="0"]'
                let a = await comment.findElement(By.xpath(xpath))
                let link = await a.getAttribute('href')
                xpath = './span/span'
                let span = await a.findElement(By.xpath(xpath))
                let name = await span.getText()
                addTaskData({
                    name: name,
                    link: link,
                })
            }

            if (currentCount === number) {
                break;
            }
        }

    } catch (err) {
        console.error('ERROR:', err);
    }
    return 0
}

module.exports = run;
