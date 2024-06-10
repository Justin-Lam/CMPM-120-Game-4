class MapGen
{
    mapWidth = 120;
    mapHeight = 68; // In tiles

    treeBaseLayer;
    collideLayer;

    TILES = 
    {
        FLOOR: [
            {index: 0, weight: 2.5},
            {index: 1, weight: 2.5},
            {index: 2, weight: 3},
            {index: 3, weight: 1},
            //{index: 4, weight: 0.5},
        ],
        DECOR: [
            {index: 0, weight: 0.2},
            {index: 1, weight: 0.1},
            {index: 2, weight: 0.1},
            {index: 3, weight: 0.1},
            {index: 4, weight: 0.1},
            {index: 5, weight: 0.1},
            {index: 6, weight: 0.3},
            {index: 7, weight: 10},
        ],
        COLLIDES: [
            {index: 1, weight: 0.2},
            //{index: 2, weight: 0.1},
            {index: 3, weight: 30},
        ],
        TREE_BORDERS: [
            {}
        ],
    } // Contains information on what each layer's possible tile images are along with weight (likelihood of being chosen)

    constructor(scene) 
    {
        this.scene = scene;
    }

    create()
	{
        if (this.map != undefined)
        {
            this.map.destroy();
        }

        if (this.mapTree != undefined)
        {
            this.mapTree.destroy();
        }

        // Create a blank tilemap
        this.map = this.scene.make.tilemap({tileWidth: 16, tileHeight: 16, width: this.mapWidth, height: this.mapHeight});

        this.generateFloor();
        this.generateDecor(); 
        this.generateCollidables();
        this.generateTreeBorder();
        //this.mergeMaps();
        //console.log(this.scene);
    }

    generateFloor() 
    {
        this.floorTileset = this.map.addTilesetImage("flooring-tileset", "floor_tiles");
        // Make layer with tileset lists
        this.floorLayer = this.map.createBlankLayer('Floor', this.floorTileset);
        // this.floorLayer = this.map.createLayer('Floor', this.tilesetList);
        this.floorLayer.setScale(SCALE);

        // From Phaser docs: The probability of any index being picked is (the indexs weight) / (sum of all weights)
        // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
        // See "Weighted Randomize" example for more information on how to use weightedRandomize.
        this.map.weightedRandomize(this.TILES.FLOOR, 0, 0, this.mapWidth, this.mapHeight, 'Floor');
        this.floorLayer.depth = 1;
    }

    generateDecor() 
    {
        this.decorTileset = this.map.addTilesetImage("decor", "decor_tiles");
        this.decorLayer = this.map.createBlankLayer('Decor', this.decorTileset);
        // this.decorLayer = this.map.createLayer('Decor', this.tilesetList);
        this.decorLayer.setScale(SCALE);
        this.map.weightedRandomize(this.TILES.DECOR, 0, 0, this.mapWidth, this.mapHeight, 'Decor');
        this.decorLayer.depth = 2;
    }

    generateCollidables() 
    {
        this.collideTileset = this.map.addTilesetImage("collidables", "collide_tiles");
        this.collideLayer = this.map.createBlankLayer('Collide', this.collideTileset);
        // this.collideLayer = this.map.createLayer('Collide', this.tilesetList);
        this.collideLayer.setScale(SCALE * 1.5);
        this.map.weightedRandomize(this.TILES.COLLIDES, 0, 0, this.mapWidth, this.mapHeight, 'Collide');
        this.collideLayer.setCollisionByExclusion([-1], true);
        this.collideLayer.depth = 7;
    }

    generateTreeBorder() 
    {
        let val = Phaser.Math.Between(1, 3);
        let mapType = "";

        if (val == 1)
        {
            mapType = "tree_border1";
        }
        else if (val == 2)
        {
            mapType = "tree_border2";
        }
        else if (val == 3)
        {
            mapType = "tree_border3";
        } // Randomized tree configuration from 3 options

        //console.log(mapType);
        this.mapTree = this.scene.add.tilemap(mapType, 16, 16, this.mapWidth, this.mapHeight);

        this.treeTileset = this.mapTree.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles");
        //this.map.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles");


        // Make layers
        this.treeBaseLayer = this.mapTree.createLayer("Tree-base", this.treeTileset);
        this.treeBaseLayer.setScale(SCALE);
        this.treeBaseLayer.depth = 10; // depth = rendering order
        this.treeDecorLayer = this.mapTree.createLayer("Tree-decor", this.treeTileset);
        this.treeDecorLayer.setScale(SCALE);
        this.treeDecorLayer.depth = 11;
        this.treeEdgeLayer = this.mapTree.createLayer("Tree-edge", this.treeTileset);
        this.treeEdgeLayer.setScale(SCALE);
        this.treeEdgeLayer.setAlpha(0.75);
        this.treeEdgeLayer.depth = 12;

        if (val == 1)
        {
            this.treeBaseLayer.setTint(0x204b1e);
            this.treeDecorLayer.setTint(0x377e32);
            this.treeEdgeLayer.setTint(0x74aa71);
        }
        else if (val == 2)
        {
            this.treeBaseLayer.setTint(0x494b22);
            this.treeDecorLayer.setTint(0x577e33);
            this.treeEdgeLayer.setTint(0x9daa6c);
        }
        else if (val == 3)
        {
            this.treeBaseLayer.setTint(0x244798);
            this.treeDecorLayer.setTint(0x2477f5);
            this.treeEdgeLayer.setTint(0x4292c7);
        }

        this.treeBaseLayer.setCollisionByExclusion([-1], true);
    }
}