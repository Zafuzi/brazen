/*
Copyright 2015-2020 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

// Replaces instances of "__key__" in string s,
// with the values from corresponding key in data.
let substitute = function (s: string, data: any) {
	for (let key in data) {
		let re = new RegExp("__" + key + "__", "g");
		s = s.replace(re, "" + data[key]);
	}
	return s;
};

// Injects data values into a single DOM element
let inject = function (e: HTMLElement, data: any) {
	// Inject into the body of the element
	e.innerHTML = substitute(e.innerHTML, data);

	// Inject into the attributes of the actual tag of the element.
	// Do this slightly differently for IE because IE is stupid.
	// XXX Do I still have to do this? Isn't IE dead yet?
	let attrs = e.attributes;
	if (navigator.appName == "Microsoft Internet Explorer") {
		for (let k in attrs) {
			let val = e.getAttribute(k);
			if (val) {
				if (typeof val === "string") {
					if (val.match(/__/)) {
						val = substitute(val, data);
						e.setAttribute(k, val);
					}
				}
			}
		}
	} else {
		for (let i = 0; i < attrs.length; i++) {
			let attr = attrs[i];
			let val = attr.value;
			if (val) {
				if (typeof val === "string") {
					if (val.match(/__/)) {
						attr.value = substitute(val, data);
					}
				}
			}
		}
	}
};

// The main function
export const rplc8 = function (elem: string | Element, data: any, cb?: Function) {
	// If elem isn't a DOM element, then it has to be query selector string
	if (!(elem instanceof HTMLElement)) {
		if (typeof elem !== "string") {
			console.error("rplc8: invalid selector string");
			return;
		}

		const selector = elem.toString();
		elem = document.querySelectorAll(selector)[0];

		if (!elem) {
			console.error("rplc8: element not found", selector);
			return;
		}
	}

	let mom = elem.parentNode; // Almost certainly not null.
	let clones: any[] = [];

	mom?.removeChild(elem); // Take template out of the DOM.

	let validate_data = function (data: any) {
		// Ensure that data is an array or object
		if (!(data instanceof Array)) {
			// If it's a single object, put it into an array.
			if (typeof data === "object") {
				data = [data];
			} else {
				data = [];
				//throw new Error( "rplc8: Replication is neither array nor object." );
			}
		}

		// Ensure that the first element in the array is an object.
		if (data.length > 0 && typeof data[0] !== "object") {
			throw new Error("rplc8: Replication data array does not contain objects.");
		}

		return data;
	};

	let splice = function (index: number, remove_count: number, new_data?: any, cb?: Function) {
		if (index < 0) {
			index = clones.length + index;
		}
		if (index > clones.length) {
			index = clones.length;
		}

		let sib = clones[index] || null;

		if (index < clones.length) {
			// remove the old clones
			let n = 0;
			while (n < remove_count && index < clones.length) {
				let clone = clones.splice(index, 1)[0];
				sib = clone.nextSibling;
				mom?.removeChild(clone);
				n += 1;
			}
		}

		// insert new clones if data provided
		if (new_data) {
			data = validate_data(new_data);
			let n = 0;
			while (n < data.length) {
				let d = data[n]; // Get data object from array.
				let clone = elem.cloneNode(true); // Clone template element and
				inject(clone as HTMLElement, d); // inject the data.
				mom?.insertBefore(clone, sib); // Insert it into the DOM
				let i = index + n;
				clones.splice(i, 0, clone); // insert clone into array
				if (cb) {
					// If call back function provided,
					// then call it with a refreshing function
					cb(clone, d, i, function (new_data: any, cb?: Function) {
						splice(i, 1, new_data, cb);
					});
				}
				n += 1;
			}
		}

		return { elem, splice, append, prepend, update, clear };
	};

	let append = function (data: any, cb?: Function) {
		return splice(clones.length, 0, data, cb);
	};

	let prepend = function (data: any, cb?: Function) {
		return splice(0, 0, data, cb);
	};

	let update = function (data: any, cb?: Function) {
		return splice(0, clones.length, data, cb);
	};

	let clear = function (index: number, count: number) {
		return splice(index || 0, count || clones.length);
	};

	update(data, cb);

	return {
		elem,
		splice,
		append,
		prepend,
		update,
		clear,
	};
};
