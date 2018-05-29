class Father {
	constructor() {
		this.x = 1;
		this.foo();
		console.log('state', this.constructor);
	}
	foo() {
		console.log('bar');
	}
}
class Child extends Father{
	constructor() {
		super();	
		console.log('x:', this.x);
	}
	foo() {
		console.log('foo');
		super.foo();
	}
}
var x = new Child();

function test(lala = []) {
	console.log(lala);
}
test(undefined);

