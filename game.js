// ============================================
// SOUL COMMANDER v2.1 - SIMPLIFIED CORE
// Mobile Optimized • Scrollable • Clean Gameplay
// ============================================

// Game Configuration
const CONFIG = {
    GAME_NAME: "Soul Commander",
    VERSION: "2.1.0",
    AUTHOR: "Soul Commander Team",
    
    // Game Settings
    MAX_MESSAGES: 100,
    MAX_VISIBLE_MESSAGES: 15,
    AUTO_SCROLL: true,
    
    // Combat Settings
    CRIT_CHANCE: 0.1,
    DROP_CHANCE: 0.3,
    
    // Storage Keys
    STORAGE_KEYS: {
        SAVE_DATA: "soul_commander_save_v2",
        SETTINGS: "soul_commander_settings_v2",
        STATISTICS: "soul_commander_stats_v2",
        COMMAND_HISTORY: "soul_commander_history_v2"
    },
    
    // Colors
    COLORS: {
        HEALTH: "#FF7675",
        MANA: "#74B9FF",
        XP: "#FFEAA7",
        GOLD: "#FFD700"
    }
};

// Main Game Class
class SoulCommanderGame {
    constructor() {
        this.gameRunning = false;
        this.startTime = null;
        this.playTime = 0;
        this.gameDay = 1;
        this.streak = 0;
        this.lastPlayDate = null;
        
        // Command History
        this.commandHistory = [];
        this.historyIndex = -1;
        
        // Settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: false,
            autoSave: true,
            notifications: true,
            vibration: 'navigator' in window && 'vibrate' in navigator,
            theme: 'dark',
            autoScroll: true
        };
        
        // Game State
        this.player = null;
        this.enemies = [];
        this.locations = [];
        this.shopItems = [];
        this.activeEnemy = null;
        
        // Log System
        this.logMessages = [];
        this.autoScroll = true;
        this.maxMessages = CONFIG.MAX_MESSAGES;
        
