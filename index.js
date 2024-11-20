const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 初始化命令行接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 預設腳本路徑
let scriptPath = path.resolve(__dirname, '0922/adComment.js');
let driver;

// 顯示選單
function showMenu() {
    console.log('\n請選擇一個操作：');
    if (!driver) {
        console.log('1: 開啟 Chrome');
    }
    console.log('2: 執行腳本');
    console.log('q: 退出');
    rl.question('請輸入您的選擇: ', handleUserInput);
}

// 處理用戶輸入
async function handleUserInput(choice) {
    switch (choice.trim()) {
        case '1':
            if (driver) {
                console.log('Chrome已經啟動');
                showMenu();
                return;
            }
            await startChrome();
            break;
        case '2':
            if (!driver) {
                console.log('請先啟動 Chrome');
                showMenu();
                return;
            }
            rl.question(`請輸入要執行的腳本路徑（默認為 ${scriptPath}）: `, async (inputPath) => {
                // 如果用戶輸入了新的路徑，則更新腳本路徑，否則使用默認值
                if (inputPath.trim()) {
                    scriptPath = inputPath;
                }
                await executeScript();
            });
            break;
        case 'q':
            console.log('退出程序...');
            rl.close();
            process.exit(0);
            break;
        default:
            console.log('無效的選擇，請重新輸入。');
            showMenu(); // 顯示菜單，等待用戶輸入
            break;
    }
}

// 啟動Chrome的功能
async function startChrome() {
    try {
        const options = new chrome.Options();
        options.addArguments(`user-data-dir=${path.resolve(__dirname, 'user_data')}`);
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        console.log('Chrome已啟動');
    } catch (error) {
        console.error('無法啟動 Chrome: ', error);
    }
    showMenu(); // 回到菜單
}

// 執行腳本的功能
async function executeScript() {
    if (!scriptPath) {
        console.error('未提供腳本路徑');
        showMenu(); // 回到菜單
        return;
    }
    try {
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

        const chromeInstance = { driver };
        const params = { keywords: ['https://www.facebook.com/share/p/2LzDywRrsL7KLxMc/'] };
        const addTaskData = (data) => {
            console.log('抓取到的數據:', data);
        };

        const vmScript = new vm.Script(`
            (function(require, exports, module) {
                ${scriptContent}
            })
        `);
        const module = { exports: {} };
        vmScript.runInThisContext()(require, module.exports, module);

        if (typeof module.exports === 'function') {
            const result = await module.exports(chromeInstance, params, addTaskData);
            console.log('Script execution result:', result);
        } else {
            console.error('The script does not export a default function');
        }

    } catch (error) {
        console.error('無法讀取腳本文件:', error);
    }
    showMenu(); // 回到菜單
}


// 程序啟動
showMenu();
