import { readConfig, setUser } from "../config";
import { createUser, deleteAllUsers, getUser, getUsers } from "../lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error(`usage: ${cmdName} <name>`);
    }
    const cmdArg = args[0];
    const user = await getUser(cmdArg);
    if (!user) {
        throw new Error(`user ${cmdArg} does not exist`);
    }
    setUser(cmdArg);
    console.log(`User has been set to ${cmdArg}!`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error(`usage: ${cmdName} <name>`);
    }
    const cmdArg = args[0];
    let user = await getUser(cmdArg);
    if (user) {
        throw new Error(`user ${user.name} already exists`);
    }
    user = await createUser(cmdArg);
    setUser(user.name);
    console.log("User created!");
    console.log(` id: ${user.id}`);
    console.log(` name: ${user.name}`);
    console.log(` updatedAt: ${user.updatedAt}`);
    console.log(` createdAt: ${user.createdAt}`);
}

export async function handlerReset(_: string): Promise<void> {
    await deleteAllUsers();
    console.log("User table reset!")
}

export async function handlerGetUsers(_: string): Promise<void> {
    const users = await getUsers();
    const currentUserName = readConfig().currentUserName;
    for (const user of users) {
        console.log(`* ${user.name}${currentUserName === user.name ? " (current)" : ""}`);
    }
}