import * as fetch from 'node-fetch';
import { Url, URL, URLSearchParams } from 'url';

export function getVideos(lastRun: Date){
  let url: Url = new URL('https://api.nbc.com/v3.14/videos');

  const PAGE_SIZE = 5

  let params: URLSearchParams = new URLSearchParams({
    "fields[videos]": ["uuid", "description", "available", "expiration", "airdate", "permalink", "updated", "seasonNumber", "episodeNumber", "title"],
   
    "fields[shows]": ["name", "shortTitle"],
    "fields[images]": ["path", "altText"],
    "include": ["image", "show"],
    
    "filter[published]": "1",
    "filter[salesItem]": "0",
    "filter[type][value]": "Full Episode",
    "filter[type][operator]": "=",
    "filter[show][value]": "",
    "filter[show][operator]": "<>",
    "filter[expiration][value]": new Date().toISOString(),
    "filter[expiration][operator]": ">=",
    "filter[available][value]": lastRun.toISOString(),
    "filter[available][operator]": ">=",
    "page[offset]": "0",
    "page[size]": PAGE_SIZE.toString()
  });
  // we need to add thes in this way as the keys are there twice to limit the search on both ends
  params.append("filter[available][value]", new Date().toISOString())
  params.append("filter[available][operator]", "<=")

  url.search = params.toString();

  return fetch(url).then(res => res.json()).then(async res => {
    let videos: any[] = res.data;
    let included = res.included;

    let next = res.links.next;

    // fetch all pages
    while (next) {
      await fetch(next).then(res => res.json()).then(res => {
        videos = videos.concat(res.data);
        included = included.concat(res.included);
        next = res.links.next;
      });
    }

    return videos.map(vid => {
      const attributes = vid.attributes;

      attributes.show = included.filter(data => data.id === vid.relationships.show.data.id)[0].attributes;
      attributes.image = included.filter(data => data.id === vid.relationships.image.data.id)[0].attributes;

      return attributes
    });
  });
}
