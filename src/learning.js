// Reading prompts are editorial guides, not quotations or diagnoses of a gift.
export const passageUrl = reference => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`;
const readings = {
  wisdom: ['1 Corinthians 12:4–11', 'Colossians 1:28', 'How can wisdom help someone understand and follow Christ?'],
  knowledge: ['1 Corinthians 12:4–11', '1 Corinthians 13:1–3', 'How does love shape the way knowledge is shared?'],
  faith: ['1 Corinthians 12:4–11', '1 Corinthians 13:1–3', 'How can trust in God serve others without making promises God has not made?'],
  healings: ['1 Corinthians 12:4–11', 'James 5:13–16', 'How can you pray for and care for someone who is ill, leaving the outcome to God?'],
  miracles: ['1 Corinthians 12:4–11', 'Acts 4:23–31', 'What do the believers ask God to do, and whose name receives the honour?'],
  prophecy: ['Romans 12:3–8', '1 Corinthians 14:1–5, 29–33', 'How do encouragement and the careful weighing of messages belong together?'],
  discerning: ['1 Corinthians 12:4–11', '1 John 4:1–6', 'What does John ask believers to test rather than accept without examination?'],
  tongues: ['1 Corinthians 12:27–31', '1 Corinthians 14:13–19, 26–28', 'How does Paul connect tongues, understanding and order in the gathered church?'],
  interpretation: ['1 Corinthians 12:4–11', '1 Corinthians 14:5, 13–19, 26–28', 'Why does interpretation matter for the people listening?'],
  helps: ['1 Corinthians 12:27–31', 'Romans 12:3–8', 'Which practical need could you help meet as part of Christ’s body?'],
  teaching: ['Romans 12:3–8', 'Colossians 1:28', 'How can careful teaching help someone grow in Christ?'],
  exhortation: ['Romans 12:3–8', 'Acts 15:30–35', 'Who needs encouragement to keep following Christ?'],
  giving: ['Romans 12:3–8', '2 Corinthians 9:6–12', 'How can you give freely and thoughtfully to meet a real need?'],
  leadership: ['Romans 12:3–8', 'Mark 10:42–45', 'How does Jesus’ teaching about service shape the way you lead?'],
  administration: ['1 Corinthians 12:27–31', 'Acts 6:1–7', 'How can organising shared responsibilities help overlooked people receive care? Acts 6 is an illustration, not a definition of this gift.'],
  mercy: ['Romans 12:3–8', 'Luke 10:25–37', 'What would compassionate action look like for a neighbour in need?'],
  apostolic: ['1 Corinthians 12:27–31', 'Ephesians 4:11–16', 'How can starting or strengthening a community help others grow in Christ? This reflection does not establish apostolic office.'],
};
export function readingFor(category) {
  const [foundation, further, question] = readings[category.id] ?? [category.scripture, '1 Peter 4:10–11', 'How could you use this area of service for another person’s good?'];
  return { foundation, further, question };
}

// Individually source-checked selections under the owner’s Scripture-focused criteria.
// See docs/sermon-curation.md for the required record and review criteria.
export const sermons = [
  {
    videoId: 'kHaf8Xm0Hcc',
    title: 'Sunday Service — The Ministry of Helps',
    sourceUrl: 'https://daghewardmills.org/',
    giftIds: ['helps'],
    teacher: 'Dag Heward-Mills',
    channel: 'Dag Heward-Mills',
    reviewNote: 'Ghana · Lighthouse / UD-OLGC charismatic perspective. The publisher describes this as an Accra service from 2004. Consider the ministry of helps alongside 1 Corinthians 12:28 and Romans 12:7.',
    checkedOn: '2026-10-24',
    approved: true
  },
  {
    videoId: 'oGkAvCKb3wY',
    title: 'Spiritual Perception',
    sourceUrl: 'https://media.koinoniaglobal.org/videos/spiritual-perception-koinonia-with-apostle-joshua-selman/',
    giftIds: ['discerning'],
    teacher: 'Joshua Selman',
    channel: 'Koinonia Global',
    reviewNote: 'Nigeria · Koinonia charismatic perspective. A broader teaching on spiritual perception, not a definition of the gift of discerning spirits. Compare with 1 Corinthians 12:10 and 1 John 4:1–6; impressions should be tested.',
    checkedOn: '2026-10-24',
    approved: true
  },
  {
    "videoId": "XCfeIswRphg",
    "title": "1 Corinthians 12:1–11 — The Holy Spirit & the Gifts He Gives",
    "sourceUrl": "https://enduringword.com/sermons/1-corinthians/1-corinthians-121-11-holy-spirit-gifts-gives/",
    "giftIds": [
      "wisdom",
      "knowledge",
      "faith",
      "healings",
      "miracles",
      "prophecy",
      "discerning",
      "tongues",
      "interpretation"
    ],
    "reviewNote": "Audio teaching on YouTube. Covers the gifts named in this passage, from a continuationist perspective.",
    "teacher": "David Guzik",
    "channel": "Enduring Word",
    "checkedOn": "2026-10-24",
    "approved": true
  },
  {
    "videoId": "dEJYv5w5Rl4",
    "title": "1 Corinthians 12:12–31 — Diversity and Unity in the Gifts of the Spirit",
    "sourceUrl": "https://enduringword.com/sermons/1-corinthians/1-corinthians-1212-31-diversity-and-unity-in-the-gifts-of-the-spirit/",
    "giftIds": [
      "helps",
      "administration",
      "apostolic",
      "teaching"
    ],
    "reviewNote": "Audio teaching on YouTube. Explores gifts and ministries within the body of Christ; a chapter overview rather than a separate sermon on each gift.",
    "teacher": "David Guzik",
    "channel": "Enduring Word",
    "checkedOn": "2026-10-24",
    "approved": true
  },
  {
    "videoId": "o07rX5OpmrU",
    "title": "Living Sacrifices — Romans 12:1–8",
    "sourceUrl": "https://enduringword.com/sermons/topical-videos/living-sacrifices-romans-121-8/",
    "giftIds": [
      "exhortation",
      "giving",
      "leadership",
      "mercy",
      "helps",
      "teaching"
    ],
    "reviewNote": "A broader message on offering ourselves to God and serving within the body, rather than a separate sermon on each gift.",
    "teacher": "David Guzik",
    "channel": "Enduring Word",
    "checkedOn": "2026-10-24",
    "approved": true
  }
];
export function sermonsFor(categoryId, catalog = sermons) {
  return catalog.filter(video => video.giftIds.includes(categoryId) && video.approved === true &&
    /^[\w-]{11}$/.test(video.videoId) && video.title && video.teacher && video.channel &&
    /^https:\/\//.test(video.sourceUrl ?? '') && video.checkedOn && video.reviewNote);
}