        // Initialize
        this.initializeGameState();
        this.loadSettings();
        this.loadCommandHistory();
        this.setupEffects();
    }
    
    setupEffects() {
        // Create effect styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-80px) scale(1.3); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4); }
                50% { box-shadow: 0 0 20px 10px rgba(108, 92, 231, 0.2); }
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .effect-float {
                position: fixed;
                font-size: 32px;
                z-index: 9999;
                pointer-events: none;
                animation: floatUp 1s ease-out forwards;
            }
            
            .shake-effect {
                animation: shake 0.5s ease;
            }
            
            .pulse-effect {
                animation: pulseGlow 0.5s ease;
            }
            
            .slide-in {
                animation: slideIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    createEffect(type, x = 50, y = 50) {
        const effects = {
            'attack': { emoji: '⚔️', color: '#FF7675' },
            'heal': { emoji: '❤️', color: '#55EFC4' },
            'level': { emoji: '⭐', color: '#FFEAA7' },
            'loot': { emoji: '💰', color: '#FFD700' },
            'magic': { emoji: '🔮', color: '#74B9FF' },
            'critical': { emoji: '💥', color: '#FD79A8' }
        };
        
        const effect = effects[type] || effects.attack;
        const effectEl = document.createElement('div');
        
        effectEl.className = 'effect-float';
        effectEl.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            color: ${effect.color};
            text-shadow: 0 0 10px ${effect.color};
        `;
        
        effectEl.textContent = effect.emoji;
        document.body.appendChild(effectEl);
        
        setTimeout(() => effectEl.remove(), 1000);
        
        // Vibrate for mobile
        if (type === 'critical') this.vibrate(100);
        else if (type === 'level') this.vibrate(200);
        else this.vibrate(20);
    }
    
    screenShake() {
        const container = document.querySelector('.game-container');
        if (container) {
            container.classList.add('shake-effect');
            setTimeout(() => {
                container.classList.remove('shake-effect');
            }, 500);
        }
    }
    
    pulseElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('pulse-effect');
            setTimeout(() => {
                element.classList.remove('pulse-effect');
            }, 500);
        }
    }
    
    initializeGameState() {
        this.player = {
            // Basic Info
            name: "Knight",
            class: "Warrior",
            level: 1,
            xp: 0,
            xpToNext: 100,
            
            // Stats
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            armor: 100,
            maxArmor: 100,
            
            // Resources
            gold: 1250,
            soulShards: 0,
            kills: 0,
            
            // Location
            location: "Sanctuary",
            area: "Town Square",
            
            // Equipment (Simplified)
            equipment: {
                weapon: { name: "Iron Sword", icon: "⚔️", damage: "15-25" },
                skill: { name: "Soul Slam", icon: "💥", damage: "20-35" },
                armor: { name: "Leather Armor", icon: "🛡️", defense: 12 },
                accessory: { name: "Crystal Shard", icon: "💎", effect: "+5% Critical" },
                potion: { name: "Health Elixir", icon: "🧪", heal: 30, count: 3 },
                special: { name: "Dragon Companion", icon: "🐉", effect: "+10% XP" }
            },
            
            // Inventory (Simplified)
            inventory: [
                { id: 1, name: "Health Potion", count: 3, type: "consumable", icon: "🧪" },
                { id: 2, name: "Mana Potion", count: 2, type: "consumable", icon: "🔮" },
                { id: 3, name: "Bronze Dagger", count: 1, type: "weapon", icon: "🗡️" }
            ],
            
            // Active Quest
            activeQuest: {
                id: "initiate_trial",
                name: "Initiate's Trial",
                description: "Defeat 3 enemies to prove your worth",
                type: "combat",
                target: "enemy",
                required: 3,
                progress: 0,
                completed: false,
                reward: { xp: 100, gold: 50, item: "Iron Sword" }
            },
            
            // Statistics
            stats: {
                totalDamage: 0,
                totalHealed: 0,
                enemiesDefeated: 0,
                questsCompleted: 0,
                goldEarned: 0,
                playTime: 0,
                commandsUsed: 0,
                daysPlayed: 1
            }
        };
        
        // Enemies (Simplified)
        this.enemies = [
            { id: "goblin", name: "Goblin", level: 1, health: 50, damage: "8-15", xp: 25, gold: 10 },
            { id: "skeleton", name: "Skeleton", level: 2, health: 75, damage: "12-20", xp: 35, gold: 15 },
            { id: "orc", name: "Orc", level: 3, health: 100, damage: "15-25", xp: 50, gold: 25 },
            { id: "dragon_whelp", name: "Dragon Whelp", level: 5, health: 150, damage: "20-35", xp: 100, gold: 50 }
        ];
        
        // Locations
        this.locations = [
            { id: "sanctuary", name: "Sanctuary", areas: ["Town Square", "Training Grounds", "Marketplace"], danger: 0 },
            { id: "dark_forest", name: "Dark Forest", areas: ["Ancient Woods", "Shadow Grove", "Spider Nest"], danger: 1 },
            { id: "crystal_caves", name: "Crystal Caves", areas: ["Glowing Cavern", "Gemstone Tunnel", "Dragon's Lair"], danger: 2 }
        ];
        
        // Shop Items
        this.shopItems = [
            { id: 1, name: "Health Potion", price: 50, type: "consumable", effect: "Restores 30 HP" },
            { id: 2, name: "Mana Potion", price: 75, type: "consumable", effect: "Restores 20 MP" },
            { id: 3, name: "Iron Sword", price: 200, type: "weapon", damage: "15-25" },
            { id: 4, name: "Steel Armor", price: 300, type: "armor", defense: 20 },
            { id: 5, name: "Magic Ring", price: 500, type: "accessory", effect: "+10% Mana" }
        ];
        
        // Commands
        this.commands = {
            combat: ["fight", "attack", "battle"],
            explore: ["explore", "travel", "venture"],
            heal: ["heal", "potion", "recover"],
            inventory: ["inventory", "inv", "items"],
            stats: ["stats", "status", "info"],
            quest: ["quest", "mission", "task"],
            shop: ["shop", "buy", "store"],
            help: ["help", "commands", "guide"],
            save: ["save", "store"],
            load: ["load", "restore"],
            clear: ["clear", "cls"],
            rest: ["rest", "sleep"]
        };
    }
    
    // =============== GAME START ===============
    
    startGame() {
        if (this.gameRunning) return;
        
        console.log(`🚀 ${CONFIG.GAME_NAME} v${CONFIG.VERSION} starting...`);
        
        this.gameRunning = true;
        this.startTime = Date.now();
        this.lastPlayDate = new Date().toDateString();
        
        // Setup
        this.setupUI();
        this.setupMobileOptimizations();
        this.updateAllUI();
        this.drawCharacter();
        
        // Welcome
        this.addLog(`🎮 ${CONFIG.GAME_NAME} v${CONFIG.VERSION}`, "welcome");
        this.addLog("⚔️ Type 'help' for commands", "system");
        
        // Load saved game
        if (this.loadGame()) {
            this.addLog("💾 Game loaded", "system");
        }
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('commandInput');
            if (input) {
                input.focus();
                if ('ontouchstart' in window) {
                    input.setSelectionRange(0, 0);
                }
            }
        }, 500);
        
        // Start game loop
        this.gameLoop();
        
        // Auto-save interval
        if (this.settings.autoSave) {
            setInterval(() => this.autoSaveGame(), 120000);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updatePlayTime();
        this.animateCharacter();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // =============== MOBILE OPTIMIZATIONS ===============
    
    setupMobileOptimizations() {
        // Touch events
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Keyboard handling
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.addEventListener('focus', () => {
                // Scroll to input on mobile
                if ('ontouchstart' in window) {
                    setTimeout(() => {
                        commandInput.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                }
            });
        }
        
        // Swipe gestures for log
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            let touchStartY = 0;
            
            logContainer.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            logContainer.addEventListener('touchmove', (e) => {
                if (document.activeElement === commandInput) {
                    const touchY = e.touches[0].clientY;
                    const diff = touchStartY - touchY;
                    
                    // Blur input on swipe up
                    if (diff > 50) {
                        commandInput.blur();
                    }
                }
            }, { passive: true });
        }
    }
    
    // =============== UI MANAGEMENT ===============
    
    setupUI() {
        this.setupEventListeners();
        this.setupLogScrolling();
        this.updateCommandHistoryDisplay();
        this.applyTheme();
        this.updateMessageCounter();
    }
    
    setupEventListeners() {
        const commandInput = document.getElementById('commandInput');
        if (commandInput) {
            commandInput.addEventListener('keydown', (e) => this.handleCommandKey(e));
            commandInput.addEventListener('input', (e) => this.handleInputChange(e));
        }
        
        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.settings.autoSave) {
                this.saveGame();
            }
        });
        
        // Touch feedback
        if (this.settings.vibration) {
            document.querySelectorAll('.command-chip, .equip-slot, .send-btn').forEach(btn => {
                btn.addEventListener('touchstart', () => {
                    navigator.vibrate(10);
                });
            });
        }
    }
    
    setupLogScrolling() {
        const logContainer = document.getElementById('gameLog');
        if (!logContainer) return;
        
        logContainer.addEventListener('scroll', () => {
            const isAtBottom = logContainer.scrollHeight - logContainer.scrollTop <= logContainer.clientHeight + 10;
            
            if (isAtBottom && !this.autoScroll) {
                this.setAutoScroll(true);
            } else if (!isAtBottom && this.autoScroll) {
                this.setAutoScroll(false);
            }
        });
        
        // Tap log to focus input
        logContainer.addEventListener('click', (e) => {
            if (e.target === logContainer || e.target.classList.contains('log-entry')) {
                document.getElementById('commandInput').focus();
            }
        });
    }
    
    // =============== COMMAND SYSTEM ===============
    
    handleCommandKey(event) {
        const input = event.target;
        
        switch(event.key) {
            case 'Enter':
                event.preventDefault();
                this.executeCommand();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.navigateCommandHistory(-1);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.navigateCommandHistory(1);
                break;
                
            case 'Tab':
                event.preventDefault();
                this.autoCompleteCommand();
                break;
                
            case 'Escape':
                input.blur();
                break;
        }
    }
    
    handleInputChange(event) {
        const input = event.target.value.toLowerCase();
        this.updateCommandSuggestions(input);
        
        if (input !== (this.commandHistory[this.historyIndex] || '')) {
            this.historyIndex = -1;
        }
    }
    
    executeCommand() {
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        
        if (!command) {
            this.vibrate(50);
            return;
        }
        
        input.value = '';
        this.addToCommandHistory(command);
        this.vibrate(20);
        
        this.addLog(`> ${command}`, "system");
        this.processCommand(command);
        
        this.player.stats.commandsUsed++;
        
        setTimeout(() => input.focus(), 100);
    }
    
    processCommand(command) {
        const cmdLower = command.toLowerCase();
        const parts = cmdLower.split(' ');
        const action = parts[0];
        const args = parts.slice(1);
        
        // Check command categories
        if (this.commands.combat.includes(action)) {
            this.handleCombat(args);
        } else if (this.commands.explore.includes(action)) {
            this.handleExplore(args);
        } else if (this.commands.heal.includes(action)) {
            this.handleHeal(args);
        } else if (this.commands.inventory.includes(action)) {
            this.showInventory();
        } else if (this.commands.stats.includes(action)) {
            this.showStats();
        } else if (this.commands.quest.includes(action)) {
            this.showQuest();
        } else if (this.commands.shop.includes(action)) {
            this.openShop();
        } else if (this.commands.help.includes(action)) {
            this.showHelp();
        } else if (this.commands.save.includes(action)) {
            this.saveGame();
        } else if (this.commands.load.includes(action)) {
            this.loadGame();
        } else if (this.commands.clear.includes(action)) {
            this.clearLog();
        } else if (this.commands.rest.includes(action)) {
            this.rest();
        } else if (action === 'use') {
            this.useItem(args);
        } else if (action === 'equip') {
            this.equipItem(args);
        } else if (action === 'buy' && args.length > 0) {
            this.buyItem(parseInt(args[0]));
        } else {
            this.addLog(`❓ Unknown command: "${action}"`, "system");
            this.addLog("💡 Type 'help' for commands", "system");
        }
        
        this.updateCommandHistoryDisplay();
    }
    
    navigateCommandHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        const input = document.getElementById('commandInput');
        
        if (direction === -1) {
            this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
        } else {
            this.historyIndex = Math.max(-1, this.historyIndex - 1);
        }
        
        if (this.historyIndex >= 0) {
            input.value = this.commandHistory[this.historyIndex];
        } else {
            input.value = '';
        }
    }
    
    addToCommandHistory(command) {
        if (this.commandHistory[0] !== command) {
            this.commandHistory.unshift(command);
            
            if (this.commandHistory.length > 20) {
                this.commandHistory.pop();
            }
            
            this.saveCommandHistory();
        }
        
        this.historyIndex = -1;
    }
    
    updateCommandSuggestions(input) {
        const quickChips = document.getElementById('quickChips');
        if (!quickChips) return;
        
        const chips = quickChips.querySelectorAll('.command-chip');
        chips.forEach(chip => {
            const text = chip.textContent.toLowerCase();
            if (input && text.includes(input)) {
                chip.style.opacity = '1';
                chip.style.order = '0';
            } else if (input) {
                chip.style.opacity = '0.5';
                chip.style.order = '1';
            } else {
                chip.style.opacity = '1';
                chip.style.order = '0';
            }
        });
    }
    
    autoCompleteCommand() {
        const input = document.getElementById('commandInput');
        const current = input.value.toLowerCase().trim();
        
        if (!current) {
            this.showCommandSuggestions();
            return;
        }
        
        const allCommands = Object.values(this.commands).flat();
        const matches = allCommands.filter(cmd => cmd.startsWith(current));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            this.addLog(`🔍 Matching: ${matches.slice(0, 5).join(', ')}`, "system");
        }
        
        input.focus();
        input.setSelectionRange(current.length, input.value.length);
    }
    
    showCommandSuggestions() {
        const suggestions = [
            "⚔️  fight [enemy] - Battle enemy",
            "🌲  explore [area] - Explore",
            "🧪  heal - Use health potion",
            "🎒  inventory - Show inventory",
            "📊  stats - Player stats",
            "🛌  rest - Rest to recover",
            "🏪  shop - Visit shop",
            "🎯  quest - Show quest",
            "💾  save - Save game",
            "📂  load - Load game"
        ];
        
        this.addLog("📋 Quick commands:", "system");
        suggestions.forEach(cmd => {
            this.addLog(cmd, "system");
        });
    }
    
    updateCommandHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        const recentCommands = this.commandHistory.slice(0, 5);
        
        recentCommands.forEach(cmd => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = cmd;
            item.onclick = () => {
                document.getElementById('commandInput').value = cmd;
                document.getElementById('commandInput').focus();
            };
            historyList.appendChild(item);
        });
        
        if (recentCommands.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-item';
            empty.textContent = "No commands yet";
            empty.style.opacity = '0.5';
            historyList.appendChild(empty);
        }
    }
    
    // =============== COMBAT SYSTEM ===============
    
    handleCombat(args) {
        const enemyName = args.join(' ') || 'goblin';
        const enemy = this.findEnemy(enemyName);
        
        if (!enemy) {
            this.addLog(`❓ Enemy "${enemyName}" not found.`, "system");
            this.addLog(`💡 Try: ${this.enemies.map(e => e.name.toLowerCase()).join(', ')}`, "system");
            return;
        }
        
        if (this.player.health <= 0) {
            this.addLog("💀 You are too weak to fight! Heal first.", "combat");
            return;
        }
        
        this.activeEnemy = { ...enemy };
        this.combatRound();
    }
    
    findEnemy(name) {
        return this.enemies.find(enemy => 
            enemy.name.toLowerCase().includes(name.toLowerCase()) ||
            enemy.id.toLowerCase() === name.toLowerCase()
        ) || this.enemies[0];
    }
    
    combatRound() {
        if (!this.activeEnemy) return;
        
        const enemy = this.activeEnemy;
        
        this.addLog(`⚔️ You encounter a ${enemy.name}!`, "combat");
        
        // Player attack
        const playerDamage = this.calculateDamage(this.player.equipment.weapon.damage);
        const isCritical = Math.random() < CONFIG.CRIT_CHANCE;
        const actualPlayerDamage = isCritical ? Math.floor(playerDamage * 1.5) : playerDamage;
        
        enemy.health -= actualPlayerDamage;
        
        if (isCritical) {
            this.addLog(`💥 CRITICAL HIT! ${actualPlayerDamage} damage!`, "combat");
            this.createEffect('critical');
            this.screenShake();
        } else {
            this.addLog(`🎯 You attack for ${actualPlayerDamage} damage`, "combat");
            this.createEffect('attack');
        }
        
        // Check if enemy defeated
        if (enemy.health <= 0) {
            this.defeatEnemy(enemy);
            return;
        }
        
        // Enemy attack
        const enemyDamage = this.calculateDamage(enemy.damage);
        const armorReduction = Math.floor(this.player.equipment.armor.defense / 10);
        const actualEnemyDamage = Math.max(1, enemyDamage - armorReduction);
        
        this.player.health -= actualEnemyDamage;
        this.player.armor = Math.max(0, this.player.armor - 5);
        
        this.addLog(`🔥 ${enemy.name} attacks! ${actualEnemyDamage} damage`, "combat");
        
        if (armorReduction > 0) {
            this.addLog(`🛡️ Armor absorbed ${armorReduction} damage`, "system");
        }
        
        // Check if player defeated
        if (this.player.health <= 0) {
            this.playerDefeated();
            return;
        }
        
        // Update display
        this.addLog(`❤️ Health: ${this.player.health}/${this.player.maxHealth}`, "combat");
        this.addLog(`💀 ${enemy.name}: ${enemy.health}/${enemy.maxHealth}`, "combat");
        
        this.updateHealthBars();
        this.updateStatsDisplay();
    }
    
    calculateDamage(damageStr) {
        if (damageStr.includes('-')) {
            const [min, max] = damageStr.split('-').map(Number);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return parseInt(damageStr) || 10;
    }
    
    defeatEnemy(enemy) {
        // Calculate rewards
        const xpGain = enemy.xp;
        const goldGain = enemy.gold;
        const soulShardGain = Math.floor(Math.random() * 3) + 1;
        
        // Update player
        this.player.xp += xpGain;
        this.player.gold += goldGain;
        this.player.soulShards += soulShardGain;
        this.player.kills++;
        this.player.stats.enemiesDefeated++;
        this.player.stats.totalDamage += enemy.maxHealth;
        
        // Update quest progress
        if (this.player.activeQuest && 
            this.player.activeQuest.type === "combat" && 
            !this.player.activeQuest.completed) {
            this.player.activeQuest.progress++;
            
            if (this.player.activeQuest.progress >= this.player.activeQuest.required) {
                this.completeQuest();
            }
        }
        
        // Log messages
        this.addLog(`🏆 ${enemy.name} defeated!`, "combat");
        this.addLog(`⭐ +${xpGain} XP`, "xp");
        this.addLog(`💰 +${goldGain} Gold`, "loot");
        this.addLog(`💎 +${soulShardGain} Soul Shards`, "loot");
        
        // Check for level up
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }
        
        // Random loot
        if (Math.random() < CONFIG.DROP_CHANCE) {
            this.dropLoot();
        }
        
        // Reset enemy
        this.activeEnemy = null;
        
        // Update UI
        this.updateAllUI();
        this.createEffect('loot');
    }
    
    dropLoot() {
        const lootTable = [
            { name: "Health Potion", chance: 0.5, type: "consumable" },
            { name: "Mana Potion", chance: 0.3, type: "consumable" },
            { name: "Iron Dagger", chance: 0.15, type: "weapon" },
            { name: "Magic Scroll", chance: 0.05, type: "special" }
        ];
        
        const loot = this.weightedRandom(lootTable);
        
        // Add to inventory
        const existingItem = this.player.inventory.find(i => i.name === loot.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                id: Date.now(),
                name: loot.name,
                count: 1,
                type: loot.type,
                icon: loot.type === "consumable" ? "🧪" : "🗡️"
            });
        }
        
        this.addLog(`🎁 Loot: ${loot.name}`, "loot");
    }
    
    playerDefeated() {
        this.addLog("💀 YOU HAVE BEEN DEFEATED!", "combat");
        this.addLog("Your soul returns to the Sanctuary...", "system");
        
        // Penalty
        const goldLoss = Math.floor(this.player.gold * 0.1);
        this.player.gold = Math.max(0, this.player.gold - goldLoss);
        
        // Reset stats
        this.player.health = Math.floor(this.player.maxHealth * 0.25);
        this.player.mana = Math.floor(this.player.maxMana * 0.25);
        this.player.armor = Math.floor(this.player.maxArmor * 0.25);
        this.player.location = "Sanctuary";
        this.player.area = "Town Square";
        this.activeEnemy = null;
        
        this.updateAllUI();
        this.addLog(`💰 Lost ${goldLoss} gold`, "system");
    }
    
    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.chance, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.chance;
            if (random <= 0) {
                return item;
            }
        }
        
        return items[0];
    }
    
    // =============== EXPLORATION ===============
    
    handleExplore(args) {
        const areaName = args.join(' ') || '';
        
        if (areaName) {
            this.travelToArea(areaName);
        } else {
            this.randomExploration();
        }
    }
    
    randomExploration() {
        this.addLog("🌲 You begin exploring...", "system");
        
        const energyCost = 10;
        this.player.mana = Math.max(0, this.player.mana - energyCost);
        
        const events = [
            { type: "enemy", chance: 0.4 },
            { type: "treasure", chance: 0.3 },
            { type: "nothing", chance: 0.2 },
            { type: "special", chance: 0.1 }
        ];
        
        const event = this.weightedRandom(events);
        
        switch (event.type) {
            case "enemy":
                const enemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                this.addLog(`⚠️ Encountered a ${enemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${enemy.name.toLowerCase()}'`, "system");
                break;
                
            case "treasure":
                const treasureGold = Math.floor(Math.random() * 50) + 20;
                this.player.gold += treasureGold;
                this.addLog(`💰 Found treasure! +${treasureGold} Gold`, "loot");
                this.createEffect('loot');
                break;
                
            case "special":
                this.addLog("🌟 Ancient shrine discovered!", "system");
                this.player.maxHealth += 5;
                this.player.health += 5;
                this.createEffect('magic');
                break;
                
            default:
                this.addLog("Nothing interesting...", "system");
        }
        
        this.addLog(`⚡ Mana -${energyCost}`, "system");
        this.updateAllUI();
    }
    
    travelToArea(areaName) {
        const currentLocation = this.locations.find(loc => 
            loc.name.toLowerCase() === this.player.location.toLowerCase()
        );
        
        if (!currentLocation) {
            this.addLog("❓ Location not found", "system");
            return;
        }
        
        const area = currentLocation.areas.find(a => 
            a.toLowerCase().includes(areaName.toLowerCase())
        );
        
        if (!area) {
            this.addLog(`❓ Area not found in ${this.player.location}`, "system");
            this.addLog(`📍 Available: ${currentLocation.areas.join(', ')}`, "system");
            return;
        }
        
        const travelCost = 5;
        if (this.player.mana < travelCost) {
            this.addLog("⚡ Not enough mana!", "system");
            return;
        }
        
        this.player.area = area;
        this.player.mana -= travelCost;
        
        this.addLog(`🚶 Traveling to ${area}...`, "system");
        this.addLog(`📍 Arrived at ${area}`, "system");
        this.addLog(`⚡ Mana -${travelCost}`, "system");
        
        // Random encounter
        if (Math.random() < (currentLocation.danger * 0.2)) {
            setTimeout(() => {
                const enemy = this.enemies[
                    Math.floor(Math.random() * Math.min(this.enemies.length, currentLocation.danger + 2))
                ];
                this.addLog(`⚠️ Ambushed by a ${enemy.name}!`, "combat");
                this.addLog(`💡 Type 'fight ${enemy.name.toLowerCase()}'`, "system");
            }, 1000);
        }
        
        this.updateAllUI();
    }
    
    // =============== HEALING & REST ===============
    
    handleHeal(args) {
        if (args.length > 0 && args[0] === 'potion') {
            this.usePotion();
        } else {
            this.rest();
        }
    }
    
    usePotion() {
        const potion = this.player.equipment.potion;
        
        if (potion.count <= 0) {
            this.addLog("❌ No potions!", "system");
            return;
        }
        
        if (this.player.health >= this.player.maxHealth) {
            this.addLog("✅ Already at full health!", "system");
            return;
        }
        
        potion.count--;
        const healAmount = potion.heal;
        const oldHealth = this.player.health;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        const actualHeal = this.player.health - oldHealth;
        
        this.player.stats.totalHealed += actualHeal;
        
        this.addLog(`🧪 Used ${potion.name}!`, "heal");
        this.addLog(`❤️ +${actualHeal} Health`, "heal");
        this.addLog(`📦 Potions: ${potion.count}`, "heal");
        
        this.createEffect('heal');
        this.pulseElement('healthBar');
        this.updateAllUI();
    }
    
    rest() {
        if (this.player.health >= this.player.maxHealth && 
            this.player.mana >= this.player.maxMana) {
            this.addLog("✅ Already fully rested!", "system");
            return;
        }
        
        this.addLog("🛌 Resting...", "system");
        
        const oldHealth = this.player.health;
        const oldMana = this.player.mana;
        
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
        this.player.mana = Math.min(this.player.maxMana, this.player.mana + 30);
        
        const healthRestored = this.player.health - oldHealth;
        const manaRestored = this.player.mana - oldMana;
        
        if (healthRestored > 0) {
            this.addLog(`❤️ +${healthRestored} Health`, "heal");
        }
        
        if (manaRestored > 0) {
            this.addLog(`🔮 +${manaRestored} Mana`, "heal");
        }
        
        // Advance game day
        if (healthRestored > 10) {
            this.gameDay++;
            this.addLog(`📅 Day ${this.gameDay} begins`, "system");
        }
        
        this.updateAllUI();
        this.createEffect('magic');
    }
    
    // =============== INVENTORY & ITEMS ===============
    
    showInventory() {
        this.addLog("🎒 === INVENTORY ===", "system");
        this.addLog("⚔️ Equipped:", "system");
        
        Object.entries(this.player.equipment).forEach(([slot, item]) => {
            this.addLog(`${item.icon} ${slot}: ${item.name}`, "system");
        });
        
        this.addLog("📦 Items:", "system");
        
        if (this.player.inventory.length === 0) {
            this.addLog("Empty", "system");
        } else {
            this.player.inventory.forEach(item => {
                this.addLog(`${item.icon} ${item.name} x${item.count}`, "system");
            });
        }
        
        this.addLog("💡 Use 'use [item]' or 'equip [item]'", "system");
    }
    
    useItem(args) {
        if (args.length === 0) {
            this.addLog("❓ Usage: use [item name]", "system");
            return;
        }
        
        const itemName = args.join(' ').toLowerCase();
        const item = this.player.inventory.find(i => 
            i.name.toLowerCase().includes(itemName)
        );
        
        if (!item) {
            this.addLog(`❓ Item not found`, "system");
            return;
        }
        
        switch(item.type) {
            case 'consumable':
                this.useConsumable(item);
                break;
            case 'weapon':
                this.equipWeapon(item);
                break;
            default:
                this.addLog(`📦 Used ${item.name}`, "system");
                item.count--;
                if (item.count <= 0) {
                    this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
                }
        }
        
        this.updateAllUI();
    }
    
    useConsumable(item) {
        if (item.name.toLowerCase().includes('health')) {
            const healAmount = 30;
            const oldHealth = this.player.health;
            this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
            const actualHeal = this.player.health - oldHealth;
            
            this.addLog(`🧪 Used ${item.name}!`, "heal");
            this.addLog(`❤️ +${actualHeal} Health`, "heal");
            this.createEffect('heal');
        } else if (item.name.toLowerCase().includes('mana')) {
            const manaAmount = 20;
            const oldMana = this.player.mana;
            this.player.mana = Math.min(this.player.maxMana, this.player.mana + manaAmount);
            const actualMana = this.player.mana - oldMana;
            
            this.addLog(`🔮 Used ${item.name}!`, "heal");
            this.addLog(`⚡ +${actualMana} Mana`, "heal");
            this.createEffect('magic');
        }
        
        item.count--;
        if (item.count <= 0) {
            this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        }
    }
    
    equipWeapon(item) {
        const oldWeapon = this.player.equipment.weapon;
        
        this.player.equipment.weapon = {
            name: item.name,
            icon: "⚔️",
            damage: "20-30",
            type: "weapon",
            rarity: "common",
            value: 150
        };
        
        this.addLog(`⚔️ Equipped ${item.name}!`, "system");
        
        // Add old weapon to inventory
        const existingItem = this.player.inventory.find(i => i.name === oldWeapon.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                id: Date.now(),
                name: oldWeapon.name,
                count: 1,
                type: "weapon",
                icon: "⚔️"
            });
        }
        
        // Remove equipped item
        item.count--;
        if (item.count <= 0) {
            this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        }
    }
    
    equipItem(args) {
        this.useItem(args);
    }
    
    // =============== SHOP SYSTEM ===============
    
    openShop() {
        this.addLog("🏪 === SOUL MARKET ===", "system");
        this.addLog(`💰 Gold: ${this.player.gold}`, "system");
        this.addLog("Items for sale:", "system");
        
        this.shopItems.forEach((item, index) => {
            this.addLog(`${index + 1}. ${item.name} - ${item.price} gold`, "system");
        });
        
        this.addLog("💡 Use 'buy [number]' to purchase", "system");
    }
    
    buyItem(itemNumber) {
        const itemIndex = itemNumber - 1;
        
        if (itemIndex < 0 || itemIndex >= this.shopItems.length) {
            this.addLog(`❓ Item ${itemNumber} not found`, "system");
            return;
        }
        
        const item = this.shopItems[itemIndex];
        
        if (this.player.gold < item.price) {
            this.addLog(`❌ Need ${item.price} gold, have ${this.player.gold}`, "system");
            return;
        }
        
        this.player.gold -= item.price;
        
        // Add to inventory
        const existingItem = this.player.inventory.find(i => i.name === item.name);
        if (existingItem) {
            existingItem.count++;
        } else {
            this.player.inventory.push({
                id: Date.now(),
                name: item.name,
                count: 1,
                type: item.type,
                icon: item.type === "consumable" ? "🧪" : 
                       item.type === "weapon" ? "⚔️" :
                       item.type === "armor" ? "🛡️" : "💎"
            });
        }
        
        this.addLog(`✅ Purchased ${item.name} for ${item.price} gold`, "loot");
        this.updateAllUI();
    }
    
    // =============== LEVEL & PROGRESSION ===============
    
    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNext;
        this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
        
        // Stat increases
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 10;
        this.player.mana = this.player.maxMana;
        this.player.maxArmor += 15;
        this.player.armor = this.player.maxArmor;
        
        this.addLog(`✨ LEVEL UP! Now Level ${this.player.level}!`, "xp");
        this.addLog(`❤️ Max Health: ${this.player.maxHealth}`, "heal");
        this.addLog(`🔮 Max Mana: ${this.player.maxMana}`, "heal");
        this.addLog(`🛡️ Max Armor: ${this.player.maxArmor}`, "heal");
        
        this.createEffect('level');
        this.vibrate(200);
        
        // Check for multiple level ups
        if (this.player.xp >= this.player.xpToNext) {
            setTimeout(() => this.levelUp(), 1000);
        }
        
        this.updateAllUI();
    }
    
    completeQuest() {
        const quest = this.player.activeQuest;
        
        if (!quest || quest.completed) return;
        
        quest.completed = true;
        this.player.stats.questsCompleted++;
        
        // Give rewards
        this.player.xp += quest.reward.xp;
        this.player.gold += quest.reward.gold;
        this.player.stats.goldEarned += quest.reward.gold;
        
        this.addLog(`🎉 Quest Completed: ${quest.name}!`, "xp");
        this.addLog(`⭐ +${quest.reward.xp} XP`, "xp");
        this.addLog(`💰 +${quest.reward.gold} Gold`, "loot");
        
        if (quest.reward.item) {
            this.addLog(`🎁 Reward: ${quest.reward.item}`, "loot");
            const existingItem = this.player.inventory.find(i => i.name === quest.reward.item);
            if (existingItem) {
                existingItem.count++;
            } else {
                this.player.inventory.push({
                    id: Date.now(),
                    name: quest.reward.item,
                    count: 1,
                    type: "weapon",
                    icon: "⚔️"
                });
            }
        }
        
        // Generate new quest
        this.generateNewQuest();
        this.updateAllUI();
        this.createEffect('loot');
    }
    
    generateNewQuest() {
        const questTypes = [
            {
                type: "combat",
                templates: [
                    { name: "Soul Hunter", desc: "Defeat {count} enemies", required: 5 },
                    { name: "Goblin Exterminator", desc: "Eliminate {count} goblins", required: 10 }
                ]
            },
            {
                type: "collection",
                templates: [
                    { name: "Gold Collector", desc: "Gather {count} gold", required: 500 }
                ]
            }
        ];
        
        const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];
        const template = randomType.templates[Math.floor(Math.random() * randomType.templates.length)];
        
        this.player.activeQuest = {
            id: `quest_${Date.now()}`,
            name: template.name,
            description: template.desc.replace('{count}', template.required),
            type: randomType.type,
            target: randomType.type === "combat" ? "enemy" : "item",
            required: template.required,
            progress: 0,
            completed: false,
            reward: {
                xp: this.player.level * 50,
                gold: this.player.level * 25,
                item: this.getRandomItemReward()
            }
        };
        
        this.addLog(`🎯 New Quest: ${this.player.activeQuest.name}`, "system");
        this.addLog(`📝 ${this.player.activeQuest.description}`, "system");
    }
    
    getRandomItemReward() {
        const items = ["Health Potion", "Mana Potion", "Iron Sword", "Steel Armor"];
        return items[Math.floor(Math.random() * items.length)];
    }
    
    // =============== LOG SYSTEM ===============
    
    addLog(message, type = "system") {
        const timestamp = new Date();
        const timeString = `[${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}]`;
        
        const logEntry = {
            id: Date.now(),
            message,
            type,
            timestamp,
            timeString
        };
        
        this.logMessages.push(logEntry);
        
        if (this.logMessages.length > this.maxMessages) {
            this.logMessages.shift();
        }
        
        this.updateLogUI();
        
        if (this.autoScroll) {
            setTimeout(() => this.scrollLogToBottom(), 50);
        }
        
        this.updateMessageCounter();
        
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        return logEntry;
    }
    
    updateLogUI() {
        const logContainer = document.getElementById('gameLog');
        if (!logContainer) return;
        
        const visibleMessages = this.logMessages.slice(-CONFIG.MAX_VISIBLE_MESSAGES);
        
        logContainer.innerHTML = '';
        
        visibleMessages.forEach(logEntry => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${logEntry.type} slide-in`;
            logElement.innerHTML = `
                <span class="log-time">${logEntry.timeString}</span>
                <span class="log-content">${logEntry.message}</span>
            `;
            logContainer.appendChild(logElement);
        });
    }
    
    scrollLogToBottom() {
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            logContainer.scrollTo({
                top: logContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    
    scrollLogToTop() {
        const logContainer = document.getElementById('gameLog');
        if (logContainer) {
            logContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    setAutoScroll(enabled) {
        this.autoScroll = enabled;
        
        const autoScrollBtn = document.getElementById('autoScrollBtn');
        const logHint = document.getElementById('logHint');
        
        if (autoScrollBtn) {
            autoScrollBtn.textContent = enabled ? '🔽' : '⏸️';
            autoScrollBtn.title = enabled ? 'Auto-scroll ON' : 'Auto-scroll OFF';
        }
        
        if (logHint) {
            logHint.textContent = enabled ? 
                '↓ Auto-scroll ON • Tap log to focus' :
                '⏸️ Auto-scroll OFF • Scroll manually';
        }
        
        if (enabled) {
            this.scrollLogToBottom();
        }
    }
    
    toggleAutoScroll() {
        this.setAutoScroll(!this.autoScroll);
    }
    
    updateMessageCounter() {
        const counter = document.getElementById('logCounter');
        if (counter) {
            counter.textContent = `${this.logMessages.length}/${this.maxMessages}`;
            
            if (this.logMessages.length > this.maxMessages * 0.8) {
                counter.style.color = CONFIG.COLORS.HEALTH;
            } else {
                counter.style.color = '';
            }
        }
    }
    
    clearLog() {
        this.logMessages = [];
        this.updateLogUI();
        this.updateMessageCounter();
        this.addLog("🗑️ Game log cleared", "system");
    }
    
    // =============== UI UPDATES ===============
    
    updateAllUI() {
        this.updateHealthBars();
        this.updateStatsDisplay();
        this.updateEquipmentDisplay();
        this.updateQuestDisplay();
        this.updateCharacterInfo();
        
        if (this.settings.autoSave) {
            setTimeout(() => this.autoSaveGame(), 1000);
        }
    }
    
    updateHealthBars() {
        // Health
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        const healthBar = document.getElementById('healthBar');
        const healthValue = document.getElementById('healthValue');
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
            healthValue.textContent = `${this.player.health}/${this.player.maxHealth}`;
        }
        
        // Mana
        const manaPercent = (this.player.mana / this.player.maxMana) * 100;
        const manaBar = document.getElementById('manaBar');
        const manaValue = document.getElementById('manaValue');
        
        if (manaBar) {
            manaBar.style.width = `${manaPercent}%`;
            manaValue.textContent = `${this.player.mana}/${this.player.maxMana}`;
        }
        
        // XP
        const xpPercent = (this.player.xp / this.player.xpToNext) * 100;
        const xpBar = document.getElementById('xpBar');
        const xpValue = document.getElementById('xpValue');
        
        if (xpBar) {
            xpBar.style.width = `${xpPercent}%`;
            xpValue.textContent = `${this.player.xp}/${this.player.xpToNext}`;
        }
    }
    
    updateStatsDisplay() {
        document.getElementById('charLevel').textContent = this.player.level;
        document.getElementById('goldValue').textContent = this.player.gold.toLocaleString();
        document.getElementById('killsValue').textContent = this.player.kills;
        document.getElementById('locationValue').textContent = this.player.area;
        document.getElementById('gameDayValue').textContent = this.gameDay;
        
        this.updatePlayTime();
    }
    
    updatePlayTime() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000) + this.playTime;
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeString = hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.player.stats.playTime = elapsed;
    }
    
    updateEquipmentDisplay() {
        const equipment = this.player.equipment;
        
        document.getElementById('weaponIcon').textContent = equipment.weapon.icon;
        document.getElementById('weaponName').textContent = equipment.weapon.name;
        
        document.getElementById('skillIcon').textContent = equipment.skill.icon;
        document.getElementById('skillName').textContent = equipment.skill.name;
        
        document.getElementById('armorIcon').textContent = equipment.armor.icon;
        document.getElementById('armorName').textContent = equipment.armor.name;
        
        document.getElementById('accessoryIcon').textContent = equipment.accessory.icon;
        document.getElementById('accessoryName').textContent = equipment.accessory.name;
        
        document.getElementById('potionIcon').textContent = equipment.potion.icon;
        document.getElementById('potionName').textContent = `${equipment.potion.count}x`;
        
        document.getElementById('specialIcon').textContent = equipment.special.icon;
        document.getElementById('specialName').textContent = equipment.special.name;
    }
    
    updateQuestDisplay() {
        const quest = this.player.activeQuest;
        if (!quest) return;
        
        const questTitle = document.getElementById('questTitle');
        const questDesc = document.getElementById('questDesc');
        const questProgress = document.getElementById('questProgress');
        const questProgressText = document.getElementById('questProgressText');
        
        if (questTitle) questTitle.textContent = quest.name;
        if (questDesc) questDesc.textContent = quest.description;
        
        if (questProgress) {
            const progressPercent = (quest.progress / quest.required) * 100;
            questProgress.style.width = `${progressPercent}%`;
        }
        
        if (questProgressText) {
            questProgressText.textContent = `${quest.progress}/${quest.required}`;
        }
    }
    
    updateCharacterInfo() {
        document.getElementById('charName').textContent = this.player.name;
        document.getElementById('charClass').textContent = `${this.player.equipment.weapon.icon} ${this.player.class}`;
    }
    
    updateConnectionStatus(online) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = online ? 
                "🟢 Online • PWA Ready" : 
                "🔴 Offline • Local";
            statusElement.style.color = online ? 
                CONFIG.COLORS.XP : 
                CONFIG.COLORS.HEALTH;
        }
    }
    
    // =============== CHARACTER GRAPHICS ===============
    
    drawCharacter() {
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simplified character
        ctx.fillStyle = '#6C5CE7';
        ctx.fillRect(32, 48, 64, 40); // Body
        
        // Head
        ctx.fillStyle = '#FFEAA7';
        ctx.fillRect(40, 24, 48, 30);
        
        // Eyes
        ctx.fillStyle = '#2D3436';
        ctx.fillRect(48, 36, 8, 8);
        ctx.fillRect(72, 36, 8, 8);
        
        // Weapon
        ctx.fillStyle = '#B2BEC3';
        ctx.fillRect(16, 56, 16, 6);
        ctx.fillRect(12, 48, 24, 20);
        
        // Health-based glow
        const healthPercent = this.player.health / this.player.maxHealth;
        if (healthPercent < 0.3) {
            ctx.shadowColor = CONFIG.COLORS.HEALTH;
            ctx.shadowBlur = 10 + Math.sin(Date.now() / 200) * 5;
            ctx.fillRect(32, 48, 64, 40);
            ctx.shadowBlur = 0;
        }
    }
    
    animateCharacter() {
        const canvas = document.getElementById('characterCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const time = Date.now() / 1000;
        
        // Gentle floating animation
        const floatOffset = Math.sin(time) * 1.5;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(0, floatOffset);
        this.drawCharacter();
        ctx.restore();
    }
    
    // =============== UTILITY FUNCTIONS ===============
    
    vibrate(duration = 50) {
        if (this.settings.vibration && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    playSound(soundId) {
        if (!this.settings.soundEnabled) return;
        console.log(`Playing sound: ${soundId}`);
    }
    
    // =============== SETTINGS MANAGEMENT ===============
    
    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        this.applySettings();
    }
    
    saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    applySettings() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.textContent = this.settings.theme === 'dark' ? '🌙' : '☀️';
        }
        
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.innerHTML = `<span class="menu-icon">${this.settings.soundEnabled ? '🔊' : '🔇'}</span> Sound: ${this.settings.soundEnabled ? 'ON' : 'OFF'}`;
        }
        
        this.setAutoScroll(this.settings.autoScroll);
    }
    
    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.saveSettings();
        this.applySettings();
        this.addLog(`🔊 Sound ${this.settings.soundEnabled ? 'enabled' : 'disabled'}`, "system");
    }
    
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.saveSettings();
        this.applySettings();
        this.addLog(`🎨 Theme: ${this.settings.theme}`, "system");
    }
    
    // =============== SAVE/LOAD SYSTEM ===============
    
    saveGame() {
        const saveData = {
            player: this.player,
            gameDay: this.gameDay,
            streak: this.streak,
            playTime: this.playTime + (this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0),
            lastPlayDate: new Date().toDateString(),
            timestamp: Date.now(),
            version: CONFIG.VERSION
        };
        
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SAVE_DATA, JSON.stringify(saveData));
            this.addLog("💾 Game saved!", "system");
            return true;
        } catch (error) {
            this.addLog("❌ Failed to save", "system");
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            if (!saveData) {
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Load game state
            this.player = data.player;
            this.gameDay = data.gameDay || 1;
            this.streak = data.streak || 0;
            this.playTime = data.playTime || 0;
            this.lastPlayDate = data.lastPlayDate;
            
            this.startTime = Date.now();
            
            this.addLog("📂 Game loaded!", "system");
            
            this.updateAllUI();
            this.drawCharacter();
            
            return true;
        } catch (error) {
            this.addLog("❌ Failed to load", "system");
            return false;
        }
    }
    
    autoSaveGame() {
        if (this.settings.autoSave && this.gameRunning) {
            this.saveGame();
        }
    }
    
    saveCommandHistory() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.COMMAND_HISTORY, JSON.stringify(this.commandHistory));
        } catch (e) {
            console.warn('Failed to save command history:', e);
        }
    }
    
    loadCommandHistory() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.COMMAND_HISTORY);
            if (saved) {
                this.commandHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load command history:', e);
        }
    }
    
    // =============== PUBLIC METHODS ===============
    
    showStats() {
        this.addLog("📊 === PLAYER STATS ===", "system");
        this.addLog(`👤 Name: ${this.player.name}`, "system");
        this.addLog(`🎭 Class: ${this.player.class}`, "system");
        this.addLog(`⭐ Level: ${this.player.level}`, "system");
        this.addLog(`🎯 XP: ${this.player.xp}/${this.player.xpToNext}`, "system");
        this.addLog(`❤️ Health: ${this.player.health}/${this.player.maxHealth}`, "system");
        this.addLog(`🔮 Mana: ${this.player.mana}/${this.player.maxMana}`, "system");
        this.addLog(`🛡️ Armor: ${this.player.armor}/${this.player.maxArmor}`, "system");
        this.addLog(`💰 Gold: ${this.player.gold}`, "system");
        this.addLog(`💎 Soul Shards: ${this.player.soulShards}`, "system");
        this.addLog(`🎖️ Kills: ${this.player.kills}`, "system");
        this.addLog(`📅 Day: ${this.gameDay}`, "system");
        this.addLog(`🔥 Streak: ${this.streak} days`, "system");
        this.addLog(`📍 Location: ${this.player.location} - ${this.player.area}`, "system");
    }
    
    showQuest() {
        const quest = this.player.activeQuest;
        
        if (!quest) {
            this.addLog("❓ No active quest", "system");
            return;
        }
        
        this.addLog("🎯 === ACTIVE QUEST ===", "system");
        this.addLog(`📜 ${quest.name}`, "system");
        this.addLog(`📝 ${quest.description}`, "system");
        this.addLog(`📊 Progress: ${quest.progress}/${quest.required}`, "system");
        this.addLog(`🎁 Reward: ${quest.reward.xp} XP, ${quest.reward.gold} gold`, "system");
        
        if (quest.completed) {
            this.addLog("✅ QUEST COMPLETED!", "xp");
        }
    }
    
    showHelp() {
        this.addLog("❓ === SOUL COMMANDER HELP ===", "system");
        this.addLog("=== BASIC COMMANDS ===", "system");
        this.addLog("⚔️ fight [enemy] - Battle enemy", "system");
        this.addLog("🌲 explore [area] - Explore", "system");
        this.addLog("🧪 heal - Use health potion", "system");
        this.addLog("🛌 rest - Rest to recover", "system");
        this.addLog("🎒 inventory - View inventory", "system");
        this.addLog("📊 stats - Player stats", "system");
        this.addLog("🎯 quest - Active quest", "system");
        this.addLog("🏪 shop - Visit shop", "system");
        this.addLog("=== ADVANCED COMMANDS ===", "system");
        this.addLog("use [item] - Use item", "system");
        this.addLog("equip [item] - Equip weapon/armor", "system");
        this.addLog("buy [number] - Buy from shop", "system");
        this.addLog("save - Save game", "system");
        this.addLog("load - Load game", "system");
        this.addLog("clear - Clear log", "system");
        this.addLog("=== MOBILE TIPS ===", "system");
        this.addLog("• Tap equipment to use", "system");
        this.addLog("• Use quick command chips", "system");
        this.addLog("• Swipe to scroll game", "system");
        this.addLog("• Add to home screen", "system");
    }
    
    exportData() {
        const saveData = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
        
        if (!saveData) {
            this.addLog("❌ No game data to export", "system");
            return;
        }
        
        // Create download
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `soul_commander_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.addLog("📤 Game data exported!", "system");
    }
    
    resetGame() {
        if (confirm("Reset game? All progress will be lost!")) {
            this.initializeGameState();
            this.gameDay = 1;
            this.streak = 0;
            this.playTime = 0;
            this.startTime = Date.now();
            this.logMessages = [];
            this.commandHistory = [];
            
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SAVE_DATA);
            
            this.addLog("🔄 Game reset!", "system");
            this.addLog("🌟 New adventure begins...", "system");
            
            this.updateAllUI();
            this.drawCharacter();
            this.updateCommandHistoryDisplay();
        }
    }
}

