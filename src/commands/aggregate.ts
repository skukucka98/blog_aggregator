import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { createPost } from "src/lib/db/queries/posts";
import { fetchFeed } from "src/rssFeed";

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <time_between_reqs>`);
    }

    const durationStr = args[0];
    const timeBetweenRequests = parseDuration(durationStr);
    if (timeBetweenRequests <= 0) {
        throw new Error("Duration must be a positive number. For Example: 100ms, 5s, 1m, 24h")
    }

    let durationLog = "";
    for(const timeframe of ["ms", "s", "m", "h"]) {
        if (durationStr.includes(timeframe)) {
            durationLog = durationStr + durationLog;
            break;
        }
        durationLog = `0${timeframe}` + durationLog;
    }
    console.log(`Collecting feeds every ${durationLog}`);

    const handleError = (err: unknown) => {
        if (err instanceof Error) {
            console.log(`An error occured while scraping feeds: ${err.message}`);
        } else {
            console.log(`An unknown error occurred while scraping feeds: ${err}`);
        }
    }

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        throw new Error("No feeds are available in the database")
    }
    await markFeedFetched(feed.id);
    const feedData = await fetchFeed(feed.url);
    for (const item of feedData.channel.item) {
        await createPost(item.title, item.link, feed.id, item.description, new Date(item.pubDate));
    }
    console.log(`Posts from feed ${feed.name} saved successfully!`);
}

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error("Usage: <number><ms|s|m|h>");
    }

    console.log(match[2]);
    const duration = +match[1];
    const timeframe = match[2];

    if (timeframe === "ms") {
        return duration;
    }
    if (timeframe === "s") {
        return duration * 1000;
    }
    if (timeframe === "m") {
        return duration * 1000 * 60;
    }
    if (timeframe === "h") {
        return duration * 1000 * 60 * 60;
    }
    return -1;
}