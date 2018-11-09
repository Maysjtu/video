/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-05 15:03:52
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-09 14:56:57
*/

import DEFINATIONS from "./Definations/definations.js";
import { SOURCENODESTATE } from "./SourceNodes/sourcenode.js";

export function compileShader(gl, shaderSource, shaderType) {
	let shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(!success) {
		throw "could not compile shader:" + gl.getShaderInfoLog(shader);
	}
	return shader;
}

export function createShaderProgram(gl, vertexShader, fragmentShader) {
	let program = gl.createProgram();

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw {
			error: 4,
			msg: "Can't link shader program for track",
			toString: function(){
				return this.msg;
			}
		}
	}
	return program;
}
export function createElementTexture(gl) {
	let texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	//Set the parameters so we can render any size image.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	//Initialise the texture unit to clear.
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, type);
	
	return texture;

}
export function updateTexture(gl, texture, element){
	if(element.readyState !== undefined && element.readyState === 0) return;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
}

export function clearTexture(gl, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
}

export function generateRandomId() {
    const appearanceAdjective = [
        "adorable",
        "alert",
        "average",
        "beautiful",
        "blonde",
        "bloody",
        "blushing",
        "bright",
        "clean",
        "clear",
        "cloudy",
        "colourful",
        "concerned",
        "crowded",
        "curious",
        "cute",
        "dark",
        "dirty",
        "drab",
        "distinct",
        "dull",
        "elegant",
        "fancy",
        "filthy",
        "glamorous",
        "gleaming",
        "graceful",
        "grotesque",
        "homely",
        "light",
        "misty",
        "motionless",
        "muddy",
        "plain",
        "poised",
        "quaint",
        "scary",
        "shiny",
        "smoggy",
        "sparkling",
        "spotless",
        "stormy",
        "strange",
        "ugly",
        "unsightly",
        "unusual"
    ];
    const conditionAdjective = [
        "alive",
        "brainy",
        "broken",
        "busy",
        "careful",
        "cautious",
        "clever",
        "crazy",
        "damaged",
        "dead",
        "difficult",
        "easy",
        "fake",
        "false",
        "famous",
        "forward",
        "fragile",
        "guilty",
        "helpful",
        "helpless",
        "important",
        "impossible",
        "infamous",
        "innocent",
        "inquisitive",
        "mad",
        "modern",
        "open",
        "outgoing",
        "outstanding",
        "poor",
        "powerful",
        "puzzled",
        "real",
        "rich",
        "right",
        "robust",
        "sane",
        "scary",
        "shy",
        "sleepy",
        "stupid",
        "super",
        "tame",
        "thick",
        "tired",
        "wild",
        "wrong"
    ];
    const nounAnimal = [
        "manatee",
        "gila monster",
        "nematode",
        "seahorse",
        "slug",
        "koala bear",
        "giant tortoise",
        "garden snail",
        "starfish",
        "sloth",
        "american woodcock",
        "coral",
        "swallowtail butterfly",
        "house sparrow",
        "sea anemone"
    ];

    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function capitalize(word) {
        word = word.replace(/\b\w/g, l => l.toUpperCase());
        return word;
    }

    let name =
        randomChoice(appearanceAdjective) +
        " " +
        randomChoice(conditionAdjective) +
        " " +
        randomChoice(nounAnimal);
    name = capitalize(name);
    name = name.replace(/ /g, "-");
    return name;
}

export function mediaElementHasSource({ src, srcObject }) {
    return !((src === "" || src === undefined) && srcObject == null);
}




