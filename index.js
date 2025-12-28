import 'dotenv/config';
import axios from 'axios';
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} from 'discord.js';

/* =======================
   EMBED SAFETY
======================= */
function safeEmbed(text, limit = 4000) {
  if (!text) return 'No data available.';
  return text.length > limit ? text.slice(0, limit - 3) + '...' : text;
}

/* =======================
   CLIENT
======================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* =======================
   SPORT MAPS
======================= */
const ODDS_SPORTS = {
  nba: 'basketball_nba',
  nfl: 'americanfootball_nfl',
  ncaab: 'basketball_ncaab',
  ncaaf: 'americanfootball_ncaaf',
  nhl: 'icehockey_nhl',
  mlb: 'baseball_mlb',
  mls: 'soccer_usa_mls'
};

const PROPS_SPORTS = {
  nba: 'basketball_nba',
  nfl: 'americanfootball_nfl',
  ncaab: 'basketball_ncaab',
  ncaaf: 'americanfootball_ncaaf',
  nhl: 'icehockey_nhl',
  mlb: 'baseball_mlb'
};

/* =======================
   ODDS API
======================= */
async function getGames(sportKey) {
  try {
    const res = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      {
        params: {
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          apiKey: process.env.ODDS_API_KEY
        }
      }
    );

    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;

    return (res.data || []).filter(g => {
      const t = new Date(g.commence_time).getTime();
      return t >= now && t <= now + week;
    });
  } catch (err) {
    console.error('❌ Odds API Error:', err.response?.status);
    return [];
  }
}

/* =======================
   PLAYER PROPS (SPORTSGAMEODDS)
======================= */
async function getPlayerProps(sportKey) {
  try {
    const marketsRes = await axios.get(
      `https://api.sportsgameodds.com/v2/${sportKey}/markets`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SPORTSGAMEODDS_KEY}`
        }
      }
    );

    const markets = marketsRes.data.data
      .filter(m => m.key.includes('player'))
      .slice(0, 5);

    let props = [];

    for (const m of markets) {
      const oddsRes = await axios.get(
        `https://api.sportsgameodds.com/v2/${sportKey}/odds`,
        {
          params: { market: m.key },
          headers: {
            Authorization: `Bearer ${process.env.SPORTSGAMEODDS_KEY}`
          }
        }
      );

      if (oddsRes.data?.data) {
        props.push(...oddsRes.data.data);
      }
    }

    return props;
  } catch (err) {
    console.error('❌ Player Props Error:', err.response?.status);
    return [];
  }
}

/* =======================
   GPT ROUTER
======================= */
async function gptRoute(prompt, context) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a sharp sports betting analyst.' },
        { role: 'user', content: `${prompt}\n\n${context}` }
      ],
      temperature: 0.4
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  return res.data.choices[0].message.content;
}

/* =======================
   INTERACTIONS
======================= */
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const sport = interaction.options.getString('sport');

  await interaction.deferReply();

  /* PICKS / CALLEY */
  if (cmd === 'pick' || cmd === 'calley') {
    const sportKey = ODDS_SPORTS[sport];
    if (!sportKey) return interaction.editReply('❌ Unsupported sport.');

    const games = await getGames(sportKey);
    if (!games.length) return interaction.editReply('❌ No games found.');

    const context = games.map(g => `${g.home_team} vs ${g.away_team}`).join('\n');

    const reply = await gptRoute(
      'Pick ONE side per game with confidence %, market, and reasoning.',
      context
    );

    return interaction.editReply({
      embeds: [new EmbedBuilder().setTitle('📊 AI Picks').setDescription(safeEmbed(reply))]
    });
  }

  /* BANKROLL */
  if (cmd === 'bankroll') {
    const sportKey = ODDS_SPORTS[sport];
    if (!sportKey) return interaction.editReply('❌ Unsupported sport.');

    const games = await getGames(sportKey);
    const context = games.map(g => `${g.home_team} vs ${g.away_team}`).join('\n');

    const reply = await gptRoute(
      `Build a bankroll-based betting ticket with dollar amounts,
straight bets, parlays, underdogs, ML, spreads, totals.`,
      context
    );

    return interaction.editReply({
      embeds: [new EmbedBuilder().setTitle('💰 Bankroll Builder').setDescription(safeEmbed(reply))]
    });
  }

  /* UNDERDOG */
  if (cmd === 'underdog') {
    const sportKey = ODDS_SPORTS[sport];
    if (!sportKey) return interaction.editReply('❌ Unsupported sport.');

    const games = await getGames(sportKey);
    const context = games.map(g => `${g.home_team} vs ${g.away_team}`).join('\n');

    const reply = await gptRoute(
      `Identify underdog teams NOT favored, strong last 3 games, explain why live.`,
      context
    );

    return interaction.editReply({
      embeds: [new EmbedBuilder().setTitle('🐕 Top Underdogs').setDescription(safeEmbed(reply))]
    });
  }

  /* PLAYER PROPS */
  if (cmd === 'playerprops') {
    const sportKey = PROPS_SPORTS[sport];
    if (!sportKey) return interaction.editReply('❌ Player props not supported.');

    const props = await getPlayerProps(sportKey);
    if (!props.length) return interaction.editReply('❌ No player props available.');

    const formatted = props
      .slice(0, 12)
      .map(p => `${p.player_name} — ${p.market_key} ${p.point}`)
      .join('\n');

    const reply = await gptRoute(
      'Pick best OVER/UNDER player props with confidence %.',
      formatted
    );

    return interaction.editReply({
      embeds: [new EmbedBuilder().setTitle('📈 Player Props').setDescription(safeEmbed(reply))]
    });
  }
});

/* =======================
   READY
======================= */
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
