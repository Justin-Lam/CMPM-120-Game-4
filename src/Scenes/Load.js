class Load extends Phaser.Scene
{
	constructor() {
		super('loadScene')
	}

	preload()
	{
		// Set load path
		this.load.path = './assets/';

		// Load bird spritesheets
		this.load.spritesheet('duck_spritesheet', 'duck_spritesheet.png', {
			frameWidth: 50, frameHeight: 50
		});
		this.load.spritesheet('poopybird_spritesheet', 'poopybird_spritesheet.png', {
			frameWidth: 50, frameHeight: 50
		});
		this.load.spritesheet('roadrunner_spritesheet', 'roadrunner_spritesheet.png', {
			frameWidth: 50, frameHeight: 50
		});
		this.load.spritesheet('player_spritesheet', 'player_spritesheet.png', {
			frameWidth: 32, frameHeight: 32
		});

		// Load title screen stuff
		this.load.image("Title", "Title_temp.png");
		this.load.image("Start Game Button", "Start Game Button_temp.png");
		this.load.audio("Button Press", "Button Press.wav");
		this.load.audio("Title Screen", "Title Screen_temp.mp3");

		// Load starting area stuff
		this.load.image("Door", "Door_temp.png");
		this.load.audio("Door", "Door_temp.mp3");
		this.load.audio("Lab", "Lab_temp.mp3");

		// Load player stuff
		this.load.image("Player", "Player_temp.png");
		this.load.image("Net Swipe", "net_swipe.png");
		this.load.image("Net Swipe 2", "net_swipe2.png");
		this.load.image("Net Swipe 3", "net_swipe3.png");
		this.load.image("Bread", "loaf.png");
		this.load.audio("Net", "Net.mp3");
		this.load.audio("Bread", "Bread.mp3");
		this.load.audio("Dash", "Dash.mp3");
		this.load.audio("Player Damaged", "Player Damaged.wav");
		this.load.audio("Player Death", "Player Death.wav");

		// Load bird stuff
		this.load.image("Enemy Poop", "bird_poo.png");
		this.load.image("Bird Swipe", "roadrunner_swipe.png");
		this.load.audio("Bird Pacified", "Bird Pacified.wav");
		this.load.audio("duck_quack", "duck_quack.mp3");
		this.load.audio("roadrunner_attack", "roadrunner_attack.mp3");
		this.load.audio("roadrunner_run", "roadrunner_run.mp3");

		// Load dungeon stuff
		this.load.image("Upgrade Frame", "Upgrade Frame_temp.png");
		this.load.audio("Level Complete", "Level Complete.mp3");
		this.load.audio("Dungeon Screen Change", "Dungeon Screen Change.mp3");
		this.load.audio("Dungeon", "Dungeon_temp.mp3");

		// Load map tilesets
		this.load.image("urban_tiles", "urban_tilemap_packed_bigger.png"); 
		this.load.image("rpg_tiles", "roguelikeSheet_transparent.png"); 
		this.load.image("rpg_tiles_bigger", "roguelikeSheet_transparent_bigger.png"); 
		this.load.image("shmup_tiles", "shmup_tiles_packed.png"); 
		this.load.image("town_tiles", "town_tilemap_packed.png"); 

		// Custom merged tilesets
		this.load.image("floor_tiles", "flooring_tileset.png"); 
		this.load.image("decor_tiles", "decor_tileset.png"); 
		this.load.image("collide_tiles", "collidables_spritesheet.png"); 

		this.load.tilemapTiledJSON("basic-level-alt", "basic-level-alt.tmj");
		this.load.tilemapTiledJSON("starting-area", "starting_area_alt.tmj");
	}

	create()
	{
		//player animations
		this.anims.create({
            key: 'idle',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "player_spritesheet", frame: 1 }
            ]
        });
		this.anims.create({
            key: 'walk_down',
			frameRate: 4,
			repeat: -1,
            frames: [
                { key: "player_spritesheet", frame: 1 },
				{ key: "player_spritesheet", frame: 5 }
            ]
        });
		this.anims.create({
            key: 'walk_up',
			frameRate: 4,
			repeat: -1,
            frames: [
                { key: "player_spritesheet", frame: 2 },
				{ key: "player_spritesheet", frame: 6 }
            ]
        });
		this.anims.create({
            key: 'walk_left',
			frameRate: 8,
			repeat: -1,
            frames: [
                { key: "player_spritesheet", frame: 0 },
				{ key: "player_spritesheet", frame: 4 }
            ]
        });
		this.anims.create({
            key: 'walk_right',
			frameRate: 8,
			repeat: -1,
            frames: [
                { key: "player_spritesheet", frame: 3 },
				{ key: "player_spritesheet", frame: 7 }
            ]
        });

		//duck animations
		this.anims.create({
            key: 'enemy1_idle',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "duck_spritesheet", frame: 0 },
				{ key: "duck_spritesheet", frame: 1 }
            ]
        });
		this.anims.create({
            key: 'enemy1_attack',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "duck_spritesheet", frame: 2 },
				{ key: "duck_spritesheet", frame: 2 }
            ]
        });
		this.anims.create({
            key: 'enemy1_hurt',
			frameRate: 2,
			repeat: -1,
            frames: [
                { key: "duck_spritesheet", frame: 3 }
            ]
        });

		//poopybird animations
		this.anims.create({
            key: 'enemy2_idle',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "poopybird_spritesheet", frame: 0 },
				{ key: "poopybird_spritesheet", frame: 1 }
            ],
			delay: 25
        });
		this.anims.create({
            key: 'enemy2_attack',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "poopybird_spritesheet", frame: 2 },
				{ key: "poopybird_spritesheet", frame: 3 }
            ]
        });
		this.anims.create({
            key: 'enemy2_hurt',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "poopybird_spritesheet", frame: 4 }
            ]
        });
		
		//roadrunner animations
		this.anims.create({
            key: 'enemy3_idle',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "roadrunner_spritesheet", frame: 0 }
            ]
        });
		this.anims.create({
            key: 'enemy3_charge',
			frameRate: 9,
			repeat: -1,
            frames: [
                { key: "roadrunner_spritesheet", frame: 1 },
				{ key: "roadrunner_spritesheet", frame: 2 },
				{ key: "roadrunner_spritesheet", frame: 3 }
            ]
        });
		this.anims.create({
            key: 'enemy3_attack',
			frameRate: 10,
			repeat: -1,
            frames: [
                { key: "roadrunner_spritesheet", frame: 4 },
				{ key: "roadrunner_spritesheet", frame: 5 }
            ]
        });
		this.anims.create({
            key: 'enemy3_hurt',
			frameRate: 1,
			repeat: -1,
            frames: [
                { key: "roadrunner_spritesheet", frame: 6 }
            ]
        });

		// Start the first scene
		this.scene.start("titleScreenScene");
	}
}