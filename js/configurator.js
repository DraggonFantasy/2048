// TODO: Make code style uniform?

var ConfigDefaults =
{
	FIELD_SIZE: 500,
	CELL_SIZE: 106.25,
	TILE_SIZE: 107,
	GRID_SPACING: 15,
}

function Config()
{
	this.fieldSize = ConfigDefaults.FIELD_SIZE;

	this.tileBackgrounds = [];
	this.tileValues = [];
	this.background = "";
    this.gridBackground = "";
	this.customCssRules = [];
	
	this.setupUI();
}

Config.prototype.setFieldSize = function(size)
{
	this.fieldSize = size;
};

Config.prototype.setCellSize = function(size)
{
	this.fieldSize = ConfigDefaults.FIELD_SIZE * size / ConfigDefaults.CELL_SIZE; // Scale field size proportionally
};


/**
 * Sets background for the certain tile
 * @param tile Tile number (2, 4, 8, 16 etc)
 * @param css CSS value of background
 */
Config.prototype.setTileBackground = function(tile, css)
{
	// TODO: Add range checks etc
	this.tileBackgrounds[tile] = css;
};

/**
 * Sets displayed text for the certain tile
 * @param tile Tile number (2, 4, 8, 16 etc)
 * @param css Text to be displayed
 */
Config.prototype.setTileValue = function(tile, value)
{
	var tileNumber;
	if(typeof(tile) == "number")
	{
		tileNumber = tile;
	} else
	{
		tileNumber = tile.value;
	}
	this.tileValues[tileNumber] = value;	
};

/**
 * Sets the background of the page
 * @param css CSS value of background
 */
Config.prototype.setBackground = function(css)
{
	this.background = css;	
};

Config.prototype.setGridBackground = function(css)
{
    this.gridBackground = css;
};


Config.prototype.setCustomCss = function(css)
{
	this.customCssRules = this.splitCssRules(css);	
};

Config.prototype.splitCssRules = function(css)
{
	// TODO: Implement a smarter version of the function with nesting levels considered if this doesn't cover most situations
	// We define a rule here as something from start to '}' char or something from '}' to next '}'
	
	var rules = [];
	
	var rule = "";
	var nestingLevel = 0;
	for(var i = 0; i < css.length; ++i)
	{
		var char = css[i];
		rule += char; // In modern browsers, performance is OK for string concatenation
		if(char == "}")
		{
			rules.push(rule);
			rule = "";
		}
	}
	
	return rules;

};


Config.prototype.getBackground = function()
{
	return this.background;
};

Config.prototype.getGridBackground = function()
{
    return this.gridBackground;
};


Config.prototype.getCellSize = function()
{
	return ConfigDefaults.CELL_SIZE * this.fieldSize / ConfigDefaults.FIELD_SIZE; // Get cell size by proportion
};

Config.prototype.getCustomCss = function()
{
	return this.customCss;
};

Config.prototype.getFieldSize = function()
{
	return this.fieldSize;
};

Config.prototype.getTileBackground = function(tile)
{
	return this.tileBackgrounds[tile];
};

Config.prototype.getTileValue = function(tile)
{
	var tileNumber;
	if(typeof(tile) == "number")
	{
		tileNumber = tile;
	} else
	{
		tileNumber = tile.value;
	}

	if( this.tileValues[tileNumber] != undefined )
	{
		return this.tileValues[tileNumber];
	} else
	{
		return tileNumber;
	}
};


/**
 * Inserts rule to CSS stylesheet.
 * @param stylesheetIndex Index of stylesheet to add rule to
 * @param rule CSS rule
 * @returns Index of added rule
 */
Config.prototype.insertRule = function(rule)
{
	var index = document.styleSheets[0].cssRules.length;
	document.styleSheets[0].insertRule(rule, index);

	return index;
};

/**
 * Applies settings to web-page. Note: It DOESN'T remove previous CSS rules
 */
Config.prototype.apply = function()
{
	// TODO: Replace old rules instead of adding new ones
	this.applyFieldSize();
	this.applyTiles();
	this.applyCustomCss();
	this.applyOthers();
};

