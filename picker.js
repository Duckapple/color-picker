function debounce(func, wait, immediate) {
	let timeout;
	return function() {
		const context = this, args = arguments;
		const later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

const extract = (input) => {
    const regex = /(#[\dA-Fa-f]{3,8})|(rgba?\(.*\))|(hsla?\(.*\))/g;
    const result = input.match(regex);
    let trimmed = [];
    result.forEach(e => !trimmed.includes(e) && trimmed.push(e));
    return trimmed;
}

const renderColor = (color) => {
    const el = document.createElement('div');
    el.className = 'color-block';
    const col = document.createElement('div');
    col.className = 'color';
    col.setAttribute('style', `background: ${color}`);
    el.appendChild(col);
    el.appendChild(document.createTextNode(color));
    return el;
}

const input = document.getElementById('query');
const colors = document.getElementById('colors');
const reduce = document.getElementById('reduce');
const convert = document.getElementById('convert');
const dark = document.getElementById('dark-mode');
const light = document.getElementById('light-mode');
let lastColorsText = '';
let lastColors = [];

/** 
 * @type {(e: Event) => void} 
 */
const onChange = debounce((e) => {
    let newColors = extract(e.target.value);
    const joined = newColors.join();
    if (joined === lastColorsText) return;
    colors.innerHTML = '';
    newColors.forEach(e => colors.appendChild(renderColor(e)));
    lastColorsText = joined;
    lastColors = newColors;
}, 200);

input.addEventListener('keyup', onChange);
reduce.addEventListener('click', () => input.value = lastColorsText);
dark.addEventListener('click', () => {
    document.body.classList.add('dark');
    dark.classList.add('disabled');
    light.classList.remove('disabled');
});
light.addEventListener('click', () => {
    document.body.classList.remove('dark');
    light.classList.add('disabled');
    dark.classList.remove('disabled');
});
onChange({target: input});

convert.addEventListener('click', () => {
    for (const colorBlockElement of document.querySelectorAll('.color-block:not(.converted)')) {
        // Fix first child
        const oldDiv = document.createElement('div');
        oldDiv.className = 'flex-col';
        oldDiv.appendChild(colorBlockElement.firstChild);
        oldDiv.appendChild(colorBlockElement.firstChild);
        colorBlockElement.appendChild(oldDiv);
        colorBlockElement.classList.add('converted');

        const arrow = document.createElement('span');
        arrow.innerText = '➡️';
        colorBlockElement.appendChild(arrow);

        const newColorName = closestTailwindColor(oldDiv.innerText);
        const newColor = tailwindColors[newColorName].length < oldDiv.innerText.length
            ? tailwindColors[newColorName] + oldDiv.innerText.slice(7)
            : tailwindColors[newColorName];
        const renderedColor = renderColor(newColor);
        renderedColor.className = 'flex-col';
        colorBlockElement.appendChild(renderedColor);
    }
})

const colorCache = {};

const tailwindColorEntries = Object.entries(tailwindColors).map(([k, v]) => [k, rgbOf(v)]);

function closestTailwindColor(inputColor) {
    if (colorCache[inputColor]) return colorCache[inputColor];
    const inColorSplit = rgbOf(inputColor);
    const closest = { name: undefined, distance: Infinity };
    for (const [colorName, colorValue] of tailwindColorEntries) {
        const d = distance(inColorSplit, colorValue);

        if (d < closest.distance) {
            closest.distance = d;
            closest.name = colorName;
        }
    }
    colorCache[inputColor] = closest.name;
    return closest.name;
}

function rgbOf(color) {
    const rgba = /rgba?\((\d+)[\s,]+(\d+)[\s,]+(\d+).*?\)/.exec(color);
    if (rgba) {
        return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])];
    }
    const hsla = /hsla?\((\d+)[\s,]+(\d+)[\s,]+(\d+).*?\)/.exec(color);
    if (hsla) {
        // TODO lmao not doing it now
        return []
    }
    const RRGGBB = /#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color);
    if (RRGGBB) {
        return [parseInt(RRGGBB[1], 16), parseInt(RRGGBB[2], 16), parseInt(RRGGBB[3], 16)]
    }
}

function distance([r, g, b], [twR, twG, twB]) {
    return Math.abs(r - twR) + Math.abs(g - twG) + Math.abs(b - twB)
}
