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
    const number = 1000   //可在此設定獲取的社團數量
    try {
        const driver = chromeInstance.driver;
        await driver.get(keywords[0] + '&sk=friends');//好友列表
        let xpath
        xpath = '//div[@class="html-div xdj266r x11i5rnm x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd xieb3on"]'
        let icon = await driver.findElements(By.xpath(xpath))
        console.log(icon.length)
        if (icon.length === 1) {
            await driver.get(keywords[0] + '/friends');
        }
        let search_keyword = keywords[1]
        console.log("搜尋內容：" + search_keyword)
        xpath = '//label/input[@type="text"]'
        let searchBar = await driver.findElement(By.xpath(xpath));
        searchBar.sendKeys(search_keyword)
        xpath = "//div[@class='x78zum5 x1q0g3np x1a02dak x1qughib']"
        let friendParentsDiv = await driver.findElement(By.xpath(xpath));
        await driver.sleep(2000)
        let previousCount = 0;
        let currentCount = 0;
        let i
        xpath = "./div[contains(@class,'x6s0dn4')]"
        friendDivs = await friendParentsDiv.findElements(By.xpath(xpath))
        currentCount = friendDivs.length;
        for (i = previousCount; i < currentCount; i++) {//每個div組成by 頭貼、姓名＋共同好友、更多
            let div = friendDivs[i]
            let childDiv = await div.findElements(By.xpath('./div'))
            let div1 = childDiv[0]
            let div2 = childDiv[1];
            try {
                xpath = './/a/span'
                let nameDiv = await div2.findElement(By.xpath(xpath))
                let name = await nameDiv.getText();
                let linkDiv = await nameDiv.findElement(By.xpath('..'))
                let link = await linkDiv.getAttribute('href')
                let imageDiv = await div1.findElement(By.xpath('.//img'))
                let imageLink = await imageDiv.getAttribute('src')
                addTaskData({
                    name: name,
                    link: link,
                    imageLink: imageLink,
                })
            }
            catch (error) {
                try {
                    xpath = ".//span[@dir='auto']"
                    let nameDiv = await div2.findElement(By.xpath(xpath));
                    let name = await nameDiv.getText();
                    addTaskData({
                        name: name,
                        status: '帳號已刪除或有其他問題',
                    })
                } catch (error) {
                    throw new Error('無法獲取數據: ', error);
                }
            }
        }
        try {
            let friendDivs = await friendParentsDiv.findElements(By.xpath("./div[contains(@class,'x6s0dn4')]"));
        }
        catch (err) {
            console.log("沒有內容")
            return
        }
        while (currentCount !== previousCount) {
            previousCount = currentCount;

            // 滚动到底部
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(2000); // 等待内容加载

            // 检查当前抓取的好友数量
            let i
            xpath = "./div[contains(@class,'x6s0dn4')]"
            friendDivs = await friendParentsDiv.findElements(By.xpath(xpath))
            currentCount = friendDivs.length;
            for (i = previousCount; i < currentCount; i++) {//每個div組成by 頭貼、姓名＋共同好友、更多
                let div = friendDivs[i]
                let childDiv = await div.findElements(By.xpath('./div'))
                let div1 = childDiv[0]
                let div2 = childDiv[1];
                try {
                    xpath = './/a/span'
                    let nameDiv = await div2.findElement(By.xpath(xpath))
                    let name = await nameDiv.getText();
                    let linkDiv = await nameDiv.findElement(By.xpath('..'))
                    let link = await linkDiv.getAttribute('href')
                    let imageDiv = await div1.findElement(By.xpath('.//img'))
                    let imageLink = await imageDiv.getAttribute('src')
                    addTaskData({
                        name: name,
                        link: link,
                        imageLink: imageLink,
                    })
                }
                catch (error) {
                    try {
                        xpath = ".//span[@dir='auto']"
                        let nameDiv = await div2.findElement(By.xpath(xpath));
                        let name = await nameDiv.getText();
                        addTaskData({
                            name: name,
                            status: '帳號已刪除或有其他問題',
                        })
                    } catch (error) {
                        throw new Error('無法獲取數據: ', error);
                    }
                }
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
