import "colors";
import shell from "shelljs";
import inquirer from "inquirer";
import pkg from "../../package.json";
import { getLangMessage, getConfig, setConfig, getRegistryConfig, isEnabled } from "../common";
import { compareVersion } from "../utils/index";
import { addUser, removeUser } from "./base";
/**
 * 更新版本
 * @param 是否自动校验
 */
export function updateVersion(option) {
  const config = getConfig();
  let baseConfig = config.nucm?.baseConfig;
  !baseConfig && (baseConfig = config.nucm.baseConfig = {});
  baseConfig.checkUpdateDate = Date.now();
  setConfig("nucm", config.nucm); // 更新校验时间记录

  const curVersion = pkg.version;
  console.log(getLangMessage("MSG_update01").green);
  const latestVersion = shell
    .exec("npm view nucm version --registry='https://registry.npmjs.org/'", { silent: true })
    .stdout.trim();
  if (!curVersion || !latestVersion) {
    console.log(getLangMessage("MSG_update02").red);
    return;
  }
  const status = compareVersion(curVersion, latestVersion);
  if (status === -1) {
    if (option.silent) {
      console.log(getLangMessage("MSG_updateTips").red);
      return;
    }
    // 存在新版本
    let message = `${getLangMessage("MSG_updateTips")}\n🌟 nucm  ${curVersion.green}  →  ${
      latestVersion.red
    }`;

    inquirer
      .prompt([
        {
          type: "confirm",
          message,
          name: "result"
        }
      ])
      .then(answers => {
        if (answers.result) {
          shell.exec("npm install -g nucm@latest"); // 更新最新版本
        }
      });
  } else {
    // 当前已是最新版本
    if (option.silent) return;
    console.log(getLangMessage("MSG_updateLatest").green);
  }
}

/** 切换语言 */
export function changeLang(language) {
  const config = getConfig();
  let baseConfig = config.nucm?.baseConfig;
  !baseConfig && (baseConfig = config.nucm.baseConfig = {});
  if (["en", "cn"].includes(language)) {
    baseConfig.lang = language;
    setConfig("nucm", config.nucm);
    console.log(`${getLangMessage("MSG_langChanged")} ${language}`.green);
  } else {
    console.log(getLangMessage("MSG_changeLang").red);
  }
}

/** 查询当前 token 信息，并存储 */
export function searchToSave() {
  const config = getConfig();
  const registryConfig = getRegistryConfig(config);
  if (!isEnabled(registryConfig)) return;
  if (!registryConfig._authtoken) {
    console.log(getLangMessage("MSG_save_04").red);
    return;
  }
  const accountList = config.nucm[registryConfig.registryName] || {};
  const account = Object.keys(accountList).filter(
    name => accountList[name] && accountList[name]["access-tokens"] === registryConfig._authtoken
  );
  const tokenTag = `nucm_${Date.now()}`;

  if (account.length > 0) {
    inquirer
      .prompt([
        {
          type: "confirm",
          message: getLangMessage("MSG_save_01"),
          name: "check"
        }
      ])
      .then(answers => {
        if (answers.check) {
          inquirer
            .prompt([
              {
                type: "input",
                message: getLangMessage("MSG_save_02"),
                name: "name",
                default: tokenTag
              }
            ])
            .then(a => {
              if (a.name) {
                removeUser(account[0]);
                addUser(a.name, registryConfig._authtoken);
              }
            });
        }
      });
  } else {
    inquirer
      .prompt([
        {
          type: "input",
          message: getLangMessage("MSG_save_03"),
          name: "name",
          default: tokenTag
        }
      ])
      .then(answers => {
        if (answers.name) {
          addUser(answers.name, registryConfig._authtoken);
        }
      });
  }
}
