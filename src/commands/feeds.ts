import { getUserById } from "src/lib/db/queries/users";
import { createFeed, getFeedByUrl, getFeeds } from "src/lib/db/queries/feeds";
import { users, feeds } from "../lib/db/schema";
import { createFeedFollow, deleteFeedFollowsForUserAndFeed, getFeedFollowsForUser } from "src/lib/db/queries/feedFollow";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error(`Usage: ${cmdName} <name> <url>`);
    }

    const feedName = args[0];
    const feedUrl = args[1];
    
    const feed = await createFeed(feedName, feedUrl, user.id);
    await createFeedFollow(user.id, feed.id);
    printFeed(feed, user);
}

export async function handlerListFeeds(_: string) {
  const feeds = await getFeeds();

  if (feeds.length === 0) {
    console.log(`No feeds found.`);
    return;
  }

  console.log(`Found %d feeds:\n`, feeds.length);
  for (let feed of feeds) {
    const user = await getUserById(feed.userId);
    if (!user) {
      throw new Error(`Failed to find user for feed ${feed.id}`);
    }

    printFeed(feed, user);
    console.log(`=====================================`);
  }
}

function printFeed(feed: Feed, user: User) {
    console.log("Feed:");
    console.log(` - id: ${feed.id}`);
    console.log(` - name: ${feed.name}`);
    console.log(` - url: ${feed.url}`);
    console.log(` - updatedAt: ${feed.updatedAt}`);
    console.log(` - createdAt: ${feed.createdAt}`);
    console.log(` User:`);
    console.log(`  - userId: ${user.id}`);
    console.log(`  - name: ${user.name}`);
    console.log(`  - createdAt: ${user.createdAt}`);
    console.log(`  - updatedAt: ${user.updatedAt}`);
}

export async function handlerFollowFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <url>`);
    }

    const url = args[0];
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Failed to find feed by url ${url}`);
    }

    const feedFollow = await createFeedFollow(user.id, feed.id);
    if (!feedFollow) {
        throw new Error(`${user.name} is unable to follow ${feed.name}`);
    }
    console.log(`${feedFollow.userName} is now following ${feedFollow.feedName}`);
}

export async function handlerListFollowingFeeds(_: string, user: User) {
    const feedFollows = await getFeedFollowsForUser(user);
    if (!feedFollows) {
        throw new Error(`Could not retrieve feeds for ${user.name}`);
    }
    console.log(`${user.name} is following these feeds:`)
    for (const feedFollow of feedFollows) {
        console.log(` - ${feedFollow.feedName}`);
    }
}

export async function handlerUnfollowFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <url>`);
    }

    const url = args[0];
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Failed to find feed by url ${url}`);
    }

    await deleteFeedFollowsForUserAndFeed(user, feed);
    console.log(`${user.name} is not longer following ${feed.url}`);
}