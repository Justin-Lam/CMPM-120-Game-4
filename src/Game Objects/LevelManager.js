class LevelManager
{
	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y) 
	{
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.floorLayerArray = this.scene.add.group();
    }

    /** @param {number} delta */
	update(delta)
	{

	}

	load() { // to do: decide how to handle layers, a different load func per layer?
		for (let x = 0; x < this.scene.mapSize; x++) {
			for (let y = 0; y < this.scene.mapSize; y++) // Go through each tile position on map grid
			{
				// to do: change tilex and tiley code to section assignment ver that gives u the x and y tile by tile
				let tileX = (this.x * (this.scene.mapSize * this.scene.tileSize)) + (x * this.scene.tileSize);
				let tileY = (this.y * (this.scene.mapSize * this.scene.tileSize)) + (y * this.scene.tileSize);
				
				// to do: add perlin noise library OR create own version
				let perlinValue = noise.perlin2(tileX / 100, tileY / 100);
				let key = "";

				// to do: get tile keys
				if (perlinValue < 0.2) {
					key = “sprWater”;
					animationKey = “sprWater”;
				}
				else if (perlinValue >= 0.2 && perlinValue < 0.3) {
					key = “sprSand”;
				}
				else if (perlinValue >= 0.3) {
					key = “sprGrass”;
				}

				// to do: use Tiled instead of custom Tile class or just make custom Tile class
				var tile = new Tile(this.scene, tileX, tileY, key);
				this.tiles.add(floorLayerArray);
			}
		}
	}
}