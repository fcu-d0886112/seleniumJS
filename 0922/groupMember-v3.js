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
    const number = parseInt(keywords[1], 10)   //可在此設定獲取的人數
    try {
        const driver = chromeInstance.driver;
        await driver.get(keywords[0] + '/members');
        let xpath = "//div[@role='list']"
        let divLists = await driver.findElements(By.xpath(xpath))
        let list
        console.log(divLists.length)
        if (divLists.length > 0) {
            list = divLists[divLists.length - 1]
        }
        else {
            console.log('找不到list')
            return
        }
        let currentCount = 0
        let previousCount = 0

        xpath = './*'
        let listitems = await list.findElements(By.xpath(xpath));
        currentCount = listitems.length
        let i = previousCount
        for (; i < currentCount; i++) {
            let listitem = listitems[i];
            xpath = './/span/a'
            let as = await listitem.findElements(By.xpath(xpath));
            let a = as[1]
            let name = await a.getText()
            let link = await a.getAttribute("href")
            addTaskData({
                name: name,
                link: link
            })
        }

        while (currentCount !== previousCount) {
            previousCount = currentCount;

            // 滚动到底部
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(2000); // 等待内容加载

            xpath = './*'
            let listitems = await list.findElements(By.xpath(xpath));
            currentCount = listitems.length
            let i = previousCount
            for (; i < currentCount; i++) {
                let listitem = listitems[i];
                xpath = './/span/a'
                let as = await listitem.findElements(By.xpath(xpath));
                let a = as[1]
                let name = await a.getText()
                let link = await a.getAttribute("href")
                addTaskData({
                    name: name,
                    link: link
                })
            }
            if (currentCount >= number) {
                break;
            }
        }


    } catch (err) {
        console.error('ERROR:', err);
    }
    return 0
}

module.exports = run;
