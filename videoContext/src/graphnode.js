/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-05 11:11:12
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-05 11:27:15
*/

class GraphNode {
	/**
	 * 派生出所有处理和源节点的基类
	 */
	constructor(gl, renderGraph, inputNames, limitConnections = false) {
		this._renderGraph = renderGraph;
		this._limitConnections = limitConnections;
		this._inputNames = inputNames;
		this._destroyed = false;

		this._gl = gl;
		this._renderGraph = renderGraph;
		this._rendered = false;
		this._displayName = 'GraphNode';
	}

	get displayName() {
		return this._displayName;
	}
	get inputNames() {
		return ths._inputNames.slice();
	}
	get maximumConnections(){
		if(this._limitConnections === false) return Infinity;
		return this._inputNames.length;
	}
	get inputs() {
		let result = this._renderGraph.getInputsForNode(this);
		result = result.filter(function(n){
			return n !== undefined;
		})
		return result;
	}
	get outputs(){
		return this._renderGraph.getOutputsForNode(this);
	}
	get destroyed() {
		return this._destroyed;
	}
	/**
	 * Connect this node to the targetNode
	 */
	connect(targetNode, targetPort){
		return this._renderGraph.registerConnections(this, targetNode, targetPort);
	}
	disconnect(targetNode) {
		if(targetNode === undefined){
			let toRemove = this._renderGraph.getOutputsForNode(this);
			toRemove.forEach(target => this._renderGraph.unregisterConnection(this, target));
			if(toRemove.length > 0) return true;
			return false;
		}
		return this._renderGraph.unregisterConnection(this, targetNode);
	}
	destroy() {
		this.disconnect();
		for(let input of this.inputs) {
			input.disconnect(this);
		}
		this.destroyed = true;
	}
}

export default GraphNode;

