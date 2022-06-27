/**
 * Pairs memory game
 */
class Pairs {
	constructor(container, option) {
		this.ignoreAction = false;
		this.option       = Object.assign({
			col: 5,
			row: 4,
			size: 100,
		}, option || {});

		this.col = parseInt(this.option.col, 10) || 5;
		this.row = parseInt(this.option.row, 10) || 4;
		this.count = this.col * this.row;
		if (this.count % 2) {
			this.row++;
			this.count = this.col * this.row;
		}
		this.itemCount = this.count / 2;

		this.size = parseInt(this.option.size, 10) || 100;

		this.container = $(container)
			.css({
				grid: `repeat(${this.row}, ${this.size}px) / repeat(${this.col}, ${this.size}px)`,
			});

		this.start();
	}

	/**
	 * start game
	 */
	start() {
		console.log('start');
		this.items = [];
		this.prev = null;
		this.foundCount = 0;

		this.initContainer();
		this.preview();
	}

	end() {
		console.log('END');
		this.delay(1000).then(_ => {
			alert('END');
		});
	}

	initContainer() {
		this.items = this.getItems(this.itemCount);
		console.log(this.items, this.itemCount);

		this.container.html('');
		this.items.forEach((item) => {
			this.container.append(item.getItem());
		});
	}

	async preview() {
		const timeout = 3000;
		this.ignoreAction = true;

		for (let i=0; i<this.items.length; i++) {
			await this.delay(50);
			this.items[i].show();
		}

		await this.delay(timeout);

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
		if (this.ignoreAction) {
			console.log('block');
			return;
		}

		console.log(item, this.prev);
		item.setSelect();

		if (!this.prev) {
			this.prev = item;
			return;
		}

		const prev = this.prev;
		if (prev === item) {
			console.log('same');
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