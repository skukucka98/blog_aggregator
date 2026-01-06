import { getPostsForUser } from "src/lib/db/queries/posts";
import { User } from "./feeds";

export async function handlerBrowse(_: string, user: User, ...args: string[]): Promise<void> {
    let limit = 2;
    if (args.length > 0) {
        limit = Number(args[0]);
    } 
    const posts = await getPostsForUser(user, limit);
    console.log(`Current posts for ${user.name}`);
    for(const post of posts) {
        console.log(` - id: ${post.posts.id}`);
        console.log(` - createdAt: ${post.posts.createdAt}`);
        console.log(` - updatedAt: ${post.posts.updatedAt}`);
        console.log(` - title: ${post.posts.title}`);
        console.log(` - url: ${post.posts.url}`);
        console.log(` - description: ${post.posts.description}`);
        console.log(` - publishedAt: ${post.posts.publishedAt}`);
        console.log(` - feedId: ${post.posts.feedId}`);
        console.log();
    }
}