Config.prototype.applyFieldSize = function()
{
	var size = this.getFieldSize();
	var cellSize = this.getCellSize();
	var tileSize = Math.ceil(cellSize);
	var spacing = ConfigDefaults.GRID_SPACING;

	this.insertRule(".game-container, .container {width: " + size + "px; height: " + size + "px;}");
	this.insertRule(".grid-container {width: " + (size - 2*spacing) + "px; height: " + (size - 2*spacing) +"px;}");
	this.insertRule(".grid-cell {width: " + cellSize +"px; height: "+ cellSize +"px;}");
	this.insertRule(".tile, .tile .tile-inner {width: " + tileSize + "px; height: " + tileSize + "px; line-height: " + tileSize + "px}");
};

Config.prototype.applyTiles = function()
{
	var cellSize = this.getCellSize();
	this.tileBackgrounds.forEach( function(item, i)
	{
		this.insertRule(".tile.tile-" + i +" .tile-inner {background: " + item + "; background-size: " + cellSize + "px " + cellSize + "px;}");
	}, this);

	for(var i = 0; i < 4; ++i)
	{
		for(var j = 0; j < 4; ++j)
		{
			 var x = Math.floor((cellSize + ConfigDefaults.GRID_SPACING) * i);
			 var y = Math.floor((cellSize + ConfigDefaults.GRID_SPACING) * j);
			 this.insertRule(".tile.tile-position-" + (i+1) + "-" + (j+1) + "{ transform: translate(" + x + "px, " + y +"px); }");
		}
	}

	var tileContainer = document.querySelector(".tile-container");
	for(var tile = 2; tile <= 2048; tile *= 2)
	{
		for (var i = 0, len = tileContainer.children.length; i < len; i++)
		{
			var child = tileContainer.children[i];
			if( this.tileValues[tile] != undefined && child.classList.contains("tile-" + tile) )
			{
				child.querySelector(".tile-inner").textContent = this.tileValues[tile];
			}
		}
	}
};

Config.prototype.applyCustomCss = function()
{
	for (var i = 0, len = this.customCssRules.length; i < len; i++)
	{
		this.insertRule( this.customCssRules[i] );
	}
};


Config.prototype.applyOthers = function()
{
	this.insertRule("html,body {background: " + this.background + ";}");
    this.insertRule(".game-container {background: " + this.gridBackground + ";}");
};

Config.prototype.setupUI = function()
{
	var customizeButton = document.querySelector(".customize-button");
	var customizeWindow = document.querySelector(".game-customization");
	customizeButton.onclick = function()
	{
		var display = customizeWindow.style.display;
		if(display != "none")
		{
			customizeWindow.style.display = "none";
		} else
		{
			customizeWindow.style.display = "block";
		}
	}
	
	var customizeApply = document.getElementById("customize-apply");
	customizeApply.onclick = this.uiApply.bind(this);
	
	var customizeCssApply = document.getElementById("custom-css-apply");
	customizeCssApply.onclick = this.uiApplyCustomCss.bind(this);
	
	var customizeFixTiles = document.getElementById("custom-fix-tile-backgrounds");
	customizeFixTiles.onclick = this.uiFixTileBackgrounds.bind(this);

};

Config.prototype.uiApply = function()
{
	var fieldSize = document.getElementById("custom-field-size").value;
	var background = document.getElementById("custom-page-background").value;
	var gridBackground = document.getElementById("custom-grid-background").value;

	this.setFieldSize( fieldSize );
	if(background != "") this.setBackground( background );
	if(gridBackground != "") this.setGridBackground( gridBackground );

	for(var tile = 2; tile <= 2048; tile *= 2)
	{
		var background = document.getElementById("custom-tile-back-" + tile).value;
		var value = document.getElementById("custom-tile-value-" + tile).value;
		
		if( background != "" )
		{
			if( background.startsWith("http") || background.startsWith("file") )
			{
				this.setTileBackground(tile, "url(" + background + ")");
			} else
			{
				this.setTileBackground(tile, background);
			}
		}

		this.setTileValue(tile, value);
	}
	this.apply();
};

Config.prototype.uiApplyCustomCss = function()
{
	var css = document.getElementById("custom-css").value;
	if(css == "") return;
	
	this.setCustomCss( css );
	this.applyCustomCss();
};

Config.prototype.uiFixTileBackgrounds = function()
{
	var tileSize = Math.ceil(this.getCellSize());
	for(var i = 2; i < 2048; ++i)
	{
		this.insertRule(".tile.tile-" + i +" .tile-inner {background-color: transparent; background-size: " + tileSize +"px " + tileSize + "px;}");
	}
};

