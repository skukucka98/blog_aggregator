import { eq, desc } from "drizzle-orm";
import { User } from "src/commands/feeds";
import { db } from "..";
import { feedFollows, posts, users } from "../schema";

export async function createPost(title: string, url: string, feedId: string, description?: string, published_at?: Date) {
    const [result] = await db.insert(posts).values({ 
        title: title,
        url: url,
        description: description,
        publishedAt: published_at,
        feedId: feedId
    }).returning();

    return result;
}

export async function getPostsForUser(user: User, limit: number) {
    const result = await db.select(
        // {
        //     id: posts.id,
        //     createdAt: posts.createdAt,
        //     updatedAt: posts.updatedAt,
        //     title: posts.title,
        //     url: posts.url,
        //     description: posts.description,
        //     publishedAt: posts.publishedAt,
        //     feedId: posts.feedId
        // }
    ).from(posts)
        .leftJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
        .leftJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, user.id))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

    return result;
}