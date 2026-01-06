import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, users, feeds } from "../schema";
import { firstOrUndefined } from "./utils";
import { Feed, User } from "src/commands/feeds";

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({
        userId: userId,
        feedId: feedId
    }).returning();

    const selection = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userName: users.name,
        feedName: feeds.name,
    }).from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.id, newFeedFollow.id));

    return firstOrUndefined(selection);
}

export async function getFeedFollowsForUser(user: User) {
    const result = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        userName: users.name,
        feedName: feeds.name,
    }).from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.userId, user.id));

    return result;
}

export async function deleteFeedFollowsForUserAndFeed(user: User, feed: Feed) {
    await db.delete(feedFollows).where(and(eq(feedFollows.userId, user.id), eq(feedFollows.feedId, feed.id)));
}