import { CommandsRegistry, registerCommand, runCommand } from "./commands/commands";
import { handlerGetUsers, handlerLogin, handlerRegister, handlerReset } from "./commands/users";
import { handlerAgg } from "./commands/aggregate";
import { handlerAddFeed, handlerFollowFeed, handlerListFeeds, handlerListFollowingFeeds, handlerUnfollowFeed } from "./commands/feeds";
import { middlewareLoggedIn } from "./middleware";
import { handlerBrowse } from "./commands/posts";


async function main() {
    const registry: CommandsRegistry = {};
    const cmdName = process.argv[2];
    const args = process.argv.slice(3);

    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerListFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollowFeed));
    registerCommand(registry, "following", middlewareLoggedIn(handlerListFollowingFeeds));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollowFeed));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));

    try {
        await runCommand(registry, cmdName, ...args);
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Error running command ${cmdName}: ${err.message}`);
        } else {
            console.error(`Error running command ${cmdName}: ${err}`);
        }
        process.exit(1);
    }

    process.exit(0);
}

main();