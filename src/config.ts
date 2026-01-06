import fs from "fs";
import os from "os";

type Config = {
    dbUrl: string,
    currentUserName: string,
}

export function setUser(username: string) {
    const cfg = readConfig();
    cfg.currentUserName = username
    writeConfig(cfg);
}

export function readConfig() {
    const filePath = getConfigFilePath();
    const data = fs.readFileSync(filePath, {encoding: "utf-8"});
    const rawConfig = JSON.parse(data);
    return validateConfig(rawConfig);
}

function getConfigFilePath(): string {
    return `${os.homedir}/.gatorconfig.json`;
}

function writeConfig(cfg: Config): void {
    const data = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    }
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(data, null, 2), { encoding: "utf-8" });
}

function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    if (
        !rawConfig.current_user_name ||
        typeof rawConfig.current_user_name !== "string"
    ) {
        throw new Error("current_user_name is required in config file");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };

    return config;
}