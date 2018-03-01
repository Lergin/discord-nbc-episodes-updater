import * as fetch from 'node-fetch';

export function fetchInformation(series){
  return fetch(`https://www.nbc.com/${series}`)
    .then(res => res.text())
    .then(res => res.match(/(?<=PRELOAD\=).*(?=\<\/script)/)[0])
    .then(res => JSON.parse(res));
}

export async function getAvailableEpisodes(series){
  const info = fetchInformation(series);
  
  return Object.values(info.entities)
    .filter(a => a.type === "Full Episode");
}
