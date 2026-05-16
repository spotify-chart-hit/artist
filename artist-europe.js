const fs = require("fs");
const getToken = require("./auto-token");

const sleep = ms =>
new Promise(resolve =>
setTimeout(resolve, ms)
);

const countries = [

"AT",
"BY",
"BE",
"BG",
"CY",
"CZ",
"DK",
"EE",
"FI",
"FR",
"DE",
"GR",
"HU",
"IS",
"IE",
"IT",
"LV",
"LT",
"LU",
"NL",
"NO",
"PL",
"PT",
"RO",
"SK",
"ES",
"SE",
"CH",
"UA",
"GB"

];

async function getLatestDates(
token
) {

let daily;
let weekly;

while (true) {

daily =
await fetch(

"https://charts-spotify-com-service.spotify.com/auth/v0/charts/artist-global-daily/latest",

{
headers: {
Authorization: token
}
}

);

weekly =
await fetch(

"https://charts-spotify-com-service.spotify.com/auth/v0/charts/artist-global-weekly/latest",

{
headers: {
Authorization: token
}
}

);

if (

daily.status === 429
||
weekly.status === 429

) {

console.log(
"429 latestDate 😭"
);

await sleep(
8000
);

continue;

}

break;

}

const dailyJson =
await daily.json();

const weeklyJson =
await weekly.json();

return {

daily:

dailyJson
?.displayChart
?.chartMetadata
?.dimensions
?.latestDate

||

dailyJson
?.displayChart
?.date,

weekly:

weeklyJson
?.displayChart
?.chartMetadata
?.dimensions
?.latestDate

||

weeklyJson
?.displayChart
?.date

};

}

async function scrape(
token
) {

console.log(
"SCRAPING ARTIST EUROPE 😭🔥"
);

let results = [];

for (

const country
of countries

) {

for (

const type
of ["weekly","daily"]

) {

try {

const url =

`https://charts-spotify-com-service.spotify.com/auth/v0/charts/artist-${country.toLowerCase()}-${type}/latest`;

console.log(
`CHECKING ${country} ${type}`
);

let response =
await fetch(

url,

{
headers: {
Authorization: token,
Accept:
"application/json"
}
}

);

while (

response.status ===
429

) {

console.log(
`429 😭 ${country} ${type}`
);

await sleep(
8000
);

response =
await fetch(

url,

{
headers: {
Authorization: token,
Accept:
"application/json"
}
}

);

}

if (

response.status !==
200

) {

continue;

}

const data =
await response.json();

const artists =
data.entries
||
data.chartEntryViewResponses
||
[];

for (

const artist
of artists

) {

const artistName =

artist.artistMetadata
?.artistName
?.toLowerCase();

const hasJimin =

artistName
=== "jimin";

if (

hasJimin

) {

const currentRank =

artist.chartEntryData
?.currentRank;

const previousRank =

artist.chartEntryData
?.previousRank;

const rankChange =

previousRank
? Math.abs(
currentRank -
previousRank
)
: 0;

let direction = "=";
let entryStatus = null;

// NEW ENTRY
if (

previousRank === null
||
previousRank === undefined

) {

entryStatus =
"NEW_ENTRY";

}

// RE-ENTRY
else if (

rankChange >= 100

) {

entryStatus =
"RE_ENTRY";

}

// NORMAL MOVEMENT
else {

if (

currentRank <
previousRank

) {

direction =
"up";

}

else if (

currentRank >
previousRank

) {

direction =
"down";

}

}

results.push({

country,
type,

rank:
currentRank,

previousRank:
previousRank,

peakRank:

artist.chartEntryData
?.peakRank,

appearances:

artist.chartEntryData
?.appearancesOnChart,

artist:

artist.artistMetadata
?.artistName,

image:

artist.artistMetadata
?.displayImageUri,

rankChange,
direction,
entryStatus

});

console.log(

`FOUND 😭🔥 ${country} ${artist.artistMetadata?.artistName}`

);

}

}

await sleep(
800
);

}

catch (err) {

console.log(
err.message
);

}

}

}

fs.writeFileSync(

"artist-europe.json",

JSON.stringify(
results,
null,
2
)

);

console.log(
"UPDATED artist-europe.json 😍"
);

}

async function start() {

const token =
await getToken();

let savedDates =
null;

if (

fs.existsSync(
"chart-artist-europe.json"
)

) {

savedDates =
JSON.parse(

fs.readFileSync(
"chart-artist-europe.json"
)

);

}

const latest =
await getLatestDates(
token
);

const firstRun =

!savedDates
||

!fs.existsSync(
"artist-europe.json"
);

if (

firstRun

) {

console.log(
"FIRST RUN 😍"
);

await scrape(
token
);

fs.writeFileSync(

"chart-artist-europe.json",

JSON.stringify(
latest,
null,
2
)

);

return;

}

const changed =

latest.daily !==
savedDates.daily
||

latest.weekly !==
savedDates.weekly;

if (

changed

) {

console.log(
"NEW CHART 😍"
);

await scrape(
token
);

fs.writeFileSync(

"chart-artist-europe.json",

JSON.stringify(
latest,
null,
2
)

);

}

else {

console.log(
"SAME CHART 😴"
);

}

}

start();
