# Tuku | Open Source

---

### About The Bot

Tuku powers various features in the [Starlit Stargazers](https://discord.gg/RkuUmbByR9) server, and this repository contains its source code.

---

### Nekos.Best

The API that powers the anime for this bot is sourced from [Nekos Best](https://nekos.best), please consider the authors when using their service.

## Installation Instructions

Follow these steps to set up and run Tuku on your own machine:

### 1. **Clone the Repository**

First, clone the Tuku repositor using Git:

```bash
git clone https://github.com/Bxelz/Tuku
```

### 2. **Install Dependencies**

Install the necessary dependencies using `npm`:

```bash
npm install
```

### 3. **Obtain a Discord Bot Token**

You'll need a Discord bot token to run Tuku.

- Go to the [Discord Developer Portal](https://discord.com/developers/applications).
- Create a new application, then navigate to the "Bot" tab to generate your bot token.
- Save your Discord bot token for the next step.

### 4. **Configure the Bot**

Create a `config.json` file in the project directory and add your bot token along with other configuration settings. Use the following structure:

```json
{
    "name": "BOT_NAME",
    "token": "BOT_TOKEN",
    "devtoken": "DEV_BOT_TOKEN",
    "dev": "TRUE_OR_FALSE",
    "prefix": "COMMAND_PREFIX",
    "color": "EMBED_COLOR",
    "client_id": "BOT_ID",
    "status": "STATUS_LIKE_HELLO",
    "trusted_users": "OWNER_ID_TRUSTED",
    "server": "GUILD_ID",
    "animeChannel": "CHANNEL_ID"
}
```

- Replace `"token"` and `"devtoken"` with your actual Discord bot token(s).
- Adjust other fields as needed (e.g., `name`, `prefix`, `color`, etc.).

### 5. **Start the Bot**

After configuring `config.json`, move the `src` folder files into your main project folder and start the bot:

```bash
npm start index.js
```

Now Tuku should be running and ready to join your server!

---

## Contributing

We welcome contributions to Tuku! If you'd like to contribute, please follow these steps:

1. **Submit a pull request** to the main repository, explaining your changes.
2. **Join the Starlit Stargazers Discord** at [https://discord.gg/RkuUmbByR9](https://discord.gg/RkuUmbByR9).

We’ll review your contribution and merge it if it aligns with the project’s goals.