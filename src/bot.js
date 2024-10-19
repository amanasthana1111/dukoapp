"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: './src/.env' }); // Specify the path to your .env file
require('dotenv').config();
const telegraf_1 = require("telegraf");
const mongodb_1 = require("mongodb"); // Import MongoDB client
// Replace with your actual bot token from BotFather
const botToken = process.env.BOT_TOKEN || '7941234775:AAGaYD0h42vSPhvTQygUdSvbNWPWVWQBZCk';
const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://dukoton:w7I5lBgDyBYaE2T9@duko.gffuw.mongodb.net/?retryWrites=true&w=majority&appName=duko&tlsInsecure=true';
const dbName = process.env.DB_NAME || 'dukoDB';
const bot = new telegraf_1.Telegraf(botToken);
const url = mongoUrl;
; // Your database name
let db; // This will hold the database connection
let userCollection; // This will hold the user collection
// Initialize MongoDB connection
const initMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new mongodb_1.MongoClient(url);
        yield client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        userCollection = db.collection('users'); // Collection to store user data
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
});
let userStates = {};
// Function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Command: /start
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ctx.from.id;
    const telename = ctx.from.first_name || 'User';
    const referralId = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text.split(' ')[1]; // Extract referral ID from message
    // Check if the user already exists in the database
    const user = yield userCollection.findOne({ userId });
    if (user) {
        // Existing user: Show welcome message with their points
        const totalPoints = user.points || 0; // Get points from DB
        yield ctx.replyWithPhoto({ source: './images/duko-botM.png' }, {
            caption: `🌌 Hey ${ctx.from.username}, Welcome to Duko! 💖\n\nEarn points by connecting your TON wallet based on transactions. Stay tuned for our exciting features! 🌟\n\n✨ **Shape Your Rewards 😚**\n\n- **Daily Check-in:** Log in every 12 hours to claim your rewards!\n- **Invite Friends:** Boost your earnings by inviting friends to join the Duko community.\n- **Engage and Earn:** Use your wallet transactions to maximize your points!\n\nGet ready to dive into the world of Duko and discover the rewards that await you! 🚀\n\nDuko Points : ${totalPoints}`
        });
        // Display the main menu options
        yield ctx.reply('Transform Your Rewards with Duko! 🛠️🎉 ', telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('Claim Your Tokens! 🎉', 'claiming')],
            [
                telegraf_1.Markup.button.url('Join Duko! 🚀', 'https://t.me/duko_ton'),
                telegraf_1.Markup.button.callback('Invite frens🤝', 'INVITE_FRIENDS')
            ],
            [
                telegraf_1.Markup.button.callback('User Guide 👤', 'useractionmode'),
                telegraf_1.Markup.button.callback('My Level 🔝', 'mylevelinfoaction')
            ],
            [telegraf_1.Markup.button.url('Claim Your Tokens! 🎉', 'http://t.me/duko_tonBot/Duko')],
        ]));
    }
    else {
        // New user: Welcome message without collecting email
        yield ctx.replyWithPhoto({ source: './images/duko-botM.png' }, {
            caption: '🌌 **Welcome to Duko** 🌌\n\nExplore the world of Web3 and mine tokens while earning in the background.\n\n',
            parse_mode: 'Markdown'
        });
        yield ctx.reply("Duko Token Disclaimer: \n\n" +
            "At Duko, we prioritize our community above all! By engaging with Duko Tokens, you are becoming part of a vibrant ecosystem designed to reward and empower users like you. Your belief in our project is what drives us forward! 🌟 \n\n" +
            "If you observe any suspicious activities related to Duko Tokens, please contact our support team without delay. Thank you for believing in Duko and being an essential part of our journey! 🙌", telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('Understood and Continue', 'OPEN_MINI_APP')]]));
        // Referral handling: Process the referral if applicable
        if (referralId) {
            const referredBy = parseInt(referralId, 10); // Convert referral ID to userId
            const referrer = yield userCollection.findOne({ userId: referredBy });
            if (referrer) {
                // Insert the new user into the database with referral
                yield userCollection.insertOne({
                    userId: ctx.from.id,
                    telegramName: ctx.from.first_name || 'User',
                    username: ctx.from.username || 'User',
                    points: 0,
                    referralLink: `https://t.me/duko_tonBot?start=${ctx.from.id}`,
                    referredBy: referredBy // Store who referred this user
                });
                // Reward the referrer with points
                yield userCollection.updateOne({ userId: referrer.userId }, { $inc: { points: 99 } } // Give referrer 50 points for the referral
                );
                // Notify both referrer and the referred user
                yield ctx.reply(`🎉 You were referred by ${referrer.username}. They will receive bonus points!`);
            }
        }
    }
}));
// Handling the mini-app button action
bot.action('OPEN_MINI_APP', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id; // Get the user's Telegram ID
    // Ask for the user's email
    const entermess = yield ctx.reply("📧 Please enter your email address to continue:", telegraf_1.Markup.removeKeyboard());
    // Set a listener for the user's email input
    bot.on('text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const userEmail = ctx.message.text;
        // Validate the email format
        if (isValidEmail(userEmail)) {
            try {
                // Store the email and username in MongoDB
                yield userCollection.insertOne({
                    userId: ctx.from.id,
                    email: userEmail,
                    telegramName: ctx.from.first_name || 'User',
                    username: ctx.from.username || 'User',
                    bot: ctx.from.is_bot,
                    points: 0,
                    referralLink: `https://t.me/duko_tonBot?start=${ctx.from.id}`, // Generate a referral link for the user
                    referredBy: null // Will store the referrer's userId when a new user joins through a referral link
                });
                // Send a reply confirming the email and welcoming the user
                const thankYouMessage = yield ctx.reply(`✅ Thank you! Your email (${userEmail}) has been successfully saved. Welcome to Duko! 🎉`);
                // Optionally, send a follow-up message after confirming the email
                const totalPoints = 0; // Initial points
                yield ctx.replyWithPhoto({ source: './images/duko-botM.png' }, {
                    caption: `🌌 Hey ${ctx.from.username}, Welcome to Duko! 💖\n\nEarn points by connecting your TON wallet based on transactions. Stay tuned for our exciting features! 🌟\n\n✨ **Shape Your Rewards 😚**\n\n- **Daily Check-in:** Log in every 5 hours to claim your rewards!\n- **Invite Friends:** Boost your earnings by inviting friends to join the Duko community.\n- **Engage and Earn:** Use your wallet transactions to maximize your points!\n\nGet ready to dive into the world of Duko and discover the rewards that await you! 🚀\n\nDuko Points : ${totalPoints}`
                });
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    yield ctx.deleteMessage(thankYouMessage.message_id);
                }), 1000);
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    yield ctx.deleteMessage(entermess.message_id);
                }), 1000);
                yield ctx.reply('Transform Your Rewards with Duko! 🛠️🎉 ', telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('Claim Your Tokens! 🎉', 'FULL_WIDTH_ACTION')],
                    [
                        telegraf_1.Markup.button.url('Join Duko! 🚀', 'https://t.me/duko_ton'),
                        telegraf_1.Markup.button.callback('Invite frens🤝', 'INVITE_FRIENDS')
                    ],
                    [
                        telegraf_1.Markup.button.callback('User Guide 👤', 'useractionmode'),
                        telegraf_1.Markup.button.callback('My Level 🔝', 'mylevelinfoaction')
                    ],
                ]));
            }
            catch (err) {
                console.error("Error saving email:", err);
                yield ctx.reply("❌ There was an error saving your email. Please try again later.");
            }
        }
        else {
            // Send error message if email is not valid
            yield ctx.reply("🚫 Please enter a valid email address. Example: user@example.com");
        }
    }));
}));
// Handle the "Invite Friends" button
bot.action('INVITE_FRIENDS', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id;
    const user = yield userCollection.findOne({ userId });
    if (user && user.referralLink) {
        // Send the invite message with the user's referral link
        yield ctx.reply(`Share with your friends and earn bonuses for each friend you invite and for their activity:\n\nHere is your unique referral link:\n${user.referralLink}`);
    }
    else {
        yield ctx.reply("⚠️ Unable to generate a referral link. Please try again later.");
    }
}));
// Handle the User Guide action
bot.action('useractionmode', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Define the user guide content
    const userGuide = `
  📖 **Duko User Guide** 📖

  Welcome to Duko! Here's how to maximize your experience with us:

  1. **Getting Started** 🏁
     - Ensure you've entered a valid email address to receive updates.
     - Connect your TON wallet to start earning points based on your transactions.

  2. **Daily Check-ins** 📅
     - Log in every 5 hours to claim your rewards! The more you engage, the more you earn.

  3. **Invite Friends** 🤝
     - Share your referral link with friends and earn bonuses for every user that joins through your link!

  4. **Earning Points** 💰
     - Points are earned through transactions in your TON wallet.
     - The more you interact with the Duko ecosystem, the higher your points!

  5. **Redeeming Rewards** 🎁
     - Stay tuned for upcoming features where you can redeem your points for exciting rewards.

  6. **Stay Updated** 📲
     - Follow us on Telegram for the latest news and updates about Duko.

  We're excited to have you on board! If you have any questions, feel free to ask. Happy earning! 🚀
  `;
    // Send the user guide to the user
    yield ctx.reply(userGuide, {
        parse_mode: 'Markdown', // Use Markdown for better formatting
    });
}));
// Handling the token claiming action
// Handling the token claiming action
bot.action('claiming', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id;
    // Fetch the user from the database
    const user = yield userCollection.findOne({ userId });
    if (user) {
        const currentTime = Date.now();
        const lastClaimTime = user.lastClaimTime || 0;
        const timeSinceLastClaim = currentTime - lastClaimTime;
        // Set the claim interval (5 hours in milliseconds)
        const claimInterval = 5 * 60 * 60 * 1000;
        if (timeSinceLastClaim >= claimInterval) {
            // User is eligible to claim tokens
            const tokensToClaim = Math.floor(Math.random() * 51) + 50; // Random number between 50 and 100
            // Update user points and last claim time in the database
            yield userCollection.updateOne({ userId }, {
                $inc: { points: tokensToClaim }, // Increment points by the claimed tokens
                $set: { lastClaimTime: currentTime } // Update the last claim time
            });
            // Respond to the user with the claim success message
            yield ctx.reply(`🎉 Congratulations! You've claimed ${tokensToClaim} tokens! Your total points are now: ${user.points + tokensToClaim}.`);
        }
        else {
            // User is not eligible yet, calculate the remaining time
            const remainingTime = claimInterval - timeSinceLastClaim;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            yield ctx.reply(`⏳ You need to wait ${hours} hour(s), ${minutes} minute(s), and ${seconds} second(s) before claiming your tokens again!`);
        }
    }
    else {
        // Handle the case where the user is not found in the database
        yield ctx.reply("⚠️ User not found. Please start the bot again.");
    }
}));
// Command: /help
bot.command('help', (ctx) => {
    ctx.reply(`🌟 This is Explore Duko Bot! 🌟\n\n` +
        `Use the following commands to navigate:\n` +
        `/start - Start your Duko experience!\n` +
        `/help - Display this help message!\n`);
});
// Error handling
bot.catch((err) => {
    console.error('Error occurred:', err);
});
// Start the bot and MongoDB connection
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield initMongoDB(); // Initialize MongoDB before starting the bot
    bot.launch(); // Start the bot
    console.log('Bot is running...');
}))();
const levels = [
    { name: "Beginner", minTokens: 0, maxTokens: 5000, description: "Just starting out, keep earning!" },
    { name: "Intermediate", minTokens: 5001, maxTokens: 20000, description: "You’re making progress!" },
    { name: "Advanced", minTokens: 20001, maxTokens: 50000, description: "You're getting the hang of it!" },
    { name: "Expert", minTokens: 50001, maxTokens: 100000, description: "Almost a pro!" },
    { name: "Pro", minTokens: 1000001, maxTokens: 500000, description: "You know what you're doing!" },
    { name: "Master", minTokens: 500001, maxTokens: Infinity, description: "You're at the top of your game!" },
];
// Function to get user level information
let mylevelinfo = function getUserLevel(points) {
    for (const level of levels) {
        if (points >= level.minTokens && points <= level.maxTokens) {
            return {
                levelName: level.name,
                range: `${level.minTokens} - ${level.maxTokens}`,
                description: level.description,
            }; // Return the level name, range, and description
        }
    }
    return {
        levelName: "Unranked",
        range: "0 - 0",
        description: "No tokens earned yet.",
    }; // If points do not match any level
};
// Example usage within your bot commands
bot.action('mylevelinfoaction', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id;
    const user = yield userCollection.findOne({ userId });
    if (user) {
        const userPoints = user.points || 0; // Get points from DB
        const userLevel = mylevelinfo(userPoints); // Get user level based on points
        // Create a formatted response string
        const responseMessage = `
      🌟 Your Level: ${userLevel.levelName}\n
      💰 Points: ${userPoints}
      📈 Token Range: ${userLevel.range}
      📜 Description: ${userLevel.description}
    `;
        yield ctx.reply(responseMessage); // Send the formatted response
    }
    else {
        yield ctx.reply("⚠️ Unable to retrieve your level information. Please try again later.");
    }
}));
