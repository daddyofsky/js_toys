/**
 * Pairs memory game
 */
class Pairs {
	levelInfo = {
		1 : { col: 3, row: 2, previewTime: 1000 },
		2 : { col: 4, row: 4, previewTime: 3000 },
		3 : { col: 6, row: 5, previewTime: 5000 },
	}

	constructor(container, level = 0) {
		this.onGame = false;
		this.ignoreAction = false;
		this.level = level;
		this.size = 100;

		this.container = $(container);

		if (level) {
			this.setLevel(this.level);
		}
	}

	/**
	 * start game
	 */
	async start() {
		if (this.onGame) {
			return;
		}

		this.onGame = true;
		this.initContainer();
		await this.preview();

		return new Promise((resolve) => {
			let timer = setInterval(_ => {
				if (!this.onGame) {
					clearInterval(timer);
					resolve();
				}
			}, 500);
		});
	}

	end() {
		this.delay(500).then(_ => {
			this.onGame = false;
			//alert('END');
		});
	}

	isOnGame() {
		return this.onGame;
	}

	setLevel(level) {
		if (this.onGame) {
			return;
		}

		const { col, row, previewTime } = this.levelInfo[level] || this.levelInfo[1];

		this.col = parseInt(col, 10) || 3;
		this.row = parseInt(row, 10) || 2;
		this.previewTime = parseInt(previewTime, 10) || 1000;
		this.count = this.col * this.row;
		if (this.count % 2) {
			this.row++;
			this.count = this.col * this.row;
		}
		this.itemCount = this.count / 2;

		$(this.container)
			.css({
				grid: `repeat(${this.row}, ${this.size}px) / repeat(${this.col}, ${this.size}px)`,
			});

		this.initContainer();
	}

	initContainer() {
		this.prev = null;
		this.foundCount = 0;
		this.items = this.getItems(this.itemCount);

		this.container.html('');
		this.items.forEach((item) => {
			this.container.append(item.getItem());
		});
	}

	async preview() {
		this.ignoreAction = true;

		for (let i=0; i<this.items.length; i++) {
			await this.delay(50);
			this.items[i].show();
		}

		await this.delay(this.previewTime);

		for (let i=0; i<this.items.length; i++) {
			await this.delay(50);
			this.items[i].hide();
		}
		this.ignoreAction = false;
	}

	getItems(itemCount) {
		const items = [];
		for (let i = 1; i <= itemCount; i++) {
			items.push(new PairItem(i, i, this));
			items.push(new PairItem(i, i, this));
		}

		return this.shuffle(items);
	}

	shuffle(array) {
		return array
			.map((item) => {
				item.random = Math.random();
				return item;
			})
			.sort((a, b) => a.random - b.random);
	}

	onClick(item) {
		if (!this.onGame || this.ignoreAction) {
			return;
		}

		item.setSelect();

		if (!this.prev) {
			this.prev = item;
			return;
		}

		const prev = this.prev;
		if (prev === item) {
			return;
		}

		this.prev = null;
		if (prev.id === item.id) {
			this.foundCount++;
			this.delay(500).then(_ => {

				prev.setFound();
				item.setFound();

				if (this.foundCount === this.itemCount - 1) {
					this.items.forEach(item => {
						item.setFound();
					});
					this.foundCount++;
					this.end();
				}
			});

			if (this.foundCount >= this.itemCount) {
				this.end();
			}
			return;
		}

		this.ignoreAction = true;
		this.delay(1000).then(_ => {
			prev.hide();
			item.hide();
			this.ignoreAction = false;
		});
	}

	delay(delay) {
		return new Promise((resolve) => {
			setTimeout(_ => {
				resolve();
			}, delay)
		});
	}
}

/**
 * Pair item
 */
class PairItem {
	constructor(id, content, controller) {
		this.id = id;
		this.content = content;
		this.controller = controller;
		this.item = this.initItem();
		this.found = false;
		this.hide();
	}

	initItem() {
		const item = $(`<div class="pair-item"></div>`)
			.data('id', this.id)
			.on('click', () => {
				if (this.found) {
					// do nothing
					return;
				}
				this.controller.onClick(this);
			});
		item.content = $(`<div class="pair-item-inner"><div class="pair-item-content">${this.content}</div><div class="pair-item-back"></div></div>`).appendTo(item);

		return item;
	}

	getItem() {
		return this.item;
	}

	setFound() {
		this.found = true;
		$(this.item.content).removeClass('select flip').addClass('found');
	}

	setSelect() {
		$(this.item.content).removeClass('flip').addClass('select');
	}

	show() {
		//this.item.content.show();
		$(this.item.content).removeClass('flip');
	}

	hide() {
		//this.item.content.hide();
		$(this.item.content).removeClass('select').addClass('flip');
	}
}