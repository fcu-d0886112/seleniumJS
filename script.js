const { WebDriver, By, until, WebElement } = require('selenium-webdriver');

/**
 * @param {object} chromeInstance - chrome 的實例
 * @param {WebDriver} chromeInstance.driver - Selenium WebDriver
 * @param {object} params - 傳入的參數
 * @param {Array<string>} params.keywords - 傳入的 keywords，這個是一個 Array
 * @param {function} addTaskData - 用於保存抓取到的Function
 */

const config = require('./config')
const fbEmail = config.email
const fbPassword = config.password

async function run(chromeInstance, params, addTaskData) {
    const keywords = params.keywords; // keywords，依照實際場景傳入的參數可以是網址，或是文字，但一定都會是 array of string
    const number = 1000   //可在此設定獲取的人數
    let xpath
    try {
        const driver = chromeInstance.driver;
        await driver.get(keywords[0]);
        try {//登入（有可能畫面不顯示）
            let emailInput = await driver.wait(until.elementLocated(By.css('#\\:rb\\:')), 10000);
            await emailInput.sendKeys(fbEmail)
            let passInput = await driver.findElement(By.css('#\\:re\\:'));
            await passInput.sendKeys(fbPassword)
            let loginButton = await driver.findElement(By.css('#login_popup_cta_form > div > div:nth-child(5) > div'));
            await loginButton.click()
        } catch (error) {
            console.log('未檢測到登入視窗，可能已經登入，繼續操作');
        }
        try {
            xpath = '//div[@aria-label="留言"]'
            let commentButtons = await driver.findElements(By.xpath(xpath))
            if (commentButtons.length === 1) {
                let commentButton = commentButtons[0]
                await driver.executeScript("arguments[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });", commentButton);
                commentButton.click()
            }

        } catch (error) {
            console.log('不用切換頁面');
        }
        try {
            xpath = '//div[@class="x78zum5 xdt5ytf x1iyjqo2 x6ikm8r x1odjw0f"]'
            let commentScroll = await driver.wait(until.elementLocated(By.xpath(xpath)), 10000)
            console.log(await commentScroll.getAttribute("class"))

            xpath = './../div[contains(@class,"x8cjs6t")]//div[@role="button"]'
            let commentChoose = await commentScroll.findElement(By.xpath(xpath))
            commentChoose.click()

            xpath = '//span[text()="所有留言"]/../../../..'
            commentChoose = await commentScroll.findElement(By.xpath(xpath))
            commentChoose.click()

            let continueScrolling = true
            while (continueScrolling) {
                try {
                    await driver.executeScript("arguments[0].scrollTop = arguments[0].scrollHeight;", commentScroll);
                    await driver.sleep(2000);

                    const xpath = '//span[text()="查看更多留言"]/../..';
                    commentChoose = await commentScroll.findElement(By.xpath(xpath));

                    await commentChoose.click();
                } catch (error) {
                    if (error.name === 'NoSuchElementError') {
                        console.log("找不到更多留言按鈕，停止滾動。");
                        continueScrolling = false;
                    } else {
                        console.error("找留言出現其他錯誤:", error);
                        throw error;
                    }
                }
            }
            xpath = '//div[@class="xwib8y2 xn6708d x1ye3gou x1y1aw1k"]'
            let comments = await driver.findElements(By.xpath(xpath));
            for (let comment of comments) {
                xpath = './/a'
                let a = await comment.findElement(By.xpath(xpath));
                let link = await a.getAttribute('href')
                xpath = './span/span'
                let span = await a.findElement(By.xpath(xpath));
                let name = await span.getText()
                addTaskData({
                    name: name,
                    link: link,
                })
            }
            return
        } catch {
            console.log('非直播影片');
        }
        try {
            xpath = '//div[@class="x9f619 x78zum5 xdt5ytf x1odjw0f xish69e x1xzabdm xh8yej3"]'//scroll
            let commentScroll = await driver.wait(until.elementLocated(By.xpath(xpath)), 10000)
            console.log(await commentScroll.getAttribute("class"))

            xpath = './/div[@class="xwib8y2 xn6708d x1ye3gou x1y1aw1k"]'
            let comments = await driver.findElements(By.xpath(xpath));
            for (let comment of comments) {
                xpath = './/a'
                let a = await comment.findElement(By.xpath(xpath));
                let link = await a.getAttribute('href')
                xpath = './span/span'
                let span = await a.findElement(By.xpath(xpath));
                let name = await span.getText()
                addTaskData({
                    name: name,
                    link: link,
                })
            }
        } catch {
            console.log('非直播');
        }

    } catch (err) {
        console.error('ERROR:', err);
    }
    return 0
}

module.exports = run;
