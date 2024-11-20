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
    const number = parseInt(keywords[1], 10)  //可在此設定獲取的社團數量
    try {
        const driver = chromeInstance.driver;
        await driver.get('https://www.facebook.com/search/groups/?q=' + keywords[0]);
        let previousCount = 0;
        let currentCount = 0;
        let groupDivs
        let i = 0;
        xpath = "//div[@class='x1yztbdb']"
        groupDivs = await driver.findElements(By.xpath(xpath))
        currentCount = groupDivs.length
        for (i = previousCount; i < currentCount; i++) {
            let div = groupDivs[i]
            xpath = './/span/div/a'
            let a = await div.findElement(By.xpath(xpath))
            let groupName = await a.getText()
            let groupLink = await a.getAttribute('href')
            xpath = './/span/span'
            let span = await div.findElement(By.xpath(xpath))
            let remarkComplete = await span.getText()
            let remarkPart = remarkComplete.split(' · ')

            addTaskData({
                name: groupName,
                link: groupLink,
                privacy: remarkPart[0],
                numberOfPeople: remarkPart[1]
            })
        }
        while (currentCount !== previousCount) {
            previousCount = currentCount;

            // 滚动到底部
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(2000); // 等待内容加载

            xpath = "//div[@class='x1yztbdb']"
            groupDivs = await driver.findElements(By.xpath(xpath))
            currentCount = groupDivs.length
            for (i = previousCount; i < currentCount; i++) {
                let div = groupDivs[i]
                xpath = './/span/div/a'
                let a = await div.findElement(By.xpath(xpath))
                let groupName = await a.getText()
                let groupLink = await a.getAttribute('href')
                xpath = './/span/span'
                let span = await div.findElement(By.xpath(xpath))
                let remarkComplete = await span.getText()
                let remarkPart = remarkComplete.split(' · ')

                addTaskData({
                    name: groupName,
                    link: groupLink,
                    privacy: remarkPart[0],
                    numberOfPeople: remarkPart[1]
                })
            }
            if (currentCount >= number) {
                break;
            }
        }
        xpath = "//div[@class='x1yztbdb']"
        groupDivs = await driver.findElements(By.xpath(xpath))
        for (let i = 0; i < number; i++) {
            let div = groupDivs[i]
            xpath = './/span/div/a'
            let a = await div.findElement(By.xpath(xpath))
            let groupName = await a.getText()
            let groupLink = await a.getAttribute('href')
            xpath = './/span/span'
            let span = await div.findElement(By.xpath(xpath))
            let remarkComplete = await span.getText()
            let remarkPart = remarkComplete.split(' · ')

            addTaskData({
                name: groupName,
                link: groupLink,
                privacy: remarkPart[0],
                numberOfPeople: remarkPart[1]
            })
        }

    } catch (err) {
        console.error('ERROR:', err);
    }
    return 0
}

module.exports = run;
