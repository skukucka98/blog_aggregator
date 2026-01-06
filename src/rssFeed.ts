import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const response = await fetch(feedURL, {
        headers: {
            accept: "application/rss+xml",
            "User-Agent": "gator",
        }
    });
    if (!response.ok) {
        throw new Error(`Could not fetch data from ${feedURL}`)
    }
    const responseText = await response.text();
    const parser = new XMLParser();
    const responseData = parser.parse(responseText);
    const channel = responseData.rss.channel;

    if (!channel) {
        throw new Error("Channel data does not exist");
    }
    if (!channel.title) {
        throw new Error("Channel title does not exist");
    }
    if (!channel.link) {
        throw new Error("Channel link does not exist");
    }
    if (!channel.description) {
        throw new Error("Channel description does not exist");
    }
    if (!channel.item) {
        throw new Error("Channel does not have items");
    }

    const items: any[] = Array.isArray(channel.item) ? channel.item : [channel.item];

    const rssItems: RSSItem[] = []

    for (const item of items) {
        if (!item.title || !item.link || !item.description || !item.pubDate) {
            continue;
        }
        rssItems.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        })
    }
    
    const feed: RSSFeed = {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems
        }
    };

    return feed;
}