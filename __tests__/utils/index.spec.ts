import { line, desensitize, compareVersion } from "../../src/utils";
import { getConfig, getLangMessage, getRegistryConfig, isEnabled } from "../../src/common";

describe("utils", () => {
  it("getConfig", () => {
    const { nucm, npm, nrm } = getConfig();

    expect(nucm).toBeDefined();
    expect(npm).toBeDefined();
    expect(nrm).toBeDefined();
  });

  it("getLangMessage", () => {
    const lang = require("../../src/lang/index.js").default;
    expect(getLangMessage("MSG_showVersion", "cn")).toBe(lang["cn"]["MSG_showVersion"]);
    expect(getLangMessage("MSG_showVersion", "en")).toBe(lang["en"]["MSG_showVersion"]);
  });

  it("line", () => {
    expect(line("ceshi", 10)).toBe("----");
    expect(line("ceshicesh", 10)).toBe("-");
    expect(line("ceshiceshiceshi", 10)).toBe("-");
  });

  it("desensitize", () => {
    expect(desensitize("ce")).toBe("ce");
    expect(desensitize("ceshi", 10)).toBe("......eshi");
    expect(desensitize("ceshi1ceshi2ceshi3", 10)).toBe("ceshi1......shi3");
  });

  it("compareVersion", () => {
    expect(compareVersion("2", "1.2")).toBe(1);
    expect(compareVersion("1.1", "1.2")).toBe(-1);
    expect(compareVersion("1.1", "1.1")).toBe(0);
    expect(compareVersion("1.2", "1.1")).toBe(1);
    expect(compareVersion("1.2.1", "1.2")).toBe(1);
    expect(compareVersion("1.2.1", "1.2.3")).toBe(-1);
    expect(compareVersion("1.0.0", "1")).toBe(0);
  });

  it("getRegistryConfig", () => {
    expect(getRegistryConfig()).toEqual({});
    const { registry, registryName, _authtoken } = getRegistryConfig(getConfig());
    expect(registry).toBeDefined();
    expect(registryName).toBeDefined();
    expect(_authtoken).toBeDefined();
  });

  it("isEnabled", () => {
    expect(isEnabled(getRegistryConfig(getConfig()))).toBeTruthy();
    expect(isEnabled({})).not.toBeTruthy();
  });
});
