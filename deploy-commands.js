import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

/* =======================
   SPORTS
======================= */
const sports = [
  { name: 'College Basketball', value: 'ncaab' },
  { name: 'College Football', value: 'ncaaf' },
  { name: 'NBA', value: 'nba' },
  { name: 'NFL', value: 'nfl' },
  { name: 'NHL', value: 'nhl' },
  { name: 'MLB', value: 'mlb' },
  { name: 'MLS', value: 'mls' }
];

/* =======================
   COMMANDS ARRAY (THIS IS WHERE IT BROKE)
======================= */
const commands = [

  new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Ranked Winning Matchups')
    .addStringOption(o =>
      o.setName('sport')
        .setDescription('Choose sport')
        .setRequired(true)
        .addChoices(...sports)
    ),

  new SlashCommandBuilder()
    .setName('calley')
    .setDescription('GO BIG / GO HOME')
    .addStringOption(o =>
      o.setName('sport')
        .setDescription('Choose sport')
        .setRequired(true)
        .addChoices(...sports)
    ),

  new SlashCommandBuilder()
    .setName('playerprops')
    .setDescription('AI player prop picks')
    .addStringOption(o =>
      o.setName('sport')
        .setDescription('Choose sport')
        .setRequired(true)
        .addChoices(...sports)
    ),

  new SlashCommandBuilder()
    .setName('build')
    .setDescription('Build parlays & money slips')
    .addSubcommand(sc =>
      sc.setName('legs')
        .setDescription('Build a parlay')
        .addIntegerOption(o =>
          o.setName('count')
            .setDescription('Number of legs')
            .setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc.setName('money')
        .setDescription('Straight bets + same-game parlays')
    ),

  new SlashCommandBuilder()
    .setName('bankroll')
    .setDescription('Weekly bankroll strategy')
    .addStringOption(o =>
      o.setName('sport')
        .setDescription('Choose sport')
        .setRequired(true)
        .addChoices(...sports)
    ),

  new SlashCommandBuilder()
    .setName('underdog')
    .setDescription('Top AI underdogs this week')
    .addStringOption(o =>
      o.setName('sport')
        .setDescription('Choose sport')
        .setRequired(true)
        .addChoices(...sports)
    )

];

/* =======================
   DEPLOY
======================= */
const rest = new REST({ version: '10' })
  .setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands.map(c => c.toJSON()) }
);

console.log('✅ ALL slash commands deployed');
