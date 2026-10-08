export type ServiceSeoLink = {
  href: string;
  label: string;
};

export type ServiceSeoContent = {
  gameSlug: "league-of-legends" | "valorant" | "marvel-rivals";
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
] as const satisfies readonly ServiceSeoContent[];

export const serviceSeoContent = content;

export function getServiceSeoContent(gameSlug: string, serviceSlug: string) {
  return content.find((entry) => entry.gameSlug === gameSlug && entry.serviceSlug === serviceSlug) ?? null;
}
