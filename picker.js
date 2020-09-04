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