// =============== GLOBAL INITIALIZATION ===============

let soulCommanderGame = null;

function initSoulCommander() {
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        const loadingBar = document.getElementById('loadingBar');
        if (loadingBar) {
            loadingBar.style.width = `${progress}%`;
        }
        
        const tips = [
            "Initializing...",
            "Loading realms...",
            "Charging system...",
            "Preparing...",
            "Almost ready..."
        ];
        const loadingTip = document.getElementById('loadingTip');
        if (loadingTip && progress % 20 < 5) {
            loadingTip.textContent = tips[Math.floor(progress / 20)];
        }
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    if (gameContainer) {
                        gameContainer.style.display = 'flex';
                    }
                    
                    soulCommanderGame = new SoulCommanderGame();
                    soulCommanderGame.startGame();
                    
                    const commandInput = document.getElementById('commandInput');
                    if (commandInput) {
                        commandInput.focus();
                    }
                }, 500);
            }
        }
    }, 150);
}

// Global helper functions
function executeCommand() {
    if (soulCommanderGame) {
        soulCommanderGame.executeCommand();
    }
}

function handleCommandKey(event) {
    if (soulCommanderGame) {
        soulCommanderGame.handleCommandKey(event);
    }
}

function quickCommand(command) {
    if (soulCommanderGame) {
        document.getElementById('commandInput').value = command;
        executeCommand();
    }
}

