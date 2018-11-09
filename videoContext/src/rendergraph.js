/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-09 16:47:27
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-09 17:03:05
*/

import { ConnectException } from "./exceptions.js";

class RenderGraph {

	constructor() {
		this.connections = [];
	}

	getOutputsForNode(node) {
		let results = [];
		this.connections.forEach(function(connection){
			if(connection.source === node) {
				results.push(connection.destination);
			}
		});
		return results;
	}

	/**
	 * 
	 */



}