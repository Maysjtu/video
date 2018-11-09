/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-09 14:29:08
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-09 15:22:50
*/

import { mediaElementHasSource } from "./utils.js"

class VideoElementCache {
	constructor(cache_size = 3) {
		this._elements = [];
		this._elementsInitialised = false;
		for(let i = 0; i < cache_size; i++) {
			let element = this._createElement();
			this._elements.push(element);
		}	
	}

	_createElement() {
		let videoElement = document.createElement("video");
		videoElement.setAttribute("crossorigin", "anonymous");
		videoElement.setAttribute("webkit-playsinline", "");
		videoElement.setAttribute("playsinline", "");
		return videoElement;	
	}

	init() {
		if(!this._elementsInitialised) {
			for (let element of this._elements) {
				try {
					element.play().then(
						() => {},
						e => {
							//@todo why this
							if(e.name !== 'NotSuppoertedError') throw e;
						}
					);
				} catch(e) {

				}
			}
		}
		this._elementsInitialised = true;
	}

	get() {
		for(let element of this._elements) {
			if(!mediaElementHasSource(element)) {
				return element;
			}
		}
		//Fallback to creating a new element if non exists.
		console.debug(
			 "No available vidoe element in the cache, creating a new one.This may break mobile, make your initial cache larger."
			);
		let element = this._createElement();
		this._elements.push(element);
		this._elementsInitialised = false;
		return element;
	}

	get length() {
		return this._elements.length;
	}

	get unused() {
		let count = 0;
		for(let element of this._elements) {
			if(!mediaElementHasSource(element)) {
				count += 1;
			}
		}
		return count;
	}
}

export default VideoElementCache;