function useEquipment(slot) {
    if (soulCommanderGame) {
        if (slot === 'potion') {
            soulCommanderGame.usePotion();
        } else {
            soulCommanderGame.addLog(`${soulCommanderGame.player.equipment[slot].icon} ${slot} activated!`, "system");
        }
    }
}

function clearGameLog() {
    if (soulCommanderGame) {
        soulCommanderGame.clearLog();
    }
}

function saveGame() {
    if (soulCommanderGame) {
        soulCommanderGame.saveGame();
    }
}

function loadGame() {
    if (soulCommanderGame) {
        soulCommanderGame.loadGame();
    }
}

function toggleSound() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleSound();
    }
}

function toggleTheme() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleTheme();
    }
}

function toggleAutoScroll() {
    if (soulCommanderGame) {
        soulCommanderGame.toggleAutoScroll();
    }
}

function scrollLogToTop() {
    if (soulCommanderGame) {
        soulCommanderGame.scrollLogToTop();
    }
}

function resetGame() {
    if (soulCommanderGame) {
        soulCommanderGame.resetGame();
    }
}

function exportData() {
    if (soulCommanderGame) {
        soulCommanderGame.exportData();
    }
}

function showHelp() {
    if (soulCommanderGame) {
        soulCommanderGame.showHelp();
    }
}

// Menu functions
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

function toggleFullscreen() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// Modal functions
function showMobileTips() {
    const modal = document.getElementById('mobileTipsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showKeyboardHelp() {
    alert("Keyboard Shortcuts:\n\n↑/↓ - Command history\nTab - Auto-complete\nEnter - Execute\nEsc - Blur input");
}

function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'Soul Commander',
            text: 'Check out this pixel command RPG game!',
            url: window.location.href
        });
    } else {
        alert('Share URL: ' + window.location.href);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initSoulCommander);

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    });
}

// Export for debugging
window.soulCommander = soulCommanderGame;
window.game = soulCommanderGame;