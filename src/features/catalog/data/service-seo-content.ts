export type ServiceSeoLink = {
  href: string;
  label: string;
};

export type ServiceSeoContent = {
  gameSlug:
    | "league-of-legends"
    | "valorant"
    | "marvel-rivals"
    | "overwatch-2"
    | "dota-2"
    | "rainbow-six-siege";
  serviceSlug: string;
  eyebrow: string;
  title: string;
  introduction: readonly string[];
  configuration: string;
  steps: readonly [
    { title: string; text: string },
    { title: string; text: string },
    { title: string; text: string },
  ];
  faqs: readonly {
    question: string;
    answer: string;
  }[];
  links: readonly [ServiceSeoLink, ServiceSeoLink, ServiceSeoLink];
};

const leagueOverview: ServiceSeoLink = {
  href: "/games/league-of-legends",
  label: "League of Legends services",
};

const valorantOverview: ServiceSeoLink = {
  href: "/games/valorant",
  label: "Valorant services",
};

const marvelOverview: ServiceSeoLink = {
  href: "/games/marvel-rivals",
  label: "Marvel Rivals services",
};

const overwatchOverview: ServiceSeoLink = {
  href: "/games/overwatch-2",
  label: "Overwatch 2 services",
};

const dota2Overview: ServiceSeoLink = {
  href: "/games/dota-2",
  label: "Dota 2 services",
};

const rainbowSixSiegeOverview: ServiceSeoLink = {
  href: "/games/rainbow-six-siege",
  label: "Rainbow Six Siege services",
};

