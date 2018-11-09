/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-05 10:53:53
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-05 11:01:04
*/

import MediaNode from './medianode'

class VideoNode extends MediaNode {

	constructor() {
		super(...arguments);
		this._displayName = 'VideoNode';
		this._elementType = 'video';
	}

}

export default VideoNode;