const content = [
  {
    gameSlug: "league-of-legends",
    serviceSlug: "rank-boost",
    eyebrow: "League of Legends rank progression",
    title: "How League of Legends Rank Boost works",
    introduction: [
      "Rank Boost is built for players who want to move from a current solo-queue rank to a higher division without choosing a fixed package. The order follows the exact rank path selected in the configurator, so the scope stays clear before checkout.",
      "Your current LP and typical LP gain add useful account context to the calculation. You can also choose Solo/Duo or Flex queue and decide whether the service is completed through Account Boost or by playing alongside a booster.",
    ],
    configuration:
      "Configure current and desired rank, current LP, LP gain, server, queue and boost method on PC. Optional controls include Play Offline, champion preferences, streaming, Express Delivery, Solo Queue Only and Rank Insurance. Each selected option remains visible in the order summary.",
    steps: [
      { title: "Set your rank path", text: "Choose the current division and a valid higher desired rank, then add your current LP and usual LP gain." },
      { title: "Choose how to play", text: "Select Solo/Duo or Flex, your server, and either Account Boost or Play with Booster." },
      { title: "Review the order", text: "Check optional extras and the calculated total before continuing through the normal checkout flow." },
    ],
    faqs: [
      { question: "Why does LP information matter for a rank order?", answer: "Current LP and LP gain describe where the account sits within its division and how quickly it normally progresses. The configurator includes both values when it calculates the selected rank path." },
      { question: "Can I use Flex queue for League rank progression?", answer: "Yes. The page supports both Solo/Duo and Flex. Choose the queue that applies to the rank you want to progress before reviewing the quote." },
      { question: "Do I have to share account details while configuring?", answer: "No. Account information is not entered in the public configurator. If Account Boost is selected, the required details are handled after checkout through the protected order workflow." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/wins", label: "League Ranked Wins Boost" },
      { href: "/games/league-of-legends/placement-matches", label: "League Placements Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "wins",
    eyebrow: "League of Legends ranked wins",
    title: "How League of Legends Ranked Wins Boost works",
    introduction: [
      "Ranked Wins Boost is a quantity-based option for players who need completed ranked wins without setting a desired division. Instead of pricing an entire rank path, the configurator starts with your current rank and the exact number of wins requested.",
      "LP gain provides additional context for the selected account, while queue, server and fulfillment method define where and how the matches are played. The page supports packages of one to five ranked wins.",
    ],
    configuration:
      "Choose current rank, win quantity, LP gain, Solo/Duo or Flex queue, server and either Account Boost or Play with Booster on PC. Available extras include Play Offline, champion preferences, streaming, Express Delivery, Solo Queue Only and Demotion Shield.",
    steps: [
      { title: "Describe the account", text: "Select the current rank and LP gain so the order reflects the account receiving the wins." },
      { title: "Build the win package", text: "Choose one to five wins, the correct queue and server, and your preferred boost method." },
      { title: "Confirm what is included", text: "Review extras, the server-calculated amount and the complete summary before checkout." },
    ],
    faqs: [
      { question: "Is Ranked Wins Boost the same as choosing a target rank?", answer: "No. This service is based on a chosen number of wins. If your goal is a specific higher division, the Rank Boost configurator is the more direct option." },
      { question: "How many League ranked wins can I order here?", answer: "The current configurator accepts between one and five wins. The quantity can be adjusted before checkout, and the summary updates with the selected package." },
      { question: "What does Demotion Shield add to this service?", answer: "Demotion Shield is an optional modifier available specifically in the Ranked Wins configurator. It is never preselected, and its effect is shown with the other chosen extras." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/rank-boost", label: "League Rank Boost" },
      { href: "/games/league-of-legends/clash-boost", label: "League Clash Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "placement-matches",
    eyebrow: "League of Legends placements",
    title: "How League of Legends Placements Boost works",
    introduction: [
      "Placements Boost is designed around the matches used to establish a competitive rank. You begin with the account’s previous rank, or choose Unranked when there is no prior rank to provide, and then select the number of placement matches required.",
      "The service does not ask for a target division because placement results depend on the account’s competitive context. Instead, the configuration focuses on match quantity, queue, server and the way you want the order fulfilled.",
    ],
    configuration:
      "Select a previous rank, one to five placement matches, Solo/Duo or Flex queue, server and either Account Boost or Play with Booster. The service is available for PC, with optional Play Offline, champion preferences, streaming, Express Delivery and Solo Queue Only controls.",
    steps: [
      { title: "Choose the starting context", text: "Enter the previous rank or use Unranked when the account has no previous competitive placement." },
      { title: "Set the placement package", text: "Pick one to five matches, then select the queue, server and preferred boost method." },
      { title: "Check the final setup", text: "Add only the extras you want and verify the order summary before moving to checkout." },
    ],
    faqs: [
      { question: "What should I choose for a new or unranked League account?", answer: "Use the Unranked option in the previous-rank selector. It is provided specifically for accounts without a prior competitive rank." },
      { question: "Can I order all placement matches at once?", answer: "You can select any supported quantity from one to five matches. Choose the number currently needed rather than assuming a fixed package." },
      { question: "Does this page promise a specific resulting rank?", answer: "No. The order covers the selected placement matches and configuration. It does not present a guaranteed resulting division in the configurator." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/rank-boost", label: "League Rank Boost" },
      { href: "/games/league-of-legends/unrated-matches", label: "League Unrated Matches Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "unrated-matches",
    eyebrow: "League of Legends unrated matches",
    title: "How League of Legends Unrated Matches Boost works",
    introduction: [
      "Unrated Matches Boost covers a selected number of non-ranked League of Legends matches. Because competitive rank is not part of this service, the configurator keeps the first decision focused on quantity and then lets you define the server, queue and fulfillment method.",
      "This is distinct from Ranked Wins, Placements and Rank Boost: no desired rank, LP value or ranked starting point is requested. You choose only the settings that apply to the unrated match package.",
    ],
    configuration:
      "Choose between one and ten unrated matches, Solo/Duo or Flex queue, your League server and either Account Boost or Play with Booster on PC. Optional extras include Play Offline, champion preferences, streaming, Express Delivery and Solo Queue Only.",
    steps: [
      { title: "Select the match count", text: "Set the package from one to ten unrated matches using the quantity control." },
      { title: "Define the play setup", text: "Choose the server, queue and whether the booster plays on the account or alongside you." },
      { title: "Review before ordering", text: "Confirm selected extras and the calculated total in the summary before checkout." },
    ],
    faqs: [
      { question: "Does Unrated Matches Boost affect a target competitive rank?", answer: "The configurator does not use a target rank. This page is specifically for unrated match quantity, while competitive progression has separate Rank Boost and Placements services." },
      { question: "What is the supported unrated match range?", answer: "You can configure from one to ten matches. The quantity control and order summary show the exact number included in the request." },
      { question: "Can I play during an unrated Duo order?", answer: "Yes. Choose Play with Booster when you want to participate alongside the booster. Account Boost is the alternative method shown on the page." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/placement-matches", label: "League Placements Boost" },
      { href: "/games/league-of-legends/wins", label: "League Ranked Wins Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "arena-boost",
    eyebrow: "League of Legends Arena",
    title: "How League of Legends Arena Boost works",
    introduction: [
      "Arena Boost is configured by games rather than ranked divisions. It is intended for customers who want a defined Arena match package and the ability to state which role they prefer within the service setup.",
      "The quantity range is broader than the standard ranked-win pages, and role choice is price-neutral. You can still choose the server and decide between Account Boost and playing with a booster before reviewing the order.",
    ],
    configuration:
      "Select between three and sixty Arena games, then choose Top, Jungler, Mid, AD Carry or Support as the preferred role. The page also supports League server selection, PC, Account Boost or Play with Booster, plus Play Offline, champion preferences, streaming, Express Delivery and Solo Queue Only.",
    steps: [
      { title: "Build the Arena package", text: "Choose the exact number of Arena games within the supported three-to-sixty range." },
      { title: "Add play preferences", text: "Select a role, server and boost method, then consider any relevant optional modifiers." },
      { title: "Verify the package", text: "Read the order summary and confirm the live calculated total before continuing." },
    ],
    faqs: [
      { question: "Which roles can I request for Arena Boost?", answer: "The configurator offers Top, Jungler, Mid, AD Carry and Support. The selected role records your preference and is shown as price-neutral on the page." },
      { question: "What Arena game quantities are available?", answer: "Arena packages can be configured from three to sixty games. Enter a whole number within that range to receive a valid quote." },
      { question: "Is a ranked starting division needed for Arena?", answer: "No. This service is based on Arena games and role preference, so it does not ask for current or desired ranked divisions." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/mastery-boost", label: "League Mastery Boost" },
      { href: "/games/league-of-legends/clash-boost", label: "League Clash Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "mastery-boost",
    eyebrow: "League of Legends champion mastery",
    title: "How League of Legends Mastery Boost works",
    introduction: [
      "Mastery Boost lets you choose the kind of champion-mastery progress you need instead of forcing every order into one format. The configurator supports Mastery Points Farm, Marks of Mastery and a level-based Tier Boost.",
      "Each mode exposes only the quantity fields relevant to that goal. This keeps the order precise whether you need a points total, a number of marks or progression from one mastery level to a higher level.",
    ],
    configuration:
      "For points, choose 10,000 to 1,000,000 in 10,000-point increments. For marks, select one to twenty-five. Tier Boost accepts a current level from 1 to 9 and a valid higher target up to level 10. Server and PC platform remain part of every configuration, alongside Play Offline, streaming, Express Delivery and Solo Queue Only extras.",
    steps: [
      { title: "Choose a mastery mode", text: "Select Points Farm, Marks of Mastery or Tier Boost according to the progress you need." },
      { title: "Enter the exact goal", text: "Set the supported points, marks or current-to-target level values for that mode." },
      { title: "Confirm server and extras", text: "Choose the correct server, review optional modifiers and check the summary before checkout." },
    ],
    faqs: [
      { question: "Can I order mastery points instead of mastery levels?", answer: "Yes. Mastery Points Farm is its own mode, with supported amounts from 10,000 to 1,000,000 in fixed 10,000-point increments." },
      { question: "How does the Mastery Tier Boost selector work?", answer: "Choose a current level and a higher target level. Current levels run from 1 to 9, targets can reach level 10, and level 1 begins with a minimum target of level 3." },
      { question: "Does Mastery Boost include a Duo method selector?", answer: "No. The current Mastery configurator focuses on the mastery mode, quantity or level goal, server, PC platform and supported extras. It does not show a boost-method control." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/arena-boost", label: "League Arena Boost" },
      { href: "/games/league-of-legends/rank-boost", label: "League Rank Boost" },
    ],
  },
  {
    gameSlug: "league-of-legends",
    serviceSlug: "clash-boost",
    eyebrow: "League of Legends Clash",
    title: "How League of Legends Clash Boost works",
    introduction: [
      "Clash Boost is organized around the structure of a Clash request rather than standard ranked progression. You select the applicable Clash tier, the number of games and how many boosters are included in the configuration.",
      "Those choices are combined with your server and fulfillment method. The result is a clearly defined package that can be reviewed before checkout without adding a current or desired solo-queue rank.",
    ],
    configuration:
      "Choose Clash Tier 1, 2, 3 or 4, between one and ten games, and between one and five boosters. Select Account Boost or Play with Booster, your League server and PC platform. Optional settings include Play Offline, champion preferences, streaming, Express Delivery and Solo Queue Only.",
    steps: [
      { title: "Set the Clash scope", text: "Select the tier and enter the exact number of Clash games included in the request." },
      { title: "Choose the team setup", text: "Set one to five boosters, confirm the server and select the preferred boost method." },
      { title: "Inspect the summary", text: "Review every choice, optional modifier and the calculated order total before checkout." },
    ],
    faqs: [
      { question: "How many boosters can be included in a Clash order?", answer: "The current configurator supports between one and five boosters. The selected count appears with the Clash tier and game quantity in the order summary." },
      { question: "Which Clash tiers are supported on this page?", answer: "You can select Tier 1, Tier 2, Tier 3 or Tier 4. Choose the tier that applies to the Clash package you are configuring." },
      { question: "Can I provide champion preferences for Clash?", answer: "Yes. Champion Preferences is an optional, price-neutral control available in the Clash configurator, and it is not selected automatically." },
    ],
    links: [
      leagueOverview,
      { href: "/games/league-of-legends/arena-boost", label: "League Arena Boost" },
      { href: "/games/league-of-legends/wins", label: "League Ranked Wins Boost" },
    ],
  },
  {
    gameSlug: "valorant",
    serviceSlug: "rank-boost",
    eyebrow: "Valorant competitive rank progression",
    title: "How Valorant Rank Boost works",
    introduction: [
      "Valorant Rank Boost is configured as a progression from the account’s current competitive rank to a valid higher target. The available path runs through Immortal; Radiant is not offered in the current configurator.",
      "RR gain and the account’s current RR range give the quote the competitive context it needs. You also choose the server and whether the order uses Solo account fulfillment or Duo play alongside the booster.",
    ],
    configuration:
      "Select current and target rank, expected RR gain, current RR amount, server and Solo or Duo boost type. Valorant orders on this page are PC only. Optional controls include Play Offline, agent preferences, streaming, Express Delivery, one extra win and Rank Insurance.",
    steps: [
      { title: "Map the rank progression", text: "Choose the current rank and a higher target rank from Iron through Immortal." },
      { title: "Add RR and server context", text: "Select the applicable RR gain, current RR range, server and Solo or Duo method." },
      { title: "Review the live configuration", text: "Check extras and the complete calculated summary before continuing to checkout." },
    ],
    faqs: [
      { question: "Can I select Radiant as a Valorant target rank?", answer: "No. The current target-rank selector ends at Immortal and explicitly does not offer Radiant." },
      { question: "Why do I choose both RR gain and RR amount?", answer: "RR gain describes the account’s usual gain per win, while RR amount records its current progress within the rank. Both are separate options in this rank configuration." },
      { question: "What is the difference between Solo and Duo here?", answer: "With Solo, the booster plays on the account; with Duo, you play alongside the booster. The selected method is displayed in the order summary before checkout." },
    ],
    links: [
      valorantOverview,
      { href: "/games/valorant/wins", label: "Valorant Competitive Wins" },
      { href: "/games/valorant/placement-matches", label: "Valorant Placements Boost" },
    ],
  },
  {
    gameSlug: "valorant",
    serviceSlug: "wins",
    eyebrow: "Valorant competitive wins",
    title: "How Valorant Competitive Wins works",
    introduction: [
      "Valorant Competitive Wins is for players who need a defined number of ranked wins rather than progression to a chosen target rank. The starting rank still matters, because the order is calculated around the account’s current competitive level.",
      "You can request one to five wins and provide the account’s usual RR gain. Server and Solo or Duo selection complete the core setup, while the summary keeps the chosen quantity visible throughout the configuration.",
    ],
    configuration:
      "Choose current rank, one to five competitive wins, RR gain, server and Solo or Duo boost type. The platform is PC. Optional selections include Play Offline, agent preferences, streaming, Express Delivery, an additional extra win and Rank Insurance.",
    steps: [
      { title: "Select rank and quantity", text: "Set the current Valorant rank and choose the exact number of competitive wins required." },
      { title: "Complete the match context", text: "Choose RR gain, server and whether the order will use Solo or Duo." },
      { title: "Check the final package", text: "Review selected extras, the calculated price and the order summary before checkout." },
    ],
    faqs: [
      { question: "How many Valorant competitive wins can I select?", answer: "The supported package range is one to five wins. Use the quantity control to match the number currently needed." },
      { question: "Does this service require a desired rank?", answer: "No. Competitive Wins is quantity-based and does not ask for a target rank. Use Rank Boost when a specific higher rank is the goal." },
      { question: "Is the extra-win option the same as the main quantity?", answer: "No. The main selector defines the core one-to-five-win package. The separate extra-win control is an optional add-on shown with the other extras." },
    ],
    links: [
      valorantOverview,
      { href: "/games/valorant/rank-boost", label: "Valorant Rank Boost" },
      { href: "/games/valorant/placement-matches", label: "Valorant Placements Boost" },
    ],
  },
  {
    gameSlug: "valorant",
    serviceSlug: "placement-matches",
    eyebrow: "Valorant competitive placements",
    title: "How Valorant Placements Boost works",
    introduction: [
      "Valorant Placements Boost covers a chosen number of competitive placement matches. The starting selector accepts Unrated when the account has no prior competitive rank, as well as the supported ranked tiers when previous placement context exists.",
      "Unlike Rank Boost, this service does not ask for a destination rank or RR amount. The order is defined by the previous rank context, placement-match quantity, server and Solo or Duo fulfillment method.",
    ],
    configuration:
      "Select Unrated or the applicable current rank, then choose one to five placement matches, a Valorant server and Solo or Duo. The service is PC only. Available extras are Play Offline, agent preferences, streaming, Express Delivery, one extra win and Rank Insurance.",
    steps: [
      { title: "Set the placement starting point", text: "Choose Unrated for a fresh account or select the relevant previous competitive rank." },
      { title: "Choose matches and method", text: "Set one to five placements, confirm the server and select Solo or Duo." },
      { title: "Validate the request", text: "Read the complete summary, including optional extras and total, before checkout." },
    ],
    faqs: [
      { question: "When should I use Unrated for Valorant placements?", answer: "Choose Unrated when the account does not have a prior competitive rank to use as placement context." },
      { question: "Can this configurator guarantee my placement result?", answer: "No. The page defines the selected placement matches and service settings; it does not promise a particular resulting rank." },
      { question: "Is RR gain required for placement matches?", answer: "No. RR gain appears in the Rank Boost and Competitive Wins configurations, but it is not a field in the current Placements setup." },
    ],
    links: [
      valorantOverview,
      { href: "/games/valorant/rank-boost", label: "Valorant Rank Boost" },
      { href: "/games/valorant/wins", label: "Valorant Competitive Wins" },
    ],
  },
  {
    gameSlug: "marvel-rivals",
    serviceSlug: "rank-boost",
    eyebrow: "Marvel Rivals competitive progression",
    title: "How Marvel Rivals Rank Boost works",
    introduction: [
      "Marvel Rivals Rank Boost follows a clear current-to-target progression. Select the account’s present rank and division, then choose a valid higher destination through the available competitive ladder, including Eternity where applicable.",
      "The configuration also records the region, platform, preferred role and whether the service uses Solo or Duo. These choices make the order specific to the way and environment in which you play.",
    ],
    configuration:
      "Choose current and target rank, region, PC, Xbox or PlayStation, Solo or Duo, and Duelist, Vanguard, Strategist or Any role. Optional extras include Play Offline, Specific Heroes, Streaming and Express Delivery. Play Offline is unavailable when Duo is selected. Rank divisions remain visible in the progression summary.",
    steps: [
      { title: "Choose the rank path", text: "Set the current rank and division, then select a valid higher target." },
      { title: "Define the play setup", text: "Select region, platform, Solo or Duo and the preferred role for the order." },
      { title: "Review every option", text: "Confirm extras, progression and the calculated summary before proceeding to checkout." },
    ],
    faqs: [
      { question: "Which Marvel Rivals roles can I select for Rank Boost?", answer: "You can choose Duelist, Vanguard, Strategist or Any. The selection is included with the order configuration." },
      { question: "Can the target be the same as my current rank?", answer: "No. The configurator requires the target progression to be above the selected current rank and division." },
      { question: "Why is Play Offline unavailable with Duo?", answer: "Duo means you participate alongside the booster, so Play Offline is disabled for that method in the current configuration." },
    ],
    links: [
      marvelOverview,
      { href: "/games/marvel-rivals/wins", label: "Marvel Rivals Competitive Wins" },
      { href: "/games/marvel-rivals/placement-matches", label: "Marvel Rivals Placements Boost" },
    ],
  },
  {
    gameSlug: "marvel-rivals",
    serviceSlug: "placement-matches",
    eyebrow: "Marvel Rivals placements",
    title: "How Marvel Rivals Placements Boost works",
    introduction: [
      "Marvel Rivals Placements Boost is configured around the account’s previous competitive standing and the number of placement matches to complete. Unranked is available when there is no previous rank to select.",
      "Because placements establish competitive context, the page does not ask for a target rank. Instead, it combines the starting point and match quantity with region, platform, role and Solo or Duo fulfillment.",
    ],
    configuration:
      "Select Unranked or a previous rank and division, then choose one to ten placement matches. Configure region, PC, Xbox or PlayStation, Solo or Duo, and Duelist, Vanguard, Strategist or Any role. Play Offline, Specific Heroes, Streaming and Express Delivery are optional; Play Offline is disabled for Duo. The previous-rank choice and match count stay visible in the summary.",
    steps: [
      { title: "Add previous-rank context", text: "Choose Unranked or the account’s previous rank and division." },
      { title: "Build the match package", text: "Select one to ten placement matches, plus region, platform, method and role." },
      { title: "Confirm the order", text: "Review optional extras and the complete calculated summary before checkout." },
    ],
    faqs: [
      { question: "How many Marvel Rivals placement matches are supported?", answer: "The configurator accepts between one and ten placement matches. Enter the quantity that matches the account’s current needs." },
      { question: "What if the account was not ranked previously?", answer: "Select Unranked in the previous-rank control. A division is not required for that starting option." },
      { question: "Can I request a specific role during placements?", answer: "Yes. Duelist, Vanguard, Strategist and Any are available as role choices in this service." },
    ],
    links: [
      marvelOverview,
      { href: "/games/marvel-rivals/rank-boost", label: "Marvel Rivals Rank Boost" },
      { href: "/games/marvel-rivals/unrated-games", label: "Marvel Rivals Unrated Games" },
    ],
  },
  {
    gameSlug: "marvel-rivals",
    serviceSlug: "wins",
    eyebrow: "Marvel Rivals competitive wins",
    title: "How Marvel Rivals Competitive Wins works",
    introduction: [
      "Competitive Wins is a match-result package based on the account’s current Marvel Rivals rank and the exact number of wins selected. It does not require a target rank, making it suitable when the immediate goal is completed competitive wins rather than a fixed ladder destination.",
      "For Eternity accounts, the configurator also accepts the current Eternity points within its supported range. Region, platform, role and Solo or Duo complete the core order setup.",
    ],
    configuration:
      "Choose current rank and division, one to five competitive wins, region, PC, Xbox or PlayStation, Solo or Duo, and a preferred role. Eternity uses a 30-to-1,000 point field. Play Offline, Specific Heroes, Streaming and Express Delivery are optional, with Play Offline disabled for Duo.",
    steps: [
      { title: "Describe the current rank", text: "Select the account’s rank and division, or provide Eternity points when that tier applies." },
      { title: "Set the wins and play settings", text: "Choose one to five wins, region, platform, method and preferred role." },
      { title: "Inspect the final package", text: "Confirm extras and the calculated total shown in the order summary before checkout." },
    ],
    faqs: [
      { question: "What is the Competitive Wins quantity range?", answer: "You can request between one and five wins. The quantity remains visible alongside the current rank in the summary." },
      { question: "When do I need to enter Eternity points?", answer: "The points field applies when Eternity is selected as the current rank. It accepts supported values from 30 through 1,000." },
      { question: "Does choosing Any role remove the role preference?", answer: "Any is a valid role selection for customers without a Duelist, Vanguard or Strategist preference. It remains recorded as part of the configuration." },
    ],
    links: [
      marvelOverview,
      { href: "/games/marvel-rivals/rank-boost", label: "Marvel Rivals Rank Boost" },
      { href: "/games/marvel-rivals/hero-boost", label: "Marvel Rivals Hero Boost" },
    ],
  },
  {
    gameSlug: "marvel-rivals",
    serviceSlug: "hero-boost",
    eyebrow: "Marvel Rivals hero proficiency",
    title: "How Marvel Rivals Hero Boost works",
    introduction: [
      "Hero Boost is focused on proficiency for one selected Marvel Rivals hero. Instead of using competitive rank, you choose a hero and define the movement from the current proficiency level to a higher target.",
      "The hero list and level controls make the requested progression explicit before checkout. Region, platform and Solo or Duo then describe where and how the proficiency service should be completed.",
    ],
    configuration:
      "Choose one available hero, a current proficiency from 1 to 69 and a higher target up to 70. Select region, PC, Xbox or PlayStation, and Solo or Duo. This service offers Play Offline, Streaming and Express Delivery; it does not add the separate Specific Heroes extra because the hero is already selected directly.",
    steps: [
      { title: "Select the hero", text: "Choose the exact hero whose proficiency you want to progress." },
      { title: "Set the proficiency goal", text: "Enter the current level and a valid higher target, up to level 70." },
      { title: "Complete the setup", text: "Choose region, platform, method and relevant extras, then review the summary." },
    ],
    faqs: [
      { question: "What proficiency levels can I configure?", answer: "Current proficiency can be set from 1 to 69, and the target must be higher, with level 70 as the maximum." },
      { question: "Can I select more than one hero in this order?", answer: "No. The current Hero Boost configuration asks for one specific hero per order." },
      { question: "Why is there no Specific Heroes extra on Hero Boost?", answer: "Hero selection is already a required part of this service, so the separate hero-preference extra used by other Marvel Rivals services is not shown." },
    ],
    links: [
      marvelOverview,
      { href: "/games/marvel-rivals/rank-boost", label: "Marvel Rivals Rank Boost" },
      { href: "/games/marvel-rivals/unrated-games", label: "Marvel Rivals Unrated Games" },
    ],
  },
  {
    gameSlug: "marvel-rivals",
    serviceSlug: "unrated-games",
    eyebrow: "Marvel Rivals unrated play",
    title: "How Marvel Rivals Unrated Games works",
    introduction: [
      "Unrated Games is a straightforward quantity-based service for matches outside the competitive-rank configurators. You choose how many games are needed without entering a current rank, target rank or previous placement result.",
      "The remaining choices describe the play environment: region, platform and whether the order uses Solo or Duo. This keeps the package focused while still allowing supported preferences and fulfillment options.",
    ],
    configuration:
      "Select between one and ten unrated games, region, PC, Xbox or PlayStation, and Solo or Duo. Optional controls include Play Offline, Specific Heroes, Streaming and Express Delivery. Play Offline cannot be combined with Duo in the current configurator. The summary reflects the selected quantity, environment and extras before checkout.",
    steps: [
      { title: "Choose the game quantity", text: "Set the unrated package from one to ten games using the quantity control." },
      { title: "Select the play environment", text: "Choose region, platform and either Solo account fulfillment or Duo play." },
      { title: "Review optional preferences", text: "Confirm extras and the live order summary before continuing to checkout." },
    ],
    faqs: [
      { question: "Do unrated games require a current Marvel Rivals rank?", answer: "No. Current and target ranks are not part of this service; the core request is the number of unrated games." },
      { question: "Can I include hero preferences for unrated play?", answer: "Yes. Specific Heroes is an optional, price-neutral selection available in the Unrated Games configurator." },
      { question: "What platforms are available for Unrated Games?", answer: "The page supports PC, Xbox and PlayStation. Select the platform that matches the account before reviewing the order." },
    ],
    links: [
      marvelOverview,
      { href: "/games/marvel-rivals/placement-matches", label: "Marvel Rivals Placements Boost" },
      { href: "/games/marvel-rivals/wins", label: "Marvel Rivals Competitive Wins" },
    ],
  },
  {
    gameSlug: "overwatch-2",
    serviceSlug: "rank-boost",
    eyebrow: "Overwatch 2 competitive progression",
    title: "How Overwatch 2 Rank Boost works",
    introduction: [
      "Overwatch 2 Rank Boost is configured as a path from the account’s current competitive division to a valid higher target. The selector covers Bronze V through Champion I, making both ends of the requested progression visible before checkout.",
      "Role or queue, region, platform and fulfillment method provide the context needed for the order. You can choose Tank, Damage, Support or Open Queue, then decide between Account Boost and playing alongside a booster.",
    ],
    configuration:
      "Select current and target rank, role or Open Queue, North America, Europe, Asia or Middle East, and PC, Xbox, PlayStation or Nintendo Switch. Choose Account Boost or Play With Booster; Duo-style orders support one to five boosters. Optional controls include Play Offline, Specific Heroes, Streaming, Express Delivery, one Bonus Win and Rank Insurance.",
    steps: [
      { title: "Define the rank path", text: "Choose the account’s current division and the higher competitive division you want the order to reach." },
      { title: "Set the play environment", text: "Select role or Open Queue, server, platform and the appropriate boost method." },
      { title: "Review the complete order", text: "Add only the extras you want and confirm the server-calculated quote and summary before checkout." },
    ],
    faqs: [
      { question: "Which Overwatch 2 ranks can I select for progression?", answer: "The configurator covers divisions from Bronze V through Champion I. The target must represent a valid progression beyond the selected current rank." },
      { question: "Can I order Overwatch rank progression for Open Queue?", answer: "Yes. Open Queue appears beside Tank, Damage and Support in the Role / Queue selection. Its pricing effect is displayed in the configurator." },
      { question: "Which consoles are supported on this rank page?", answer: "The available platforms are PC, Xbox, PlayStation and Nintendo Switch. Select the platform used by the account before reviewing the order." },
    ],
    links: [
      overwatchOverview,
      { href: "/games/overwatch-2/wins", label: "Overwatch 2 Competitive Wins" },
      { href: "/games/overwatch-2/placement-matches", label: "Overwatch 2 Placements Boost" },
    ],
  },
  {
    gameSlug: "overwatch-2",
    serviceSlug: "wins",
    eyebrow: "Overwatch 2 competitive wins",
    title: "How Overwatch 2 Competitive Wins works",
    introduction: [
      "Competitive Wins is a quantity-based service for players who want completed wins at their current Overwatch 2 rank without setting a target division. The order begins with the account’s current competitive division and a package of one to five wins.",
      "The same play choices used for competitive progression remain available, so the request records the relevant role or queue, region, platform and fulfillment method before the price is confirmed.",
    ],
    configuration:
      "Choose a current rank from Bronze V through Champion I and select one to five Competitive Wins. Set Tank, Damage, Support or Open Queue, server, PC, Xbox, PlayStation or Nintendo Switch, plus Account Boost or Play With Booster. Available extras are Play Offline, Specific Heroes, Streaming, Express Delivery, one Bonus Win and Rank Insurance.",
    steps: [
      { title: "Describe the account", text: "Select the current competitive division and the role or queue that applies to the requested wins." },
      { title: "Build the win package", text: "Choose one to five wins, then set the server, platform and boost method." },
      { title: "Confirm the selections", text: "Review optional settings, the calculated amount and the complete summary before checkout." },
    ],
    faqs: [
      { question: "How many Overwatch competitive wins can I request?", answer: "The current page accepts packages from one to five wins. The selected quantity stays visible in the summary as you adjust other options." },
      { question: "Does this service require a desired rank?", answer: "No. Competitive Wins uses the current rank and a win quantity. Choose Rank Boost instead when the goal is a specific higher division." },
      { question: "Can I play with a booster for a wins order?", answer: "Yes. Play With Booster is available alongside Account Boost. When selected, the configurator also provides a booster-count control from one to five." },
    ],
    links: [
      overwatchOverview,
      { href: "/games/overwatch-2/rank-boost", label: "Overwatch 2 Rank Boost" },
      { href: "/games/overwatch-2/competitive-drives", label: "Overwatch 2 Competitive Drives" },
    ],
  },
  {
    gameSlug: "overwatch-2",
    serviceSlug: "competitive-drives",
    eyebrow: "Overwatch 2 Drive progress",
    title: "How Overwatch 2 Competitive Drives works",
    introduction: [
      "Competitive Drives is built around Drive score rather than a division-to-division rank path. You select the account’s current rank family, its present Drive score and the higher Drive score requested for the order.",
      "Scores move in 50-point steps: the current value can begin at zero and the desired value can reach 4,000. Role or Open Queue, region, platform and fulfillment method complete the playable configuration.",
    ],
    configuration:
      "Choose a rank family from Bronze through Champion, a current Drive score from 0 to 3,950 and a higher desired score from 50 to 4,000. Then select Tank, Damage, Support or Open Queue, server, PC, Xbox, PlayStation or Nintendo Switch, and Account Boost or Play With Booster. Optional extras include Play Offline, Specific Heroes, Streaming, Express Delivery, one Bonus Win and Rank Insurance.",
    steps: [
      { title: "Set the Drive baseline", text: "Choose the current rank family and enter the account’s present Drive score in the supported increment." },
      { title: "Choose the Drive goal", text: "Set a higher desired score, then select role or queue, server, platform and boost method." },
      { title: "Verify the request", text: "Check every optional setting and the calculated order summary before continuing to checkout." },
    ],
    faqs: [
      { question: "What Drive score range does the configurator support?", answer: "Current Drive can be set from 0 to 3,950 and desired Drive from 50 to 4,000. Both controls advance in 50-point steps." },
      { question: "Is Competitive Drives the same as Rank Boost?", answer: "No. This page defines a Drive-score goal tied to a rank family. Rank Boost instead uses a current competitive division and a higher target division." },
      { question: "Can a Drive order use Nintendo Switch?", answer: "Yes. Nintendo Switch is listed with PC, Xbox and PlayStation in the platform selector for this service." },
    ],
    links: [
      overwatchOverview,
      { href: "/games/overwatch-2/rank-boost", label: "Overwatch 2 Rank Boost" },
      { href: "/games/overwatch-2/wins", label: "Overwatch 2 Competitive Wins" },
    ],
  },
  {
    gameSlug: "overwatch-2",
    serviceSlug: "placement-matches",
    eyebrow: "Overwatch 2 placements",
    title: "How Overwatch 2 Placements Boost works",
    introduction: [
      "Placements Boost covers a selected number of Overwatch 2 placement matches. The setup starts with the account’s previous competitive rank, while an Unranked option is available when there is no prior rank to supply.",
      "Because the order is match-based, no desired division is selected. You instead choose between one and ten placement matches and record the role or queue, region, platform and method that apply.",
    ],
    configuration:
      "Select Unranked or a previous division from Bronze V through Champion I, then choose one to ten Placement Matches. Configure Tank, Damage, Support or Open Queue, server, PC, Xbox, PlayStation or Nintendo Switch, and Account Boost or Play With Booster. Play Offline, Specific Heroes, Streaming, Express Delivery, one Bonus Win and Rank Insurance are optional.",
    steps: [
      { title: "Add previous-rank context", text: "Choose the account’s prior division or use Unranked when no previous competitive rank applies." },
      { title: "Set the match package", text: "Select one to ten placements and define the role or queue, server, platform and boost method." },
      { title: "Check the final setup", text: "Review extras, quantity and the calculated summary before proceeding through checkout." },
    ],
    faqs: [
      { question: "What should I choose for a new Overwatch competitive account?", answer: "Choose Unranked in the Previous Rank selector when the account does not have a previous competitive division to provide." },
      { question: "Does Placements Boost promise a resulting division?", answer: "No. The configuration covers the selected number of placement matches and play settings; it does not state a guaranteed final rank." },
      { question: "How many placement matches can this order include?", answer: "The quantity control accepts from one to ten matches. Choose the number actually needed and confirm it in the order summary." },
    ],
    links: [
      overwatchOverview,
      { href: "/games/overwatch-2/rank-boost", label: "Overwatch 2 Rank Boost" },
      { href: "/games/overwatch-2/unrated-matches", label: "Overwatch 2 Unrated Matches" },
    ],
  },
  {
    gameSlug: "overwatch-2",
    serviceSlug: "unrated-matches",
    eyebrow: "Overwatch 2 unrated play",
    title: "How Overwatch 2 Unrated Matches works",
    introduction: [
      "Unrated Matches is a quantity-based option for Overwatch 2 matches outside the competitive-rank services. It does not ask for a current rank, previous rank, target division or Drive score.",
      "You choose the number of matches and the play environment that applies to the request. Role or Open Queue, region, platform and fulfillment method remain configurable even though competitive rank is not part of the order.",
    ],
    configuration:
      "Select from one to ten Unrated Matches, then choose Tank, Damage, Support or Open Queue. Set North America, Europe, Asia or Middle East; PC, Xbox, PlayStation or Nintendo Switch; and Account Boost or Play With Booster. Optional settings include Play Offline, Specific Heroes, Streaming, Express Delivery, one Bonus Win and Rank Insurance.",
    steps: [
      { title: "Choose the match count", text: "Set the package to the exact number of unrated matches needed, from one through ten." },
      { title: "Define how matches are played", text: "Select role or queue, server, platform and either account-based or play-alongside fulfillment." },
      { title: "Review before checkout", text: "Confirm optional preferences and the complete calculated summary before placing the order." },
    ],
    faqs: [
      { question: "Is an Overwatch rank required for unrated matches?", answer: "No. This service does not use a competitive rank. The core selection is a package of one to ten unrated matches." },
      { question: "Can I request a particular role for unrated play?", answer: "Yes. Tank, Damage and Support are available, along with Open Queue. Choose the applicable option before reviewing the quote." },
      { question: "Are console unrated orders available?", answer: "Yes. Xbox, PlayStation and Nintendo Switch are listed alongside PC in the platform selector." },
    ],
    links: [
      overwatchOverview,
      { href: "/games/overwatch-2/placement-matches", label: "Overwatch 2 Placements Boost" },
      { href: "/games/overwatch-2/wins", label: "Overwatch 2 Competitive Wins" },
    ],
  },
  {
    gameSlug: "dota-2",
    serviceSlug: "mmr-boost",
    eyebrow: "Dota 2 MMR progression",
    title: "How Dota 2 MMR Boost works",
    introduction: [
      "Dota 2 MMR Boost defines a progression from the account’s current matchmaking rating to a higher target. The current field supports 0 through 11,999 MMR and the target can reach 12,000, with rank-bracket context shown from Herald through Immortal.",
      "Server, Behavior Score and fulfillment method describe the account conditions for the quote. You can also choose no play preference, up to two specific roles or one specific hero before reviewing the order.",
    ],
    configuration:
      "Enter current and higher target MMR, choose one of eight supported server regions, select the applicable Behavior Score band and use Solo or Duo. Preferences include Any, Specific Roles or Specific Hero. Privacy Mode and Express Delivery are available; Solo Queue Only and Streaming apply only to Solo orders. Immortal-range progression and Behavior Score below 4,000 move to a custom-quote path.",
    steps: [
      { title: "Enter the MMR path", text: "Provide the account’s current rating and a valid higher target within the supported limits." },
      { title: "Describe the play setup", text: "Choose server, Behavior Score, Solo or Duo and any role or hero preference." },
      { title: "Review the quote state", text: "Check extras and either the calculated total or displayed custom-quote guidance before continuing." },
    ],
    faqs: [
      { question: "What MMR values can I enter on this page?", answer: "Current MMR accepts whole numbers from 0 to 11,999. The desired MMR must be higher and may be set up to 12,000." },
      { question: "When does Dota 2 MMR progression require a custom quote?", answer: "The page uses custom-quote handling for Immortal-range progression and for accounts with a Behavior Score below 4,000 rather than presenting a standard calculated checkout amount." },
      { question: "How many role preferences can I select?", answer: "Specific Roles allows up to two choices from Carry, Mid, Offlane, Soft Support and Hard Support. Specific Hero is a separate preference mode." },
    ],
    links: [
      dota2Overview,
      { href: "/games/dota-2/net-wins", label: "Dota 2 Net Wins" },
      { href: "/games/dota-2/calibration-matches", label: "Dota 2 Calibration Matches" },
    ],
  },
  {
    gameSlug: "dota-2",
    serviceSlug: "net-wins",
    eyebrow: "Dota 2 net ranked wins",
    title: "How Dota 2 Net Wins works",
    introduction: [
      "Dota 2 Net Wins is configured by a fixed result count rather than a desired MMR. A net win is the total number of wins minus losses, so the selected quantity describes the balance the completed order is intended to deliver.",
      "Current MMR establishes the account’s bracket for the quote. Server, Behavior Score, Solo or Duo and optional play preferences then record the conditions under which the net-win package should be fulfilled.",
    ],
    configuration:
      "Enter current MMR from 0 to 11,999 and choose one to twenty net wins. Select server, Behavior Score and Solo or Duo, plus Any, up to two Specific Roles or one Specific Hero. Privacy Mode and Express Delivery are supported; Solo Queue Only and Streaming are limited to Solo. Immortal accounts and Behavior Score below 4,000 use custom-quote handling.",
    steps: [
      { title: "Set the account context", text: "Enter current MMR and choose the server and Behavior Score band that apply." },
      { title: "Build the net-win request", text: "Select one to twenty net wins, Solo or Duo, and any role or hero preference." },
      { title: "Confirm the order definition", text: "Review extras and the quote state, including the net-wins definition, before checkout." },
    ],
    faqs: [
      { question: "How is a Dota 2 net win counted?", answer: "The page defines net wins as total wins minus total losses. The order is for the selected net result, not a promised win rate or delivery time." },
      { question: "What net-win quantities are supported?", answer: "You can configure a whole-number quantity from one to twenty. The current MMR is entered separately to determine the relevant bracket." },
      { question: "Can Streaming be added to a Duo net-wins order?", answer: "No. Streaming and Solo Queue Only are Solo-only extras in this configurator and become unavailable when Duo is selected." },
    ],
    links: [
      dota2Overview,
      { href: "/games/dota-2/mmr-boost", label: "Dota 2 MMR Boost" },
      { href: "/games/dota-2/hero-level-boost", label: "Dota Plus Hero Level" },
    ],
  },
  {
    gameSlug: "dota-2",
    serviceSlug: "calibration-matches",
    eyebrow: "Dota 2 ranked calibration",
    title: "How Dota 2 Calibration Matches works",
    introduction: [
      "Calibration Matches covers a chosen number of Dota 2 calibration games using the account’s previous-rank context. Previous ranks run from Herald through Immortal; divisions I through V are selected for non-Immortal ranks.",
      "Rank Confidence is recorded as operational information from 0 to 100, while the package itself can include one to thirty matches. Neither a final rank, match outcome nor a specific Rank Confidence change is guaranteed.",
    ],
    configuration:
      "Choose previous rank and division where applicable, enter Rank Confidence, and select one to thirty calibration matches. Add server, Behavior Score, Solo or Duo, and Any, up to two Specific Roles or one Specific Hero. Privacy Mode and Express Delivery are available; Solo Queue Only and Streaming are Solo-only. Immortal and Behavior Score below 4,000 use custom-quote handling.",
    steps: [
      { title: "Describe the previous rank", text: "Choose the rank and division that apply, then enter the account’s current Rank Confidence." },
      { title: "Configure the matches", text: "Select the match quantity, server, Behavior Score, method and any play preference." },
      { title: "Review without assuming an outcome", text: "Confirm extras and the quote state while keeping the displayed calibration limitations in view." },
    ],
    faqs: [
      { question: "Does calibration guarantee my final Dota 2 rank?", answer: "No. The order covers the selected calibration matches under the chosen setup. Final rank, individual outcomes and Rank Confidence changes are not guaranteed." },
      { question: "Why does the page ask for Rank Confidence?", answer: "Rank Confidence gives relevant account context and accepts a value from 0 to 100. The page states that it is operational information and does not guarantee a calibration result." },
      { question: "How many calibration matches can I select?", answer: "The quantity control accepts whole numbers from one to thirty, allowing the order to match the number of calibration games currently needed." },
    ],
    links: [
      dota2Overview,
      { href: "/games/dota-2/mmr-boost", label: "Dota 2 MMR Boost" },
      { href: "/games/dota-2/net-wins", label: "Dota 2 Net Wins" },
    ],
  },
  {
    gameSlug: "dota-2",
    serviceSlug: "hero-level-boost",
    eyebrow: "Dota Plus hero progression",
    title: "How Dota Plus Hero Level Boost works",
    introduction: [
      "Dota Plus Hero Level Boost focuses on one named hero and a specific level progression. You enter the hero, confirm that the account has an active Dota Plus subscription, and set the current and desired Hero Levels.",
      "The current level can be 1 through 39 and the target must be higher, up to level 40. Server and Behavior Score complete the account context without adding MMR, role or boost-method selectors.",
    ],
    configuration:
      "Enter one hero name, choose a current Dota Plus Hero Level from 1 to 39 and a higher target from 2 to 40, then confirm the active Dota Plus requirement. Select one of the supported Dota 2 servers and the applicable Behavior Score band. Optional controls are Privacy Mode, Express Delivery and Streaming; Behavior Score below 4,000 uses a custom quote.",
    steps: [
      { title: "Identify the hero", text: "Enter the single hero for this order and confirm that Dota Plus is active on the account." },
      { title: "Set the level progression", text: "Choose the current level and a valid higher target, with level 40 as the maximum." },
      { title: "Complete the account context", text: "Select server, Behavior Score and any relevant extras, then review the quote state." },
    ],
    faqs: [
      { question: "Is Dota Plus required for Hero Level Boost?", answer: "Yes. The configurator includes a required confirmation that the account has an active Dota Plus subscription before the order can proceed." },
      { question: "What Hero Level range is available?", answer: "Current level supports 1 through 39. The desired level must be higher than the current value and can reach level 40." },
      { question: "Can one order include several Dota 2 heroes?", answer: "No. The current configuration accepts one hero name and one current-to-target Hero Level path per order." },
    ],
    links: [
      dota2Overview,
      { href: "/games/dota-2/mmr-boost", label: "Dota 2 MMR Boost" },
      { href: "/games/dota-2/calibration-matches", label: "Dota 2 Calibration Matches" },
    ],
  },
  {
    gameSlug: "rainbow-six-siege",
    serviceSlug: "rank-boost",
    eyebrow: "Rainbow Six Siege ranked progression",
    title: "How Rainbow Six Siege Rank Boost works",
    introduction: [
      "Rainbow Six Siege Rank Boost defines a competitive path from the account’s current division to a higher desired division. The selector covers Copper V through Champion I, so the exact starting point and goal are visible together in the order summary.",
      "Platform, Solo or Duo, RP gain and server provide the context used by the configurator. The live quote and its starting-time estimate update from the valid selections without replacing the existing fulfillment guidance.",
    ],
    configuration:
      "Choose current and higher desired rank, PC, Xbox or PlayStation, Solo or Duo, and an RP gain band of 21+, 11–20 or 1–10. Select Europe, North America, Latin America, Asia, Oceania, Brazil or Middle East. Optional customizations are Play Offline, Specific Operators, Streaming, Express Delivery, High Kill Count and Rank Insurance.",
    steps: [
      { title: "Define the rank path", text: "Select the account’s current division and the valid higher division requested for the order." },
      { title: "Add competitive context", text: "Choose platform, Solo or Duo, RP gain and the server region that applies." },
      { title: "Review price and timing", text: "Confirm customizations, the calculated total and the displayed starting-time range before checkout." },
    ],
    faqs: [
      { question: "Which Siege divisions are available for Rank Boost?", answer: "The current selector covers every displayed division from Copper V through Champion I. The desired rank must be later than the chosen current rank." },
      { question: "Why does my RP gain matter for this order?", answer: "The configurator groups RP gain into 21+, 11–20 and 1–10 bands. Select the band that reflects the account so the quote uses the correct configuration." },
      { question: "Is the displayed starting time a guarantee?", answer: "No. The page presents an estimate derived from the valid configuration together with a disclaimer. It is guidance, not a guaranteed start or completion time." },
    ],
    links: [
      rainbowSixSiegeOverview,
      { href: "/games/rainbow-six-siege/competitive-wins", label: "Rainbow Six Siege Competitive Wins" },
      { href: "/games/rainbow-six-siege/placements-boost", label: "Rainbow Six Siege Placements Boost" },
    ],
  },
  {
    gameSlug: "rainbow-six-siege",
    serviceSlug: "competitive-wins",
    eyebrow: "Rainbow Six Siege competitive wins",
    title: "How Rainbow Six Siege Competitive Wins works",
    introduction: [
      "Competitive Wins is a quantity-based Siege service for the account’s current ranked division. Instead of selecting a target rank, you choose the current division and a package of one to five completed competitive wins.",
      "Platform, Solo or Duo and server describe how the package should be played. The existing starting-time estimate continues to respond to the valid quote and is shown with its operational disclaimer.",
    ],
    configuration:
      "Select current rank from Copper V through Champion I and choose one to five wins. Configure PC, Xbox or PlayStation, Solo or Duo, and Europe, North America, Latin America, Asia, Oceania, Brazil or Middle East. Optional customizations include Play Offline, Specific Operators, Streaming, Express Delivery and High Kill Count; Rank Insurance is not offered on this wins page.",
    steps: [
      { title: "Choose the current division", text: "Set the ranked starting point used for the competitive-wins package." },
      { title: "Build the wins setup", text: "Select one to five wins, platform, Solo or Duo and the correct server region." },
      { title: "Confirm the live summary", text: "Review customizations, price and the displayed starting-time guidance before checkout." },
    ],
    faqs: [
      { question: "How many Rainbow Six Siege competitive wins can I order?", answer: "The configurator supports one through five wins. The chosen amount is priced from the current rank and remains visible in the summary." },
      { question: "Does Competitive Wins move me to a selected target rank?", answer: "This page does not ask for a target rank. It covers the selected win quantity at the current division; Rank Boost is the target-division service." },
      { question: "Can Rank Insurance be added to a Siege wins order?", answer: "No. The wins configurator provides five other customizations but filters out Rank Insurance, which appears on the separate Rank Boost page." },
    ],
    links: [
      rainbowSixSiegeOverview,
      { href: "/games/rainbow-six-siege/rank-boost", label: "Rainbow Six Siege Rank Boost" },
      { href: "/games/rainbow-six-siege/unrated-matches", label: "Rainbow Six Siege Unrated Matches" },
    ],
  },
  {
    gameSlug: "rainbow-six-siege",
    serviceSlug: "placements-boost",
    eyebrow: "Rainbow Six Siege placements",
    title: "How Rainbow Six Siege Placements Boost works",
    introduction: [
      "Placements Boost covers the matches used to establish the account’s ranked starting point. You choose a previous rank family from Copper through Champion and then configure one to five placement games rather than selecting a guaranteed resulting division.",
      "Previous performance, hidden MMR and the game’s ranking system can influence the outcome. Platform, Solo or Duo and server record how the matches should be completed, while the existing estimator provides starting-time guidance for a valid quote.",
    ],
    configuration:
      "Choose the previous rank family, one to five placement games, PC, Xbox or PlayStation, Solo or Duo, and Europe, North America, Latin America, Asia, Oceania, Brazil or Middle East. Available customizations are Play Offline, Specific Operators, Streaming, Express Delivery and High Kill Count. The resulting rank and individual match outcomes are not guaranteed.",
    steps: [
      { title: "Set previous-rank context", text: "Choose the rank family that best describes the account before its placement matches." },
      { title: "Configure the placement package", text: "Select the game count, platform, service mode and server region." },
      { title: "Review the limitations", text: "Confirm customizations, quote and timing guidance without treating them as a guaranteed placement result." },
    ],
    faqs: [
      { question: "Does Siege Placements Boost guarantee a final rank?", answer: "No. The service covers the configured placement matches. Previous performance, hidden MMR and the ranking system can affect the final result." },
      { question: "How do Solo and Duo differ for placements?", answer: "With Solo, a booster plays on the account used for the order. Duo lets you play alongside a booster and is selected directly in the service-mode control." },
      { question: "What must the account have before a placements order?", answer: "The account must already meet Rainbow Six Siege’s ranked-access requirements. The configurator does not provide or bypass those requirements." },
    ],
    links: [
      rainbowSixSiegeOverview,
      { href: "/games/rainbow-six-siege/rank-boost", label: "Rainbow Six Siege Rank Boost" },
      { href: "/games/rainbow-six-siege/competitive-wins", label: "Rainbow Six Siege Competitive Wins" },
    ],
  },
  {
    gameSlug: "rainbow-six-siege",
    serviceSlug: "unrated-matches",
    eyebrow: "Rainbow Six Siege unrated play",
    title: "How Rainbow Six Siege Unrated Matches works",
    introduction: [
      "Unrated Matches is a fixed match package outside Rainbow Six Siege’s ranked progression services. You choose between one and ten completed unrated games without entering a competitive rank, desired division, RP gain or placement result.",
      "Platform, Solo or Duo and server define the play environment. Ranked games, rank progress, wins and win rate are not included as guaranteed outcomes of this match-based service.",
    ],
    configuration:
      "Select one to ten unrated games, PC, Xbox or PlayStation, Solo or Duo, and Europe, North America, Latin America, Asia, Oceania, Brazil or Middle East. Optional customizations are Play Offline, Specific Operators, Streaming, Express Delivery and High Kill Count. Server choices are shown as price-neutral for this service, and the existing starting-time guidance remains in the order panel.",
    steps: [
      { title: "Choose the match quantity", text: "Set the package to the exact number of completed unrated games needed, from one to ten." },
      { title: "Select the play environment", text: "Choose platform, Solo or Duo and the server region for the order." },
      { title: "Inspect the final request", text: "Review customizations, total and starting-time guidance before proceeding through checkout." },
    ],
    faqs: [
      { question: "Do unrated matches include ranked progress?", answer: "No. This page purchases completed unrated matches. It does not configure Ranked games, a target rank or a guaranteed account outcome." },
      { question: "What is the Siege unrated match range?", answer: "The Number of Games selector offers one through ten. The selected quantity is carried into the live summary and final order review." },
      { question: "Which regions can I choose for an unrated order?", answer: "The page lists Europe, North America, Latin America, Asia, Oceania, Brazil and Middle East. All are displayed as price-neutral on this service." },
    ],
    links: [
      rainbowSixSiegeOverview,
      { href: "/games/rainbow-six-siege/placements-boost", label: "Rainbow Six Siege Placements Boost" },
      { href: "/games/rainbow-six-siege/competitive-wins", label: "Rainbow Six Siege Competitive Wins" },
    ],
  },
] as const satisfies readonly ServiceSeoContent[];

export const serviceSeoContent = content;

export function getServiceSeoContent(gameSlug: string, serviceSlug: string) {
  return content.find((entry) => entry.gameSlug === gameSlug && entry.serviceSlug === serviceSlug) ?? null;
}
